/**
 * Clash config export command
 *
 * @module commands/clash
 */

import type { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import logger from '../utils/logger';
import { DEFAULT_PATHS } from '../constants/paths';
import { parseVlessLink } from '../utils/vless-link';
import { buildClashConfigYaml } from '../services/clash-config';

interface ClashExportResult {
  outputPath: string;
  proxyName: string;
  proxyGroupName: string;
}

interface ClashExportOptions {
  link?: string;
  outputPath?: string;
  proxyName?: string;
  json?: boolean;
  force?: boolean;
  promptLink?: boolean;
  promptOutputPath?: boolean;
  promptOverwrite?: boolean;
}

interface ClashCommandOptions {
  link?: string;
  out?: string;
  name?: string;
  json?: boolean;
  force?: boolean;
}

function normalizeOutputPath(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('~/')) {
    return join(homedir(), trimmed.slice(2));
  }
  return trimmed || DEFAULT_PATHS.CLASH_CONFIG_FILE;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeClashConfigFile(options: ClashExportOptions): Promise<ClashExportResult | null> {
  const rawLink = options.link || '';
  const link = rawLink.trim();
  if (!link) {
    throw new Error('未提供 VLESS 链接');
  }

  const outputPath = normalizeOutputPath(options.outputPath || DEFAULT_PATHS.CLASH_CONFIG_FILE);
  const info = parseVlessLink(link);
  const { yaml, proxyName, proxyGroupName } = buildClashConfigYaml(info, { proxyName: options.proxyName });

  const exists = await fileExists(outputPath);
  if (exists && !options.force) {
    if (options.promptOverwrite) {
      const overwrite = await confirm({
        message: chalk.yellow(`输出文件已存在，是否覆盖？\n${outputPath}`),
        default: false,
      });
      if (!overwrite) {
        logger.info('已取消生成 Clash 配置');
        return null;
      }
    } else {
      throw new Error(`输出文件已存在: ${outputPath}`);
    }
  }

  await fs.mkdir(dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, yaml, 'utf8');

  return {
    outputPath,
    proxyName,
    proxyGroupName,
  };
}

export async function exportClashConfigFromLink(options: ClashExportOptions = {}): Promise<void> {
  try {
    let link = options.link;
    if (!link && options.promptLink) {
      link = await input({
        message: '请输入 VLESS 链接:',
      });
    }

    let outputPath = options.outputPath;
    if (options.promptOutputPath) {
      const outputInput = await input({
        message: '请输入 Clash 配置输出路径:',
        default: options.outputPath || DEFAULT_PATHS.CLASH_CONFIG_FILE,
      });
      outputPath = outputInput;
    }

    const result = await writeClashConfigFile({
      ...options,
      link,
      outputPath,
    });

    if (!result) {
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan('📄 Clash 配置已生成'));
    logger.separator();
    logger.newline();
    console.log(chalk.cyan('  输出路径: ') + chalk.white(result.outputPath));
    console.log(chalk.cyan('  节点名称: ') + chalk.white(result.proxyName));
    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

export function registerClashCommand(program: Command): void {
  program
    .command('clash')
    .description('从 VLESS 分享链接生成 Clash 配置文件')
    .option('--link <vless>', 'VLESS 分享链接')
    .option('--out <path>', 'Clash 配置输出路径', DEFAULT_PATHS.CLASH_CONFIG_FILE)
    .option('--name <name>', '节点名称（覆盖链接内名称）')
    .option('--json', '以 JSON 格式输出结果')
    .option('-f, --force', '覆盖已存在的输出文件')
    .action(async (options: ClashCommandOptions) => {
      await exportClashConfigFromLink({
        link: options.link,
        outputPath: options.out,
        proxyName: options.name,
        json: options.json,
        force: options.force,
        promptLink: !options.link,
        promptOutputPath: false,
        promptOverwrite: true,
      });
    });
}
