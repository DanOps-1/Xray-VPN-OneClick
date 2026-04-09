/**
 * Interactive Menu Implementation
 *
 * Provides the main interactive menu system for the CLI tool
 *
 * @module commands/interactive
 */

import { select, confirm, input, Separator } from '@inquirer/prompts';
import chalk from 'chalk';
import logger from '../utils/logger';
import { ExitCode } from '../constants/exit-codes';
import { displayServiceStatus, startService, stopService, restartService } from './service';
import {
  listUsers,
  addUser,
  deleteUser,
  showUserShare,
  generateClashConfig,
  showCdnShare,
} from './user';
import {
  setQuota,
  showQuota,
  resetQuota,
  listQuotas,
  reenableUser,
  configureStatsApi,
  executeQuotaCheck,
} from './quota';
import { showLogsMenu } from './logs';
import { showConfigMenu } from './config';
import { menuIcons } from '../constants/ui-symbols';
import { t, toggleLanguage } from '../config/i18n';
import layoutManager from '../services/layout-manager';
import { ScreenManager } from '../services/screen-manager';
import { DashboardWidget } from '../components/dashboard-widget';
import { NavigationManager } from '../services/navigation-manager';
import { THEME } from '../constants/theme';

/**
 * Menu options configuration
 */
export interface MenuOptions {
  /** Config file path */
  configPath?: string;

  /** Service name */
  serviceName?: string;

  /** JSON output mode */
  jsonOutput?: boolean;

  /** Verbose mode */
  verbose?: boolean;
}

/**
 * Menu choice item
 */
export interface MenuChoice {
  /** Display name */
  name: string;
  /** Value to return when selected */
  value: string;
}

/**
 * Menu choice type (can be a choice or separator)
 */
export type MenuChoiceItem = MenuChoice | Separator;

// Global instances
const screenManager = new ScreenManager();
const navigationManager = new NavigationManager();
let dashboardWidget: DashboardWidget;

/**
 * Get main menu options
 */
export function getMainMenuOptions(): MenuChoiceItem[] {
  const trans = t();

  // Unified color theme: Icons use accents, text uses neutral/primary
  return [
    // Service Operations Group
    {
      name: `${THEME.primary(menuIcons.STATUS)} ${THEME.neutral(trans.menu.viewStatus)}`,
      value: 'service-status',
    },
    {
      name: `${THEME.success(menuIcons.START)} ${THEME.neutral(trans.menu.startService)}`,
      value: 'service-start',
    },
    {
      name: `${THEME.error(menuIcons.STOP)} ${THEME.neutral(trans.menu.stopService)}`,
      value: 'service-stop',
    },
    {
      name: `${THEME.warning(menuIcons.RESTART)} ${THEME.neutral(trans.menu.restartService)}`,
      value: 'service-restart',
    },
    new Separator(),
    // Management Group
    {
      name: `${THEME.secondary(menuIcons.USER)} ${THEME.neutral(trans.menu.userManagement)}`,
      value: 'user',
    },
    {
      name: `${THEME.secondary(menuIcons.QUOTA)} ${THEME.neutral('流量配额管理')}`,
      value: 'quota',
    },
    {
      name: `${THEME.secondary(menuIcons.CONFIG)} ${THEME.neutral(trans.menu.configManagement)}`,
      value: 'config',
    },
    {
      name: `${THEME.neutral(menuIcons.LOGS)} ${THEME.neutral(trans.menu.viewLogs)}`,
      value: 'logs',
    },
    new Separator(),
    // Language & Exit Group
    {
      name: `${THEME.primary(menuIcons.LANGUAGE)} ${THEME.neutral(trans.menu.switchLanguage)}`,
      value: 'switch-language',
    },
    {
      name: `${THEME.error(menuIcons.EXIT)} ${THEME.neutral(trans.menu.exit)}`,
      value: 'exit',
    },
  ];
}

/**
 * Show a menu and get user selection
 */
export async function showMenu(options: MenuChoiceItem[], message?: string): Promise<string> {
  const trans = t();
  const answer = await select({
    message: message || trans.actions.selectAction,
    choices: options,
  });

  return answer as string;
}

/**
 * Handle menu selection
 */
export async function handleMenuSelection(
  selection: string,
  options: MenuOptions
): Promise<boolean> {
  switch (selection) {
    case 'switch-language':
      toggleLanguage();
      const trans = t();
      logger.success(trans.messages.languageSwitched);
      await promptContinue();
      return false; // Return to menu with new language

    case 'exit':
      return true; // Signal to exit

    case 'service-status':
      await displayServiceStatus(options);
      await promptContinue();
      return false;

    case 'service-start':
      await startService(options);
      await dashboardWidget.refresh(); // Refresh dashboard after action
      await promptContinue();
      return false;

    case 'service-stop':
      const confirmStop = await confirm({
        message: THEME.warning('确定要停止服务吗？这将中断所有连接。'),
        default: false,
      });

      if (confirmStop) {
        await stopService(options);
        await dashboardWidget.refresh(); // Refresh dashboard after action
      } else {
        logger.info('已取消停止操作');
        await promptContinue();
      }
      return false;

    case 'service-restart':
      const confirmRestart = await confirm({
        message: THEME.warning('确定要重启服务吗？'),
        default: true,
      });

      if (confirmRestart) {
        await restartService(options);
        await dashboardWidget.refresh(); // Refresh dashboard after action
      } else {
        logger.info('已取消重启操作');
        await promptContinue();
      }
      return false;

    case 'user':
      // Show user management submenu
      navigationManager.push('User Management');
      const result = await handleUserManagementMenu(options);
      navigationManager.pop();
      return result;

    case 'quota':
      // Show quota management submenu
      navigationManager.push('Quota Management');
      const quotaResult = await handleQuotaManagementMenu(options);
      navigationManager.pop();
      return quotaResult;

    case 'config':
      navigationManager.push('Config');
      await showConfigMenu({ configPath: options.configPath, serviceName: options.serviceName });
      navigationManager.pop();
      return false;

    case 'logs':
      navigationManager.push('Logs');
      await showLogsMenu({ serviceName: options.serviceName });
      navigationManager.pop();
      return false;

    default:
      logger.warn(`未知选项: ${selection}`);
      return false;
  }
}

/**
 * Handle user management submenu
 */
async function handleUserManagementMenu(options: MenuOptions): Promise<boolean> {
  while (true) {
    // Render Frame
    screenManager.clear();
    await dashboardWidget.refresh();
    screenManager.renderHeader(dashboardWidget, navigationManager.getBreadcrumb());

    // Submenu Header - Use theme colors
    console.log(THEME.secondary(`${menuIcons.USER} 用户管理`));
    logger.separator();
    logger.newline();

    const userMenuOptions = [
      { name: `${THEME.primary('[列表]')} ${THEME.neutral('查看用户列表')}`, value: 'user-list' },
      { name: `${THEME.success('[添加]')} ${THEME.neutral('添加用户')}`, value: 'user-add' },
      { name: `${THEME.error('[删除]')} ${THEME.neutral('删除用户')}`, value: 'user-delete' },
      {
        name: `${THEME.secondary('[分享]')} ${THEME.neutral('显示分享链接')}`,
        value: 'user-share',
      },
      {
        name: `${THEME.secondary('[CDN]')} ${THEME.neutral('生成 CDN 链接')}`,
        value: 'user-cdn',
      },
      {
        name: `${THEME.primary('[Clash]')} ${THEME.neutral('生成 Clash 配置')}`,
        value: 'user-clash',
      },
      new Separator(),
      { name: `${THEME.neutral('[返回]')} ${THEME.neutral('返回主菜单')}`, value: 'back' },
    ];

    const selection = await showMenu(userMenuOptions, chalk.bold('请选择操作:'));

    switch (selection) {
      case 'back':
        return false; // Return to main menu

      case 'user-list':
        navigationManager.push('List Users');
        await listUsers(options);
        await promptContinue();
        navigationManager.pop();
        break;

      case 'user-add':
        navigationManager.push('Add User');
        await addUser(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'user-delete':
        navigationManager.push('Delete User');
        await deleteUser(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'user-share':
        navigationManager.push('Share Link');
        await showUserShare(options);
        await promptContinue();
        navigationManager.pop();
        break;

      case 'user-cdn':
        navigationManager.push('CDN Link');
        await showCdnShare(options);
        await promptContinue();
        navigationManager.pop();
        break;

      case 'user-clash':
        navigationManager.push('Generate Clash Config');
        await generateClashConfig(options);
        await promptContinue();
        navigationManager.pop();
        break;

      default:
        logger.warn(`未知选项: ${selection}`);
        break;
    }
  }
}

/**
 * Handle quota management submenu
 */
async function handleQuotaManagementMenu(options: MenuOptions): Promise<boolean> {
  while (true) {
    // Render Frame
    screenManager.clear();
    await dashboardWidget.refresh();
    screenManager.renderHeader(dashboardWidget, navigationManager.getBreadcrumb());

    // Submenu Header - Use theme colors
    console.log(THEME.secondary(`${menuIcons.QUOTA} 流量配额管理`));
    logger.separator();
    logger.newline();

    const quotaMenuOptions = [
      { name: `${THEME.primary('[列表]')} ${THEME.neutral('查看配额列表')}`, value: 'quota-list' },
      { name: `${THEME.success('[设置]')} ${THEME.neutral('设置用户配额')}`, value: 'quota-set' },
      {
        name: `${THEME.secondary('[详情]')} ${THEME.neutral('查看配额详情')}`,
        value: 'quota-show',
      },
      { name: `${THEME.warning('[重置]')} ${THEME.neutral('重置已用流量')}`, value: 'quota-reset' },
      {
        name: `${THEME.success('[启用]')} ${THEME.neutral('重新启用用户')}`,
        value: 'quota-reenable',
      },
      new Separator(),
      { name: `${THEME.warning('[检查]')} ${THEME.neutral('执行配额检查')}`, value: 'quota-check' },
      {
        name: `${THEME.primary('[配置]')} ${THEME.neutral('配置 Stats API')}`,
        value: 'stats-config',
      },
      new Separator(),
      { name: `${THEME.neutral('[返回]')} ${THEME.neutral('返回主菜单')}`, value: 'back' },
    ];

    const selection = await showMenu(quotaMenuOptions, chalk.bold('请选择操作:'));

    switch (selection) {
      case 'back':
        return false; // Return to main menu

      case 'quota-list':
        navigationManager.push('List Quotas');
        await listQuotas(options);
        await promptContinue();
        navigationManager.pop();
        break;

      case 'quota-set':
        navigationManager.push('Set Quota');
        await setQuota(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'quota-show':
        navigationManager.push('Quota Details');
        await showQuota(options);
        await promptContinue();
        navigationManager.pop();
        break;

      case 'quota-reset':
        navigationManager.push('Reset Usage');
        await resetQuota(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'quota-reenable':
        navigationManager.push('Re-enable User');
        await reenableUser(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'quota-check':
        navigationManager.push('Quota Check');
        await executeQuotaCheck(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      case 'stats-config':
        navigationManager.push('Stats API Config');
        await configureStatsApi(options);
        await dashboardWidget.refresh();
        await promptContinue();
        navigationManager.pop();
        break;

      default:
        logger.warn(`未知选项: ${selection}`);
        break;
    }
  }
}

/**
 * Prompt user to continue
 */
async function promptContinue(): Promise<void> {
  await input({
    message: '按 Enter 继续...',
  });
}

/**
 * Handle SIGINT (Ctrl+C)
 */
export async function handleSigInt(): Promise<boolean> {
  logger.newline();
  const shouldExit = await confirm({
    message: THEME.warning('确定要退出吗?'),
    default: false,
  });

  return shouldExit;
}

/**
 * Main interactive menu loop
 */
export async function startInteractiveMenu(options: MenuOptions): Promise<void> {
  const trans = t();

  // Detect terminal size and validate
  const terminalSize = layoutManager.detectTerminalSize();
  const validation = layoutManager.validateTerminalSize(terminalSize);

  // Initialize Dashboard Widget
  dashboardWidget = new DashboardWidget(options.serviceName, options.configPath);

  // Warn if terminal is too small
  if (!validation.isValid) {
    logger.newline();
    logger.warn(validation.message!);
    logger.info(validation.suggestion!);
    logger.newline();
  }

  // Setup SIGINT handler
  let sigintHandled = false;

  const sigintHandler = async () => {
    if (sigintHandled) return;
    sigintHandled = true;

    const shouldExit = await handleSigInt();

    if (shouldExit) {
      logger.info('👋 再见!');
      process.exit(ExitCode.SUCCESS);
    } else {
      sigintHandled = false;
      // Continue with menu
    }
  };

  process.on('SIGINT', sigintHandler);

  try {
    // Main menu loop
    let shouldExit = false;

    while (!shouldExit) {
      // 1. Clear Screen
      screenManager.clear();

      // 2. Refresh Dashboard Data
      await dashboardWidget.refresh();

      // 3. Render Header (Dashboard + Breadcrumb)
      screenManager.renderHeader(dashboardWidget, navigationManager.getBreadcrumb());

      logger.newline();

      // Get menu options
      const menuOptions = getMainMenuOptions();

      // Show menu and get selection
      const selection = await showMenu(menuOptions, chalk.bold(trans.actions.selectAction));

      // Handle selection
      shouldExit = await handleMenuSelection(selection, options);
    }

    logger.success(trans.messages.thankYou || '感谢使用 Xray Manager!');
    logger.newline();
    logger.info('⭐ 觉得好用？请给个 Star 支持一下！');
    logger.info('   https://github.com/DanOps-1/Xray-VPN-OneClick');
    logger.info('   开源不易，你的支持是我最大的动力 🙏');
    logger.newline();
  } finally {
    process.removeListener('SIGINT', sigintHandler);
  }
}
