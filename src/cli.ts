#!/usr/bin/env node

/**
 * Xray Manager CLI Entry Point
 *
 * This is the main entry point for the CLI tool.
 * It performs preflight checks and launches the interactive menu.
 *
 * @module cli
 */

import { Command } from 'commander';
import updateNotifier from 'update-notifier';
import logger from './utils/logger';
import { ExitCode, gracefulExit } from './constants/exit-codes';
import { preflightChecks } from './utils/preflight';
import { startInteractiveMenu } from './commands/interactive';
import { registerReviewCommand } from './commands/review';
import { registerClashCommand } from './commands/clash';
import { showSplash } from './utils/splash';

// Read package.json for version
const packageJson = require('../package.json');

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  // Show splash screen animation
  await showSplash(packageJson.version);

  // Show star request message
  logger.newline();
  logger.info('⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！');
  logger.info('   https://github.com/DanOps-1/Xray-VPN-OneClick');
  logger.info('   你的 Star 是我持续更新的最大动力 🙏');
  logger.newline();

  // Check for updates (after splash to avoid being cleared)
  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 0, // Check every time
  });

  if (notifier.update) {
    logger.newline();
    notifier.notify({
      isGlobal: true,
      defer: false,
    });
    logger.newline();
  }

  // Create Commander program
  const program = new Command();

  program
    .name('xray-manager')
    .description('Xray VPN 服务管理 CLI 工具')
    .version(packageJson.version, '-v, --version', '显示版本号')
    .helpOption('-h, --help', '显示帮助信息');

  // Global options
  program
    .option('--config <path>', '指定配置文件路径')
    .option('--service <name>', '指定服务名称', 'xray')
    .option('--json', '以 JSON 格式输出')
    .option('--no-color', '禁用彩色输出')
    .option('--verbose', '详细输出模式');

  registerReviewCommand(program);
  registerClashCommand(program);

  // Default action: start interactive menu when no command provided
  program.action(async () => {
    const options = program.opts();

    // Configure logger based on options
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
        logger.error('预检查失败 - 无法启动菜单');
        preflightResult.errors.forEach((error) => logger.error(`  • ${error}`));

        if (preflightResult.suggestions.length > 0) {
          logger.hint('建议解决方案:');
          preflightResult.suggestions.forEach((suggestion) => logger.info(`  • ${suggestion}`));
        }

        await gracefulExit(ExitCode.SERVICE_ERROR);
      }

      // Show warnings but continue
      if (preflightResult.warnings.length > 0) {
        preflightResult.warnings.forEach((warning) => logger.warn(warning));
        logger.newline();
      }

      // Start interactive menu
      await startInteractiveMenu({
        configPath: options.config,
        serviceName: options.service,
        jsonOutput: options.json,
        verbose: options.verbose,
      });

      await gracefulExit(ExitCode.SUCCESS);
    } catch (error) {
      logger.error('启动菜单时出错:');
      logger.error((error as Error).message);

      if (options.verbose && error instanceof Error) {
        logger.error('Stack trace:');
        logger.error(error.stack || 'No stack trace available');
      }

      await gracefulExit(ExitCode.GENERAL_ERROR);
    }
  });

  // Parse and execute
  await program.parseAsync(process.argv);
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  logger.newline();
  logger.info('[退出] 程序已中断');
  await gracefulExit(ExitCode.SIGINT);
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  logger.error('未捕获的异常:');
  logger.error(error.message);
  await gracefulExit(ExitCode.GENERAL_ERROR);
});

process.on('unhandledRejection', async (reason) => {
  logger.error('未处理的 Promise 拒绝:');
  logger.error(String(reason));
  await gracefulExit(ExitCode.GENERAL_ERROR);
});

// Run main function
main().catch(async (error) => {
  logger.error('Fatal error:');
  logger.error(error.message);
  await gracefulExit(ExitCode.GENERAL_ERROR);
});
