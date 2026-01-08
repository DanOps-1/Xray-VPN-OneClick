/**
 * Config Command Handler
 *
 * Handles configuration-related commands (view, backup, restore, modify)
 *
 * @module commands/config
 */

import { ConfigManager } from '../services/config-manager';
import { SystemdManager } from '../services/systemd-manager';
import logger from '../utils/logger';
import chalk from 'chalk';
import ora from 'ora';
import { confirm, input, select } from '@inquirer/prompts';
import { basename } from 'path';

/**
 * Config command options
 */
export interface ConfigCommandOptions {
  /** Config file path */
  configPath?: string;

  /** Service name */
  serviceName?: string;

  /** JSON output mode */
  json?: boolean;
}

/**
 * Display current configuration
 *
 * @param options - Command options
 */
export async function viewConfig(options: ConfigCommandOptions = {}): Promise<void> {
  try {
    const manager = new ConfigManager(options.configPath);
    const config = await manager.readConfig();

    if (options.json) {
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan('⚙️  当前配置'));
    logger.separator();
    logger.newline();

    // Display main config sections
    console.log(chalk.cyan('  日志配置:'));
    if (config.log) {
      console.log(chalk.gray(`    级别: ${config.log.loglevel || 'warning'}`));
      console.log(chalk.gray(`    路径: ${config.log.access || 'none'}`));
    } else {
      console.log(chalk.gray('    未配置'));
    }
    logger.newline();

    console.log(chalk.cyan('  入站配置:'));
    for (const inbound of config.inbounds || []) {
      console.log(chalk.gray(`    协议: ${inbound.protocol}`));
      console.log(chalk.gray(`    端口: ${inbound.port}`));
      console.log(chalk.gray(`    标签: ${inbound.tag || 'default'}`));
      if (inbound.settings?.clients) {
        console.log(chalk.gray(`    用户数: ${inbound.settings.clients.length}`));
      }
      logger.newline();
    }

    console.log(chalk.cyan('  出站配置:'));
    for (const outbound of config.outbounds || []) {
      console.log(chalk.gray(`    协议: ${outbound.protocol}`));
      console.log(chalk.gray(`    标签: ${outbound.tag || 'default'}`));
      logger.newline();
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Create a configuration backup
 *
 * @param options - Command options
 */
export async function backupConfig(options: ConfigCommandOptions = {}): Promise<void> {
  try {
    const manager = new ConfigManager(options.configPath);

    const spinner = ora('正在备份配置...').start();

    const backupPath = await manager.backupConfig();

    spinner.succeed(chalk.green('✅ 配置备份成功！'));

    logger.newline();
    console.log(chalk.cyan('  备份文件: ') + chalk.white(backupPath));
    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * List all configuration backups
 *
 * @param options - Command options
 */
export async function listBackups(options: ConfigCommandOptions = {}): Promise<void> {
  try {
    const manager = new ConfigManager(options.configPath);
    const backups = await manager.listBackups();

    if (options.json) {
      console.log(JSON.stringify(backups, null, 2));
      return;
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(`💾 配置备份列表 (共 ${backups.length} 个备份)`));
    logger.separator();
    logger.newline();

    if (backups.length === 0) {
      console.log(chalk.gray('  暂无备份'));
      logger.newline();
      return;
    }

    // Display backups
    for (let i = 0; i < backups.length; i++) {
      const backup = backups[i];
      const filename = basename(backup);

      // Extract timestamp from filename (config.YYYY-MM-DDTHH-MM-SS-sssZ.json)
      const timestampMatch = filename.match(/config\.(.+)\.json/);
      const timestamp = timestampMatch
        ? timestampMatch[1].replace(/-/g, ':').replace(/T(\d{2}):(\d{2}):(\d{2})/, 'T$1-$2-$3')
        : 'unknown';

      console.log(chalk.cyan(`  ${i + 1}. ${filename}`));
      console.log(chalk.gray(`     时间: ${timestamp}`));
      console.log(chalk.gray(`     路径: ${backup}`));
      logger.newline();
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Restore configuration from backup
 *
 * @param options - Command options
 */
export async function restoreConfig(options: ConfigCommandOptions = {}): Promise<void> {
  try {
    const manager = new ConfigManager(options.configPath);
    const systemdManager = new SystemdManager(options.serviceName || 'xray');

    // List backups first
    const backups = await manager.listBackups();

    if (backups.length === 0) {
      logger.warn('暂无备份可恢复');
      return;
    }

    logger.newline();
    console.log(chalk.bold('📋 可用备份:'));
    backups.forEach((backup, i) => {
      const filename = basename(backup);
      console.log(`  ${i + 1}. ${filename}`);
    });
    logger.newline();

    // Prompt for backup selection
    const backupInput = await input({
      message: '请输入要恢复的备份序号或完整路径:',
    });

    // Check if input is a number (index)
    let targetBackup = backupInput;
    const index = parseInt(backupInput, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < backups.length) {
      targetBackup = backups[index];
    }

    // Confirm restoration
    const confirmed = await confirm({
      message: chalk.yellow(`⚠️  确定要从备份恢复配置吗？当前配置将被覆盖（会先自动备份）。`),
      default: false,
    });

    if (!confirmed) {
      logger.info('已取消恢复操作');
      return;
    }

    const spinner = ora('正在恢复配置...').start();

    await manager.restoreConfig(targetBackup);

    spinner.succeed(chalk.green('✅ 配置恢复成功！'));

    logger.newline();

    // Ask if user wants to restart service
    const shouldRestart = await confirm({
      message: chalk.yellow('是否立即重启服务以应用新配置？'),
      default: true,
    });

    if (shouldRestart) {
      const restartSpinner = ora('正在重启服务...').start();
      await systemdManager.restart();
      restartSpinner.succeed(chalk.green('✅ 服务重启成功！'));
    } else {
      logger.info('💡 请记得手动重启服务以应用新配置');
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Modify configuration item
 *
 * @param options - Command options
 */
export async function modifyConfig(options: ConfigCommandOptions = {}): Promise<void> {
  try {
    const manager = new ConfigManager(options.configPath);
    const systemdManager = new SystemdManager(options.serviceName || 'xray');

    logger.newline();
    console.log(chalk.bold('⚙️  配置修改'));
    logger.newline();

    // Common config items
    const configItems = [
      { name: '日志级别 (log.loglevel)', value: 'log.loglevel' },
      { name: '访问日志路径 (log.access)', value: 'log.access' },
      { name: '错误日志路径 (log.error)', value: 'log.error' },
      { name: '自定义路径', value: 'custom' },
    ];

    const itemChoice = await select({
      message: '请选择要修改的配置项:',
      choices: configItems,
    });

    let path = itemChoice;

    if (itemChoice === 'custom') {
      path = await input({
        message: '请输入配置项路径 (例如: log.loglevel):',
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return '配置项路径不能为空';
          }
          return true;
        },
      });
    }

    // Get current value
    const currentConfig = await manager.readConfig();
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentValue: any = currentConfig;
    for (const part of parts) {
      currentValue = currentValue?.[part];
    }

    console.log(chalk.gray(`  当前值: ${currentValue !== undefined ? currentValue : '(未设置)'}`));
    logger.newline();

    // Prompt for new value
    const newValueStr = await input({
      message: '请输入新值:',
    });

    // Try to parse as JSON for non-string values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newValue: any = newValueStr;
    try {
      newValue = JSON.parse(newValueStr);
    } catch {
      // Keep as string
    }

    // Confirm modification
    const confirmed = await confirm({
      message: chalk.yellow(`⚠️  确定要修改配置项 "${path}" 吗？`),
      default: false,
    });

    if (!confirmed) {
      logger.info('已取消修改操作');
      return;
    }

    const spinner = ora('正在修改配置...').start();

    // Backup first
    await manager.backupConfig();

    // Modify
    await manager.modifyConfigItem(path, newValue);

    spinner.succeed(chalk.green('✅ 配置修改成功！'));

    logger.newline();

    // Ask if user wants to restart service
    const shouldRestart = await confirm({
      message: chalk.yellow('是否立即重启服务以应用新配置？'),
      default: true,
    });

    if (shouldRestart) {
      const restartSpinner = ora('正在重启服务...').start();
      await systemdManager.restart();
      restartSpinner.succeed(chalk.green('✅ 服务重启成功！'));
    } else {
      logger.info('💡 请记得手动重启服务以应用新配置');
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}
