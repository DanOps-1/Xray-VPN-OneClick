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
export async function getMenuContext(): Promise<MenuContext> {
  // TODO: Implement actual service status and user count retrieval
  // For now, return mock data
  return {
    serviceStatus: 'unknown',
    userCount: 0,
    lastUpdated: new Date(),
  };
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
export function getMainMenuOptions(): any[] {
  return [
    {
      name: chalk.cyan('📊 查看服务状态'),
      value: 'service-status',
    },
    {
      name: chalk.green('🚀 启动服务'),
      value: 'service-start',
    },
    {
      name: chalk.red('🛑 停止服务'),
      value: 'service-stop',
    },
    {
      name: chalk.yellow('🔄 重启服务'),
      value: 'service-restart',
    },
    { type: 'separator' },
    {
      name: chalk.blue('👥 用户管理'),
      value: 'user',
    },
    {
      name: chalk.magenta('⚙️  配置管理'),
      value: 'config',
    },
    {
      name: chalk.gray('📝 查看日志'),
      value: 'logs',
    },
    { type: 'separator' },
    {
      name: chalk.red('❌ 退出'),
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
 * Format a menu option
 */
export function formatMenuOption(name: string, value: string): { name: string; value: string } {
  // Add icon based on value type
  let icon = '•';

  if (value.includes('service')) icon = '⚙️';
  else if (value.includes('user')) icon = '👤';
  else if (value.includes('config')) icon = '🔧';
  else if (value.includes('log')) icon = '📄';

  return {
    name: `${icon} ${name}`,
    value,
  };
}

/**
 * Show a menu and get user selection
 */
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
export async function handleMenuSelection(selection: string): Promise<boolean> {
  switch (selection) {
    case 'exit':
      return true; // Signal to exit

    case 'service-status':
      logger.info('查看服务状态功能即将推出...');
      await promptContinue();
      return false;

    case 'service-start':
      logger.info('启动服务功能即将推出...');
      await promptContinue();
      return false;

    case 'service-stop':
      logger.info('停止服务功能即将推出...');
      await promptContinue();
      return false;

    case 'service-restart':
      logger.info('重启服务功能即将推出...');
      await promptContinue();
      return false;

    case 'user':
      logger.info('用户管理功能即将推出...');
      await promptContinue();
      return false;

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
    message: chalk.yellow('⚠️  确定要退出吗?'),
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
    const context = await getMenuContext();

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
      shouldExit = await handleMenuSelection(selection);

      // Update context after each action
      if (!shouldExit) {
        const updatedContext = await getMenuContext();
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
