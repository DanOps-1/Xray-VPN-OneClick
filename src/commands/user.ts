/**
 * User Command Handler
 *
 * Handles user-related commands (list, add, delete, show)
 *
 * @module commands/user
 */

import { UserManager } from '../services/user-manager';
import { QuotaManager } from '../services/quota-manager';
import { TrafficManager } from '../services/traffic-manager';
import { maskSensitiveValue } from '../utils/format';
import { copyToClipboard } from '../utils/clipboard';
import { formatTraffic, formatUsageSummary, calculateUsagePercent, getAlertLevel } from '../utils/traffic-formatter';
import { promptQuotaInput } from './quota';
import logger from '../utils/logger';
import chalk from 'chalk';
import ora from 'ora';
import { confirm, input } from '@inquirer/prompts';
import { menuIcons } from '../constants/ui-symbols';
import { renderHeader } from '../utils/layout';
import layoutManager from '../services/layout-manager';

/**
 * User command options
 */
export interface UserCommandOptions {
  /** Config file path */
  configPath?: string;

  /** Service name */
  serviceName?: string;

  /** JSON output mode */
  json?: boolean;
}

/**
 * List all users
 *
 * @param options - Command options
 */
export async function listUsers(options: UserCommandOptions = {}): Promise<void> {
  try {
    const manager = new UserManager(options.configPath, options.serviceName);
    const quotaManager = new QuotaManager();
    const trafficManager = new TrafficManager();

    const spinner = ora('正在获取用户列表...').start();

    const users = await manager.listUsers();
    const quotas = await quotaManager.getAllQuotas();
    const usages = await trafficManager.getAllUsage();

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(users, null, 2));
      return;
    }

    logger.newline();
    logger.separator();

    // Use responsive header
    const terminalSize = layoutManager.detectTerminalSize();
    const headerTitle = `${menuIcons.USER} 用户列表 (共 ${users.length} 个用户)`;
    const headerText = renderHeader(headerTitle, terminalSize.width, 'left');
    console.log(chalk.bold.cyan(headerText));

    logger.separator();
    logger.newline();

    if (users.length === 0) {
      console.log(chalk.gray('  暂无用户'));
      logger.newline();
      return;
    }

    // Display users with quota and traffic info
    for (const user of users) {
      const quota = quotas[user.email];
      const usage = usages.find((u) => u.email === user.email);

      // Calculate usage percentage and alert level
      const usedBytes = usage?.total || quota?.usedBytes || 0;
      const quotaBytes = quota?.quotaBytes ?? -1;
      const percent = calculateUsagePercent(usedBytes, quotaBytes);
      const alertLevel = getAlertLevel(percent);

      // Color based on alert level
      const getColorFn = (level: 'normal' | 'warning' | 'exceeded'): ((_text: string) => string) => {
        switch (level) {
          case 'exceeded':
            return chalk.red;
          case 'warning':
            return chalk.yellow;
          default:
            return chalk.green;
        }
      };
      const colorFn = getColorFn(alertLevel);

      // Status indicator
      const statusIcon = alertLevel === 'exceeded' ? '[!]' : alertLevel === 'warning' ? '[~]' : '[+]';

      // User info line
      console.log(`  ${colorFn(statusIcon)} ${chalk.white(user.email)}`);
      console.log(`     UUID: ${chalk.gray(maskSensitiveValue(user.id))}`);

      // Quota and usage info
      if (quota) {
        const quotaDisplay = quotaBytes < 0 ? '无限制' : formatTraffic(quotaBytes).display;
        const usageDisplay = formatUsageSummary(usedBytes, quotaBytes);
        console.log(`     配额: ${chalk.cyan(quotaDisplay)} | 使用: ${colorFn(usageDisplay)}`);
      } else {
        console.log(`     配额: ${chalk.gray('未设置')}`);
      }

      logger.newline();
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Add a new user
 *
 * @param options - Command options
 */
export async function addUser(options: UserCommandOptions = {}): Promise<void> {
  try {
    const manager = new UserManager(options.configPath, options.serviceName);

    // Prompt for email
    const email = await input({
      message: '请输入用户邮箱:',
      validate: (value) => {
        if (!value || !value.includes('@')) {
          return '请输入有效的邮箱地址';
        }
        return true;
      },
    });

    // Prompt for level
    const levelStr = await input({
      message: '请输入用户等级 (默认 0):',
      default: '0',
    });
    const level = parseInt(levelStr, 10);

    const spinner = ora('正在添加用户...').start();

    const user = await manager.addUser({ email, level });

    spinner.succeed(chalk.green('用户添加成功！'));

    logger.newline();
    console.log(chalk.cyan('  邮箱: ') + chalk.white(user.email));
    console.log(chalk.cyan('  UUID: ') + chalk.white(user.id));
    console.log(chalk.cyan('  等级: ') + chalk.white(user.level));
    logger.newline();

    logger.success('服务已自动重启');

    // Ask if user wants to set a quota
    const setQuotaNow = await confirm({
      message: '是否为该用户设置流量配额？',
      default: false,
    });

    if (setQuotaNow) {
      const quotaBytes = await promptQuotaInput();
      const quotaManager = new QuotaManager();

      await quotaManager.setQuota({
        email: user.email,
        quotaBytes,
        quotaType: quotaBytes < 0 ? 'unlimited' : 'limited',
      });

      const quotaDisplay = quotaBytes < 0 ? '无限制' : formatTraffic(quotaBytes).display;
      logger.success(`已设置配额: ${quotaDisplay}`);
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Delete a user
 *
 * @param options - Command options
 */
export async function deleteUser(options: UserCommandOptions = {}): Promise<void> {
  try {
    const manager = new UserManager(options.configPath, options.serviceName);

    // List users first
    const users = await manager.listUsers();

    if (users.length === 0) {
      logger.warn('暂无用户可删除');
      return;
    }

    logger.newline();
    console.log(chalk.bold('📋 现有用户:'));
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email} (${maskSensitiveValue(u.id)})`);
    });
    logger.newline();

    // Prompt for user ID
    const userId = await input({
      message: '请输入要删除的用户 UUID (或输入序号):',
    });

    // Check if input is a number (index)
    let targetId = userId;
    const index = parseInt(userId, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < users.length) {
      targetId = users[index].id;
    }

    // Confirm deletion
    const confirmed = await confirm({
      message: chalk.yellow(`⚠️  确定要删除用户吗？此操作不可恢复。`),
      default: false,
    });

    if (!confirmed) {
      logger.info('已取消删除操作');
      return;
    }

    const spinner = ora('正在删除用户...').start();

    await manager.deleteUser(targetId);

    spinner.succeed(chalk.green('用户删除成功！'));
    logger.success('服务已自动重启');
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Show user share information
 *
 * @param options - Command options
 */
export async function showUserShare(options: UserCommandOptions = {}): Promise<void> {
  try {
    const manager = new UserManager(options.configPath, options.serviceName);

    // List users first
    const users = await manager.listUsers();

    if (users.length === 0) {
      logger.warn('暂无用户');
      return;
    }

    logger.newline();
    console.log(chalk.bold('📋 现有用户:'));
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email}`);
    });
    logger.newline();

    // Prompt for user ID
    const userId = await input({
      message: '请输入要查看的用户 UUID (或输入序号):',
    });

    // Check if input is a number (index)
    let targetId = userId;
    const index = parseInt(userId, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < users.length) {
      targetId = users[index].id;
    }

    const shareInfo = await manager.getShareInfo(targetId);

    if (options.json) {
      console.log(JSON.stringify(shareInfo, null, 2));
      return;
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan('📤 分享信息'));
    logger.separator();
    logger.newline();

    console.log(chalk.cyan('  邮箱: ') + chalk.white(shareInfo.user.email));
    console.log(chalk.cyan('  UUID: ') + chalk.white(shareInfo.user.id));
    logger.newline();

    console.log(chalk.cyan('  VLESS 链接:'));
    console.log(chalk.white(`  ${shareInfo.shareLink}`));
    logger.newline();

    // Try to copy to clipboard
    const copied = await copyToClipboard(shareInfo.shareLink);
    if (copied) {
      logger.success('链接已复制到剪贴板');
    } else {
      logger.hint('可以手动复制上方链接');
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}
