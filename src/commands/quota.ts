/**
 * Quota Command Handler
 *
 * Handles quota-related commands (set, show, reset, list)
 *
 * @module commands/quota
 */

import { QuotaManager } from '../services/quota-manager';
import { TrafficManager } from '../services/traffic-manager';
import { UserManager } from '../services/user-manager';
import { StatsConfigManager } from '../services/stats-config-manager';
import { parseTraffic, formatTraffic, formatUsageSummary, calculateUsagePercent, getAlertLevel } from '../utils/traffic-formatter';
import { PRESET_QUOTAS } from '../constants/quota';
import logger from '../utils/logger';
import chalk from 'chalk';
import ora from 'ora';
import { select, input, confirm } from '@inquirer/prompts';
import { menuIcons } from '../constants/ui-symbols';
import { renderHeader } from '../utils/layout';
import layoutManager from '../services/layout-manager';
import type { User } from '../types/user';

/**
 * Quota command options
 */
export interface QuotaCommandOptions {
  /** Config file path */
  configPath?: string;

  /** Service name */
  serviceName?: string;

  /** JSON output mode */
  json?: boolean;
}

/**
 * Get alert level color function
 */
function getAlertColor(level: 'normal' | 'warning' | 'exceeded'): (_text: string) => string {
  switch (level) {
    case 'exceeded':
      return chalk.red;
    case 'warning':
      return chalk.yellow;
    default:
      return chalk.green;
  }
}

/**
 * Prompt user to setup Stats API if not available
 * @returns true if Stats API is now available, false otherwise
 */
async function promptStatsApiSetup(options: QuotaCommandOptions = {}): Promise<boolean> {
  const statsManager = new StatsConfigManager(options.configPath, options.serviceName);
  const detection = await statsManager.detectStatsConfig();

  if (detection.available) {
    if (detection.detectedPort) {
      try {
        const quotaManager = new QuotaManager();
        await quotaManager.setApiPort(detection.detectedPort);
      } catch (error) {
        logger.warn(`保存 API 端口失败: ${(error as Error).message}`);
      }
    }
    return true;
  }

  // Show detection result
  logger.newline();
  console.log(chalk.yellow(`  ⚠️  ${detection.message}`));
  logger.newline();

  if (detection.missingComponents.length === 0) {
    // Config exists but API not responding
    console.log(chalk.gray('  Stats API 已配置但无法连接，请检查 Xray 服务状态'));
    return false;
  }

  // Prompt for auto-configuration
  const shouldConfigure = await confirm({
    message: '是否自动配置 Stats API？配置后可查看流量统计',
    default: true,
  });

  if (!shouldConfigure) {
    return false;
  }

  // Execute configuration
  const spinner = ora('正在配置 Stats API...').start();

  spinner.text = '正在备份配置...';
  const result = await statsManager.enableStatsApi();

  if (result.success) {
    spinner.succeed(chalk.green(result.message));
    logger.newline();
    console.log(chalk.cyan('  API 端口: ') + chalk.white(result.apiPort));
    if (result.backupPath) {
      console.log(chalk.cyan('  备份文件: ') + chalk.gray(result.backupPath));
    }
    logger.newline();
    try {
      const quotaManager = new QuotaManager();
      await quotaManager.setApiPort(result.apiPort);
    } catch (error) {
      logger.warn(`保存 API 端口失败: ${(error as Error).message}`);
    }
    return true;
  } else {
    spinner.fail(chalk.red(result.message));
    if (result.error) {
      console.log(chalk.red(`  错误: ${result.error}`));
    }
    if (result.rolledBack) {
      console.log(chalk.yellow('  已自动恢复原配置'));
    }
    if (result.backupPath) {
      console.log(chalk.gray(`  备份文件: ${result.backupPath}`));
    }
    logger.newline();
    return false;
  }
}

/**
 * Parse quota input with validation
 * Supports formats: "10GB", "500MB", "1TB", preset selection
 */
export async function promptQuotaInput(): Promise<number> {
  // First, offer preset options
  const presetChoices = PRESET_QUOTAS.map((p) => ({
    name: p.label,
    value: p.bytes,
  }));

  presetChoices.push({
    name: '自定义输入',
    value: -2, // Special value for custom input
  });

  const selected = await select({
    message: '选择流量配额:',
    choices: presetChoices,
  });

  if (selected === -2) {
    // Custom input
    const customInput = await input({
      message: '请输入配额 (例如: 10GB, 500MB, 1TB):',
      validate: (value) => {
        const bytes = parseTraffic(value);
        if (bytes === -1 && value.toLowerCase() !== '无限制' && value.toLowerCase() !== 'unlimited') {
          return '无效的配额格式，请使用如 10GB, 500MB, 1TB 的格式';
        }
        return true;
      },
    });

    return parseTraffic(customInput);
  }

  return selected;
}

/**
 * Set quota for a user
 */
export async function setQuota(options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const userManager = new UserManager(options.configPath, options.serviceName);
    const quotaManager = new QuotaManager();

    // List users first
    const users = await userManager.listUsers();

    if (users.length === 0) {
      logger.warn('暂无用户，请先添加用户');
      return;
    }

    // Select user
    const userChoices = users.map((u) => ({
      name: `${u.email} (${u.id.substring(0, 8)}...)`,
      value: u.email,
    }));

    const selectedEmail = await select({
      message: '选择要设置配额的用户:',
      choices: userChoices,
    });

    // Get current quota
    const currentQuota = await quotaManager.getQuota(selectedEmail);
    const currentDisplay = currentQuota.quotaBytes < 0 ? '无限制' : formatTraffic(currentQuota.quotaBytes).display;

    logger.newline();
    console.log(chalk.gray(`当前配额: ${currentDisplay}`));
    logger.newline();

    // Prompt for new quota
    const quotaBytes = await promptQuotaInput();

    const spinner = ora('正在设置配额...').start();

    await quotaManager.setQuota({
      email: selectedEmail,
      quotaBytes,
      quotaType: quotaBytes < 0 ? 'unlimited' : 'limited',
    });

    spinner.succeed(chalk.green('配额设置成功！'));

    const newDisplay = quotaBytes < 0 ? '无限制' : formatTraffic(quotaBytes).display;
    logger.newline();
    console.log(chalk.cyan('  用户: ') + chalk.white(selectedEmail));
    console.log(chalk.cyan('  新配额: ') + chalk.white(newDisplay));
    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Show quota details for a user
 */
export async function showQuota(options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const userManager = new UserManager(options.configPath, options.serviceName);
    const quotaManager = new QuotaManager();
    const trafficManager = new TrafficManager();

    // List users first
    const users = await userManager.listUsers();

    if (users.length === 0) {
      logger.warn('暂无用户');
      return;
    }

    // Select user
    const userChoices = users.map((u) => ({
      name: `${u.email} (${u.id.substring(0, 8)}...)`,
      value: u.email,
    }));

    const selectedEmail = await select({
      message: '选择要查看的用户:',
      choices: userChoices,
    });

    const spinner = ora('正在获取配额信息...').start();

    // Get quota and usage
    const quota = await quotaManager.getQuota(selectedEmail);
    let usage = await trafficManager.getUsage(selectedEmail);

    spinner.stop();

    const terminalSize = layoutManager.detectTerminalSize();
    const headerTitle = `${menuIcons.STATS} 用户配额详情`;
    const headerText = renderHeader(headerTitle, terminalSize.width, 'left');

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(headerText));
    logger.separator();
    logger.newline();

    // User info
    console.log(chalk.cyan('  用户: ') + chalk.white(selectedEmail));
    console.log(chalk.cyan('  状态: ') + (quota.status === 'active' ? chalk.green('活跃') : chalk.red('已禁用')));
    logger.newline();

    // Quota info
    const quotaDisplay = quota.quotaBytes < 0 ? '无限制' : formatTraffic(quota.quotaBytes).display;
    console.log(chalk.cyan('  配额: ') + chalk.white(quotaDisplay));

    // Usage info
    if (usage) {
      const usedDisplay = formatTraffic(usage.total).display;
      const percent = calculateUsagePercent(usage.total, quota.quotaBytes);
      const alertLevel = getAlertLevel(percent);
      const colorFn = getAlertColor(alertLevel);

      console.log(chalk.cyan('  已用: ') + colorFn(usedDisplay));
      console.log(chalk.cyan('  使用率: ') + colorFn(`${percent}%`));

      if (quota.quotaBytes > 0) {
        const remaining = Math.max(0, quota.quotaBytes - usage.total);
        console.log(chalk.cyan('  剩余: ') + chalk.white(formatTraffic(remaining).display));
      }

      logger.newline();
      console.log(chalk.gray(`  上行: ${formatTraffic(usage.uplink).display}`));
      console.log(chalk.gray(`  下行: ${formatTraffic(usage.downlink).display}`));
    } else {
      // Stats API not available - prompt for setup
      const configured = await promptStatsApiSetup(options);
      if (configured) {
        // Retry getting usage after configuration
        usage = await trafficManager.getUsage(selectedEmail);
        if (usage) {
          const usedDisplay = formatTraffic(usage.total).display;
          const percent = calculateUsagePercent(usage.total, quota.quotaBytes);
          const alertLevel = getAlertLevel(percent);
          const colorFn = getAlertColor(alertLevel);

          console.log(chalk.cyan('  已用: ') + colorFn(usedDisplay));
          console.log(chalk.cyan('  使用率: ') + colorFn(`${percent}%`));

          if (quota.quotaBytes > 0) {
            const remaining = Math.max(0, quota.quotaBytes - usage.total);
            console.log(chalk.cyan('  剩余: ') + chalk.white(formatTraffic(remaining).display));
          }

          logger.newline();
          console.log(chalk.gray(`  上行: ${formatTraffic(usage.uplink).display}`));
          console.log(chalk.gray(`  下行: ${formatTraffic(usage.downlink).display}`));
        }
      }
    }

    logger.newline();
    console.log(chalk.gray(`  上次重置: ${quota.lastReset}`));
    logger.newline();

    if (options.json) {
      console.log(JSON.stringify({ quota, usage }, null, 2));
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Reset usage for a user
 */
export async function resetQuota(options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const userManager = new UserManager(options.configPath, options.serviceName);
    const quotaManager = new QuotaManager();

    // List users first
    const users = await userManager.listUsers();

    if (users.length === 0) {
      logger.warn('暂无用户');
      return;
    }

    // Select user
    const userChoices = users.map((u) => ({
      name: `${u.email} (${u.id.substring(0, 8)}...)`,
      value: u.email,
    }));

    const selectedEmail = await select({
      message: '选择要重置流量的用户:',
      choices: userChoices,
    });

    // Confirm
    const confirmed = await confirm({
      message: `确定要重置 ${selectedEmail} 的已用流量吗？`,
      default: false,
    });

    if (!confirmed) {
      logger.info('操作已取消');
      return;
    }

    const spinner = ora('正在重置流量...').start();

    await quotaManager.resetUsage(selectedEmail);

    spinner.succeed(chalk.green('流量重置成功！'));
    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * List all users with quota info
 */
export async function listQuotas(options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const userManager = new UserManager(options.configPath, options.serviceName);
    const quotaManager = new QuotaManager();
    const trafficManager = new TrafficManager();

    let statsAvailable = await trafficManager.isUsageAvailable();
    const shouldPromptStats = !options.json && !process.env.VITEST && process.env.NODE_ENV !== 'test';
    if (!statsAvailable && shouldPromptStats) {
      const configured = await promptStatsApiSetup(options);
      if (configured) {
        statsAvailable = await trafficManager.isUsageAvailable();
      }
    }

    const spinner = ora('正在获取配额信息...').start();

    const users = await userManager.listUsers();
    const quotas = await quotaManager.getAllQuotas();
    const usages = statsAvailable ? await trafficManager.getAllUsage() : [];

    spinner.stop();

    const terminalSize = layoutManager.detectTerminalSize();
    const headerTitle = `${menuIcons.STATS} 用户配额列表 (共 ${users.length} 个用户)`;
    const headerText = renderHeader(headerTitle, terminalSize.width, 'left');

    logger.newline();
    logger.separator();
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

    // Build user list with quota info
    const usersWithQuota: Array<User & { quotaDisplay: string; usageDisplay: string; alertLevel: 'normal' | 'warning' | 'exceeded' }> = [];

    for (const user of users) {
      const quota = quotas[user.email] || { quotaBytes: -1, quotaType: 'unlimited' as const, usedBytes: 0, lastReset: '', status: 'active' as const };
      const usage = statsAvailable ? usages.find((u) => u.email === user.email) : undefined;

      const usedBytes = statsAvailable ? (usage?.total || 0) : 0;
      const percent = statsAvailable ? calculateUsagePercent(usedBytes, quota.quotaBytes) : 0;
      const alertLevel = statsAvailable ? getAlertLevel(percent) : 'normal';

      usersWithQuota.push({
        ...user,
        quota,
        usage,
        usagePercent: percent,
        alertLevel,
        quotaDisplay: quota.quotaBytes < 0 ? '无限制' : formatTraffic(quota.quotaBytes).display,
        usageDisplay: statsAvailable ? formatUsageSummary(usedBytes, quota.quotaBytes) : '统计未启用',
      });
    }

    // Display table
    for (const user of usersWithQuota) {
      const colorFn = statsAvailable ? getAlertColor(user.alertLevel) : chalk.gray;
      const statusIcon = statsAvailable
        ? user.alertLevel === 'exceeded'
          ? '🔴'
          : user.alertLevel === 'warning'
            ? '🟡'
            : '🟢'
        : '⚪';

      console.log(`  ${statusIcon} ${chalk.white(user.email)}`);
      console.log(`     配额: ${chalk.cyan(user.quotaDisplay)}`);
      console.log(`     使用: ${colorFn(user.usageDisplay)}`);
      logger.newline();
    }

    if (options.json) {
      console.log(JSON.stringify(usersWithQuota, null, 2));
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Re-enable a disabled user
 */
export async function reenableUser(_options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const quotaManager = new QuotaManager();

    // Get all quotas and filter disabled users
    const quotas = await quotaManager.getAllQuotas();
    const disabledUsers = Object.entries(quotas)
      .filter(([, q]) => q.status === 'disabled' || q.status === 'exceeded')
      .map(([email]) => email);

    if (disabledUsers.length === 0) {
      logger.info('没有被禁用的用户');
      return;
    }

    // Select user
    const userChoices = disabledUsers.map((email) => ({
      name: email,
      value: email,
    }));

    const selectedEmail = await select({
      message: '选择要重新启用的用户:',
      choices: userChoices,
    });

    // Confirm
    const confirmed = await confirm({
      message: `确定要重新启用 ${selectedEmail} 吗？`,
      default: true,
    });

    if (!confirmed) {
      logger.info('操作已取消');
      return;
    }

    const spinner = ora('正在重新启用用户...').start();

    await quotaManager.setStatus(selectedEmail, 'active');

    spinner.succeed(chalk.green('用户已重新启用！'));
    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Configure Stats API manually
 */
export async function configureStatsApi(options: QuotaCommandOptions = {}): Promise<void> {
  try {
    const statsManager = new StatsConfigManager(options.configPath, options.serviceName);
    const detection = await statsManager.detectStatsConfig();

    const terminalSize = layoutManager.detectTerminalSize();
    const headerTitle = `${menuIcons.CONFIG} Stats API 配置`;
    const headerText = renderHeader(headerTitle, terminalSize.width, 'left');

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(headerText));
    logger.separator();
    logger.newline();

    // Show current status
    console.log(chalk.cyan('  当前状态: ') + (detection.available ? chalk.green('已配置且可用') : chalk.yellow('未配置或不可用')));

    if (detection.available && detection.detectedPort) {
      console.log(chalk.cyan('  API 端口: ') + chalk.white(detection.detectedPort));
      console.log(chalk.cyan('  服务状态: ') + (detection.serviceRunning ? chalk.green('运行中') : chalk.red('已停止')));
      logger.newline();
      try {
        const quotaManager = new QuotaManager();
        await quotaManager.setApiPort(detection.detectedPort);
      } catch (error) {
        logger.warn(`保存 API 端口失败: ${(error as Error).message}`);
      }
      logger.info('Stats API 已配置，无需重新配置');
      return;
    }

    // Show missing components
    if (detection.missingComponents.length > 0) {
      const componentNames: Record<string, string> = {
        stats: 'stats 配置块',
        policy: 'policy 配置',
        api: 'API 配置',
        'api-inbound': 'API 入站配置',
        'api-outbound': 'API 出站配置',
        'api-routing': 'API 路由规则',
      };
      const missingNames = detection.missingComponents.map((c) => componentNames[c] || c).join('、');
      console.log(chalk.cyan('  缺失组件: ') + chalk.yellow(missingNames));
    }

    logger.newline();

    // Show benefits
    console.log(chalk.gray('  配置 Stats API 后，您可以：'));
    console.log(chalk.gray('  • 查看用户实时流量使用情况'));
    console.log(chalk.gray('  • 设置流量配额并自动限制'));
    console.log(chalk.gray('  • 查看流量统计报表'));
    logger.newline();

    // Confirm configuration
    const shouldConfigure = await confirm({
      message: '是否立即配置 Stats API？',
      default: true,
    });

    if (!shouldConfigure) {
      logger.info('操作已取消');
      return;
    }

    // Execute configuration
    const spinner = ora('正在配置 Stats API...').start();

    spinner.text = '正在备份配置...';
    const result = await statsManager.enableStatsApi();

    if (result.success) {
      spinner.succeed(chalk.green(result.message));
      logger.newline();
      console.log(chalk.cyan('  API 端口: ') + chalk.white(result.apiPort));
      if (result.backupPath) {
        console.log(chalk.cyan('  备份文件: ') + chalk.gray(result.backupPath));
      }
      logger.newline();
      try {
        const quotaManager = new QuotaManager();
        await quotaManager.setApiPort(result.apiPort);
      } catch (error) {
        logger.warn(`保存 API 端口失败: ${(error as Error).message}`);
      }
    } else {
      spinner.fail(chalk.red(result.message));
      if (result.error) {
        console.log(chalk.red(`  错误: ${result.error}`));
      }
      if (result.rolledBack) {
        console.log(chalk.yellow('  已自动恢复原配置'));
      }
      if (result.backupPath) {
        console.log(chalk.gray(`  备份文件: ${result.backupPath}`));
      }
      logger.newline();
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}
