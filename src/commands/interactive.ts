/**
 * Interactive Menu Implementation
 *
 * Provides the main interactive menu system for the CLI tool
 *
 * @module commands/interactive
 */

import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import logger from '../utils/logger';
import { ExitCode } from '../constants/exit-codes';
import { SystemdManager } from '../services/systemd-manager';
import { UserManager } from '../services/user-manager';
import { displayServiceStatus, startService, stopService, restartService } from './service';
import { listUsers, addUser, deleteUser, showUserShare } from './user';
import { menuIcons } from '../constants/ui-symbols';

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
 * Menu context information
 */
export interface MenuContext {
  /** Service status */
  serviceStatus?: string;

  /** Number of users */
  userCount?: number;

  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Menu stack for navigation
 */
export class MenuStack {
  private stack: string[] = [];

  push(menu: string): void {
    this.stack.push(menu);
  }

  pop(): string {
    if (this.stack.length === 0) {
      throw new Error('Cannot pop from empty menu stack');
    }
    return this.stack.pop()!;
  }

  current(): string | undefined {
    return this.stack[this.stack.length - 1];
  }

  depth(): number {
    return this.stack.length;
  }

  canGoBack(): boolean {
    return this.stack.length > 0;
  }

  clear(): void {
    this.stack = [];
  }
}

// Global menu stack instance
const menuStack = new MenuStack();

/**
 * Get menu context (service status, user count)
 */
export async function getMenuContext(options: MenuOptions = {}): Promise<MenuContext> {
  const serviceName = options.serviceName || 'xray';

  try {
    const systemdManager = new SystemdManager(serviceName);
    const userManager = new UserManager(options.configPath, serviceName);

    const [status, users] = await Promise.all([
      systemdManager.getStatus(),
      userManager.listUsers(),
    ]);

    return {
      serviceStatus: status.healthy ? 'active' : status.active ? status.subState : 'inactive',
      userCount: users.length,
      lastUpdated: new Date(),
    };
  } catch (_error) {
    // If service status fails, return unknown
    return {
      serviceStatus: 'unknown',
      userCount: 0,
      lastUpdated: new Date(),
    };
  }
}

/**
 * Format menu header with context
 */
export function formatMenuHeader(context: MenuContext): string {
  const status = context.serviceStatus || 'unknown';
  const userCount = context.userCount || 0;

  const statusColor = status === 'active' ? chalk.green : status === 'inactive' ? chalk.red : chalk.yellow;

  return `${chalk.gray('服务状态:')} ${statusColor(status)}  ${chalk.gray('用户数:')} ${chalk.cyan(String(userCount))}`;
}

/**
 * Get main menu options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMainMenuOptions(): any[] {
  return [
    // Service Operations Group
    {
      name: chalk.cyan(`${menuIcons.STATUS} 查看服务状态`),
      value: 'service-status',
    },
    {
      name: chalk.green(`${menuIcons.START} 启动服务`),
      value: 'service-start',
    },
    {
      name: chalk.red(`${menuIcons.STOP} 停止服务`),
      value: 'service-stop',
    },
    {
      name: chalk.yellow(`${menuIcons.RESTART} 重启服务`),
      value: 'service-restart',
    },
    { type: 'separator' },
    // Management Group
    {
      name: chalk.blue(`${menuIcons.USER} 用户管理`),
      value: 'user',
    },
    {
      name: chalk.magenta(`${menuIcons.CONFIG} 配置管理`),
      value: 'config',
    },
    {
      name: chalk.gray(`${menuIcons.LOGS} 查看日志`),
      value: 'logs',
    },
    { type: 'separator' },
    // Exit Group
    {
      name: chalk.red(`${menuIcons.EXIT} 退出`),
      value: 'exit',
    },
  ];
}

/**
 * Get menu depth (for Constitution compliance - max 3 levels)
 */
export function getMenuDepth(): number {
  // Main menu (1) -> Submenu (2) -> Action (3)
  return 3;
}

/**
 * Format a menu option with appropriate icon
 */
export function formatMenuOption(name: string, value: string): { name: string; value: string } {
  // Add icon based on value type using menuIcons
  let icon = '•';

  if (value.includes('service') || value.includes('status')) {
    icon = menuIcons.STATUS;
  } else if (value.includes('user')) {
    icon = menuIcons.USER;
  } else if (value.includes('config')) {
    icon = menuIcons.CONFIG;
  } else if (value.includes('log')) {
    icon = menuIcons.LOGS;
  } else if (value.includes('start')) {
    icon = menuIcons.START;
  } else if (value.includes('stop')) {
    icon = menuIcons.STOP;
  } else if (value.includes('restart')) {
    icon = menuIcons.RESTART;
  }

  return {
    name: `${icon} ${name}`,
    value,
  };
}

/**
 * Show a menu and get user selection
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function showMenu(options: any[], message: string = '请选择操作:'): Promise<string> {
  const answer = await select({
    message,
    choices: options,
  });

  return answer;
}

/**
 * Handle menu selection
 */
export async function handleMenuSelection(selection: string, options: MenuOptions): Promise<boolean> {
  switch (selection) {
    case 'exit':
      return true; // Signal to exit

    case 'service-status':
      logger.newline();
      await displayServiceStatus(options);
      await promptContinue();
      return false;

    case 'service-start':
      logger.newline();
      await startService(options);
      await promptContinue();
      return false;

    case 'service-stop':
      logger.newline();
      const confirmStop = await confirm({
        message: chalk.yellow('确定要停止服务吗？这将中断所有连接。'),
        default: false,
      });

      if (confirmStop) {
        await stopService(options);
      } else {
        logger.info('已取消停止操作');
      }
      await promptContinue();
      return false;

    case 'service-restart':
      logger.newline();
      const confirmRestart = await confirm({
        message: chalk.yellow('确定要重启服务吗？'),
        default: true,
      });

      if (confirmRestart) {
        await restartService(options);
      } else {
        logger.info('已取消重启操作');
      }
      await promptContinue();
      return false;

    case 'user':
      // Show user management submenu
      return await handleUserManagementMenu(options);

    case 'config':
      logger.info('配置管理功能即将推出...');
      await promptContinue();
      return false;

    case 'logs':
      logger.info('日志查看功能即将推出...');
      await promptContinue();
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
    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(`${menuIcons.USER} 用户管理`));
    logger.separator();
    logger.newline();

    const userMenuOptions = [
      { name: chalk.cyan('[列表] 查看用户列表'), value: 'user-list' },
      { name: chalk.green('[添加] 添加用户'), value: 'user-add' },
      { name: chalk.red('[删除] 删除用户'), value: 'user-delete' },
      { name: chalk.blue('[分享] 显示分享链接'), value: 'user-share' },
      { type: 'separator' },
      { name: chalk.gray('[返回] 返回主菜单'), value: 'back' },
    ];

    const selection = await showMenu(userMenuOptions, chalk.bold('请选择操作:'));

    switch (selection) {
      case 'back':
        return false; // Return to main menu

      case 'user-list':
        logger.newline();
        await listUsers(options);
        await promptContinue();
        break;

      case 'user-add':
        logger.newline();
        await addUser(options);
        await promptContinue();
        break;

      case 'user-delete':
        logger.newline();
        await deleteUser(options);
        await promptContinue();
        break;

      case 'user-share':
        logger.newline();
        await showUserShare(options);
        await promptContinue();
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
  await confirm({
    message: '按 Enter 继续...',
    default: true,
  });
}

/**
 * Handle SIGINT (Ctrl+C)
 */
export async function handleSigInt(): Promise<boolean> {
  logger.newline();
  const shouldExit = await confirm({
    message: chalk.yellow('确定要退出吗?'),
    default: false,
  });

  return shouldExit;
}

/**
 * Main interactive menu loop
 */
export async function startInteractiveMenu(options: MenuOptions): Promise<void> {
  logger.title('Xray Manager - 交互式管理工具');

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
    // Get menu context
    const context = await getMenuContext(options);

    // Main menu loop
    let shouldExit = false;

    while (!shouldExit) {
      logger.newline();
      logger.separator();

      // Display context
      const header = formatMenuHeader(context);
      console.log(header);

      logger.separator();
      logger.newline();

      // Get menu options
      const menuOptions = getMainMenuOptions();

      // Show menu and get selection
      const selection = await showMenu(menuOptions, chalk.bold('请选择操作:'));

      // Handle selection
      shouldExit = await handleMenuSelection(selection, options);

      // Update context after each action
      if (!shouldExit) {
        const updatedContext = await getMenuContext(options);
        Object.assign(context, updatedContext);
      }
    }

    logger.success('感谢使用 Xray Manager!');
  } finally {
    // Cleanup
    process.removeListener('SIGINT', sigintHandler);
    menuStack.clear();
  }
}
