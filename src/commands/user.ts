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
import {
  formatTraffic,
  formatUsageSummary,
  calculateUsagePercent,
  getAlertLevel,
} from '../utils/traffic-formatter';
import { promptQuotaInput } from './quota';
import { exportClashConfigFromLink } from './clash';
import logger from '../utils/logger';
import chalk from 'chalk';
import ora from 'ora';
import { confirm, input } from '@inquirer/prompts';
import { menuIcons } from '../constants/ui-symbols';
import { renderHeader } from '../utils/layout';
import layoutManager from '../services/layout-manager';
import { AppError } from '../utils/errors';
import qrcode from 'qrcode-terminal';

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

    const statsAvailable = await trafficManager.isUsageAvailable();

    const spinner = ora('正在获取用户列表...').start();

    const users = await manager.listUsers();
    const quotas = await quotaManager.getAllQuotas();
    const usages = statsAvailable ? await trafficManager.getAllUsage() : [];

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

    if (!statsAvailable) {
      console.log(chalk.yellow('  流量统计未启用，无法显示实际使用量。'));
      console.log(chalk.gray('  提示: 配额管理 → 配置 Stats API'));
      logger.newline();
    }

    // Display users with quota and traffic info
    for (const user of users) {
      const quota = quotas[user.email];
      const usage = statsAvailable ? usages.find((u) => u.email === user.email) : undefined;

      // Calculate usage percentage and alert level
      const usedBytes = statsAvailable ? usage?.total || 0 : 0;
      const quotaBytes = quota?.quotaBytes ?? -1;
      const percent = statsAvailable ? calculateUsagePercent(usedBytes, quotaBytes) : 0;
      const alertLevel = statsAvailable ? getAlertLevel(percent) : 'normal';

      // Color based on alert level
      const getColorFn = (
        level: 'normal' | 'warning' | 'exceeded'
      ): ((_text: string) => string) => {
        switch (level) {
          case 'exceeded':
            return chalk.red;
          case 'warning':
            return chalk.yellow;
          default:
            return chalk.green;
        }
      };
      const colorFn = statsAvailable ? getColorFn(alertLevel) : chalk.gray;

      // Status indicator
      const statusIcon = statsAvailable
        ? alertLevel === 'exceeded'
          ? '[!]'
          : alertLevel === 'warning'
            ? '[~]'
            : '[+]'
        : '[?]';

      // User info line
      console.log(`  ${colorFn(statusIcon)} ${chalk.white(user.email)}`);
      console.log(`     UUID: ${chalk.gray(maskSensitiveValue(user.id))}`);

      // Quota and usage info
      const quotaDisplay = quota
        ? quotaBytes < 0
          ? '无限制'
          : formatTraffic(quotaBytes).display
        : '未设置';
      const usageDisplay = statsAvailable
        ? formatUsageSummary(usedBytes, quotaBytes)
        : '统计未启用';
      const quotaColor = quota ? chalk.cyan : chalk.gray;
      console.log(`     配额: ${quotaColor(quotaDisplay)} | 使用: ${colorFn(usageDisplay)}`);

      logger.newline();
    }
  } catch (error) {
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
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
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
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
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
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

    // Display REALITY/Direct link
    console.log(chalk.cyan('  VLESS 链接 (直连):'));
    console.log(chalk.white(`  ${shareInfo.shareLink}`));
    logger.newline();

    // Display CDN link if available
    if (shareInfo.cdnShareLink) {
      console.log(chalk.cyan('  CDN 链接 (WebSocket):'));
      console.log(chalk.white(`  ${shareInfo.cdnShareLink}`));
      logger.newline();
    }

    // Display QR code
    console.log(chalk.cyan('  二维码 (手机客户端扫描导入):'));
    logger.newline();
    qrcode.generate(shareInfo.shareLink, { small: true }, (qr) => {
      console.log(qr);
    });
    logger.newline();

    // Try to copy to clipboard
    const copied = await copyToClipboard(shareInfo.shareLink);
    if (copied) {
      logger.success('链接已复制到剪贴板');
    } else {
      logger.hint('可以手动复制上方链接');
    }

    // Ask if user wants to generate CDN link with custom domain
    if (shareInfo.wsPath) {
      logger.newline();
      const generateCdn = await confirm({
        message: '是否生成自定义 CDN 域名链接？',
        default: false,
      });

      if (generateCdn) {
        await showCdnShareForUser(manager, targetId, shareInfo.user.email);
      }
    }
  } catch (error) {
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
    process.exit(1);
  }
}

/**
 * Generate CDN share link with custom domain for a specific user
 *
 * @param manager - UserManager instance
 * @param userId - User ID
 * @param userEmail - User email for display
 */
async function showCdnShareForUser(
  manager: UserManager,
  userId: string,
  userEmail: string
): Promise<void> {
  const cdnDomain = await input({
    message: '请输入 CDN 域名 (例如: example.com):',
    validate: (value) => {
      if (!value || value.length < 3) {
        return '请输入有效的域名';
      }
      return true;
    },
  });

  const portStr = await input({
    message: '请输入 CDN 端口 (默认 443):',
    default: '443',
  });
  const cdnPort = parseInt(portStr, 10) || 443;

  const cdnLink = await manager.getCdnShareLink(userId, cdnDomain, cdnPort);

  if (!cdnLink) {
    logger.warn('未找到 WebSocket 入站配置，无法生成 CDN 链接');
    return;
  }

  logger.newline();
  logger.separator();
  console.log(chalk.bold.cyan('🌐 CDN 分享链接'));
  logger.separator();
  logger.newline();

  console.log(chalk.cyan('  用户: ') + chalk.white(userEmail));
  console.log(chalk.cyan('  CDN 域名: ') + chalk.white(cdnDomain));
  console.log(chalk.cyan('  端口: ') + chalk.white(cdnPort.toString()));
  logger.newline();

  console.log(chalk.cyan('  CDN 链接:'));
  console.log(chalk.white(`  ${cdnLink}`));
  logger.newline();

  // Display QR code for CDN link
  console.log(chalk.cyan('  二维码:'));
  logger.newline();
  qrcode.generate(cdnLink, { small: true }, (qr) => {
    console.log(qr);
  });
  logger.newline();

  // Try to copy to clipboard
  const copied = await copyToClipboard(cdnLink);
  if (copied) {
    logger.success('CDN 链接已复制到剪贴板');
  } else {
    logger.hint('可以手动复制上方链接');
  }
}

/**
 * Show CDN share link (standalone command)
 *
 * @param options - Command options
 */
export async function showCdnShare(options: UserCommandOptions = {}): Promise<void> {
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
      message: '请输入要生成 CDN 链接的用户 UUID (或输入序号):',
    });

    // Check if input is a number (index)
    let targetId = userId;
    let targetEmail = '';
    const index = parseInt(userId, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < users.length) {
      targetId = users[index].id;
      targetEmail = users[index].email;
    } else {
      const user = users.find((u) => u.id === targetId);
      targetEmail = user?.email || 'user';
    }

    await showCdnShareForUser(manager, targetId, targetEmail);
  } catch (error) {
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
    process.exit(1);
  }
}

/**
 * Generate Clash config for a user
 *
 * @param options - Command options
 */
export async function generateClashConfig(options: UserCommandOptions = {}): Promise<void> {
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
      message: '请输入要生成 Clash 配置的用户 UUID (或输入序号):',
    });

    // Check if input is a number (index)
    let targetId = userId;
    const index = parseInt(userId, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < users.length) {
      targetId = users[index].id;
    }

    const shareInfo = await manager.getShareInfo(targetId);

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan('🔧 生成 Clash 配置'));
    logger.separator();
    logger.newline();

    console.log(chalk.cyan('  用户: ') + chalk.white(shareInfo.user.email));
    logger.newline();

    await exportClashConfigFromLink({
      link: shareInfo.shareLink,
      proxyName: shareInfo.user.email,
      promptOutputPath: true,
      promptOverwrite: true,
    });
  } catch (error) {
    if (AppError.isAppError(error)) {
      logger.formattedError(error);
    } else {
      logger.error((error as Error).message);
    }
    process.exit(1);
  }
}
