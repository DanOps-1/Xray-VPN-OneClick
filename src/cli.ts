/**
 * Xray Manager CLI Entry Point
 *
 * Renders the React+Ink based terminal UI.
 *
 * @module cli
 */

import { Command } from 'commander';
import updateNotifier from 'update-notifier';
import React from 'react';
import { render } from 'ink';
import logger from './utils/logger.js';
import { ExitCode, gracefulExit } from './constants/exit-codes.js';
import { preflightChecks } from './utils/preflight.js';
import { registerReviewCommand } from './commands/review.js';
import { registerClashCommand } from './commands/clash.js';
import { App } from './app/App.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  // Check for updates
  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24, // Daily
  });

  if (notifier.update) {
    notifier.notify({ isGlobal: true, defer: false });
  }

  // Create Commander program
  const program = new Command();

  program
    .name('xray-manager')
    .description('Xray VPN Service Manager')
    .version(packageJson.version, '-v, --version', 'Show version')
    .helpOption('-h, --help', 'Show help');

  // Global options
  program
    .option('--config <path>', 'Specify config file path')
    .option('--service <name>', 'Specify service name', 'xray')
    .option('--json', 'JSON output mode')
    .option('--no-color', 'Disable colored output')
    .option('--verbose', 'Verbose output mode');

  registerReviewCommand(program);
  registerClashCommand(program);

  // Default action: start interactive Ink UI
  program.action(async () => {
    const options = program.opts();

    if (options.noColor) {
      logger.configure({ color: false });
    }

    try {
      // Perform preflight checks
      const preflightResult = await preflightChecks({
        checkSystemd: true,
        checkXray: false,
        checkConfig: false,
      });

      if (!preflightResult.passed && preflightResult.critical) {
        logger.error('Preflight check failed');
        preflightResult.errors.forEach((error) => logger.error(`  \u2022 ${error}`));

        if (preflightResult.suggestions.length > 0) {
          logger.hint('Suggestions:');
          preflightResult.suggestions.forEach((s) => logger.info(`  \u2022 ${s}`));
        }

        await gracefulExit(ExitCode.SERVICE_ERROR);
      }

      if (preflightResult.warnings.length > 0) {
        preflightResult.warnings.forEach((w) => logger.warn(w));
      }

      // Render the Ink app
      const { waitUntilExit } = render(
        React.createElement(App, {
          options: {
            configPath: options.config,
            serviceName: options.service,
          },
          version: packageJson.version,
        })
      );

      await waitUntilExit();
      await gracefulExit(ExitCode.SUCCESS);
    } catch (error) {
      logger.error('Error starting application:');
      logger.error((error as Error).message);

      if (options.verbose && error instanceof Error) {
        logger.error(error.stack || 'No stack trace');
      }

      await gracefulExit(ExitCode.GENERAL_ERROR);
    }
  });

  // Parse and execute
  await program.parseAsync(process.argv);
}

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  await gracefulExit(ExitCode.GENERAL_ERROR);
});

process.on('unhandledRejection', async (reason) => {
  logger.error(`Unhandled rejection: ${String(reason)}`);
  await gracefulExit(ExitCode.GENERAL_ERROR);
});

// Run
main().catch(async (error) => {
  logger.error(`Fatal: ${error.message}`);
  await gracefulExit(ExitCode.GENERAL_ERROR);
});
