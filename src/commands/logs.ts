/**
 * Logs Command Handler
 *
 * Handles log viewing commands (view, follow, filter)
 *
 * @module commands/logs
 */

import { LogManager, LogEntry } from '../services/log-manager';
import logger from '../utils/logger';
import chalk from 'chalk';
import { select, input } from '@inquirer/prompts';

/**
 * Logs command options
 */
export interface LogsCommandOptions {
  /** Service name */
  serviceName?: string;

  /** JSON output mode */
  json?: boolean;

  /** Log level filter */
  level?: string;

  /** Time range start */
  since?: string;

  /** Number of lines */
  lines?: number;

  /** Follow mode */
  follow?: boolean;
}

/**
 * Get color for log level
 *
 * @param level - Log level
 * @returns Chalk color function
 */
function getColorForLevel(level: string): (_text: string) => string {
  switch (level.toLowerCase()) {
    case 'emergency':
    case 'alert':
    case 'critical':
    case 'error':
      return chalk.red;
    case 'warning':
      return chalk.yellow;
    case 'notice':
      return chalk.cyan;
    case 'info':
      return chalk.white;
    case 'debug':
      return chalk.gray;
    default:
      return chalk.white;
  }
}

/**
 * Get emoji for log level
 *
 * @param level - Log level
 * @returns Emoji string
 */
function getEmojiForLevel(level: string): string {
  switch (level.toLowerCase()) {
    case 'emergency':
    case 'alert':
      return '🚨';
    case 'critical':
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'notice':
      return '📢';
    case 'info':
      return 'ℹ️';
    case 'debug':
      return '🐛';
    default:
      return '📄';
  }
}

/**
 * Format log entry for display
 *
 * @param entry - Log entry
 * @returns Formatted string
 */
function formatLogEntry(entry: LogEntry): string {
  const colorFn = getColorForLevel(entry.level);
  const emoji = getEmojiForLevel(entry.level);

  const timestamp = entry.timestamp.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const level = entry.level.toUpperCase().padEnd(9);

  return `${chalk.gray(timestamp)} ${emoji} ${colorFn(level)} ${entry.message}`;
}

/**
 * View recent logs
 *
 * @param options - Command options
 */
export async function viewLogs(options: LogsCommandOptions = {}): Promise<void> {
  try {
    const serviceName = options.serviceName || 'xray';
    const manager = new LogManager(serviceName);

    // Check journalctl availability
    if (!manager.isJournalctlAvailable()) {
      logger.error('journalctl 不可用。请确保系统使用 systemd。');
      process.exit(1);
    }

    // Query logs
    const logs = await manager.queryLogs({
      level: options.level,
      since: options.since,
      lines: options.lines || 50,
    });

    if (options.json) {
      console.log(JSON.stringify(logs, null, 2));
      return;
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(`📝 服务日志 (${serviceName})`));

    if (options.level) {
      console.log(chalk.gray(`   过滤器: 级别 ≥ ${options.level}`));
    }

    if (options.since) {
      console.log(chalk.gray(`   时间范围: ${options.since} 至今`));
    }

    console.log(chalk.gray(`   显示: 最近 ${logs.length} 条`));
    logger.separator();
    logger.newline();

    if (logs.length === 0) {
      console.log(chalk.gray('  没有找到日志'));
      logger.newline();
      return;
    }

    // Display logs
    for (const log of logs) {
      console.log(formatLogEntry(log));
    }

    logger.newline();
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Follow logs in real-time
 *
 * @param options - Command options
 */
export async function followLogs(options: LogsCommandOptions = {}): Promise<void> {
  try {
    const serviceName = options.serviceName || 'xray';
    const manager = new LogManager(serviceName);

    // Check journalctl availability
    if (!manager.isJournalctlAvailable()) {
      logger.error('journalctl 不可用。请确保系统使用 systemd。');
      process.exit(1);
    }

    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(`📝 实时日志 (${serviceName})`));

    if (options.level) {
      console.log(chalk.gray(`   过滤器: 级别 ≥ ${options.level}`));
    }

    console.log(chalk.gray('   按 Ctrl+C 停止'));
    logger.separator();
    logger.newline();

    // Follow logs
    const followProcess = await manager.followLogs(
      {
        level: options.level,
        lines: options.lines || 10,
      },
      (entry: LogEntry) => {
        console.log(formatLogEntry(entry));
      }
    );

    // Handle Ctrl+C
    const sigintHandler = () => {
      logger.newline();
      logger.info('停止日志跟踪...');
      followProcess.kill();
      process.exit(0);
    };

    process.on('SIGINT', sigintHandler);

    // Wait for process to exit
    await new Promise((resolve) => {
      followProcess.process.on('close', resolve);
    });

    process.removeListener('SIGINT', sigintHandler);
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Interactive log filtering
 *
 * @param options - Command options
 */
export async function filterLogs(options: LogsCommandOptions = {}): Promise<void> {
  try {
    logger.newline();
    console.log(chalk.bold('🔍 日志过滤'));
    logger.newline();

    // Select log level
    const levelChoice = await select({
      message: '选择日志级别:',
      choices: [
        { name: '🚨 Emergency (紧急)', value: 'emergency' },
        { name: '🔴 Alert (警报)', value: 'alert' },
        { name: '❗ Critical (严重)', value: 'critical' },
        { name: '❌ Error (错误)', value: 'error' },
        { name: '⚠️  Warning (警告)', value: 'warning' },
        { name: '📢 Notice (通知)', value: 'notice' },
        { name: 'ℹ️  Info (信息)', value: 'info' },
        { name: '🐛 Debug (调试)', value: 'debug' },
        { name: chalk.gray('不过滤'), value: 'none' },
      ],
    });

    // Select time range
    const timeChoice = await select({
      message: '选择时间范围:',
      choices: [
        { name: '最近 1 小时', value: '1 hour ago' },
        { name: '最近 3 小时', value: '3 hours ago' },
        { name: '最近 6 小时', value: '6 hours ago' },
        { name: '最近 12 小时', value: '12 hours ago' },
        { name: '今天', value: 'today' },
        { name: '昨天', value: 'yesterday' },
        { name: '最近 7 天', value: '7 days ago' },
        { name: chalk.gray('自定义'), value: 'custom' },
        { name: chalk.gray('不限制'), value: 'none' },
      ],
    });

    let since: string | undefined = timeChoice === 'none' ? undefined : timeChoice;

    if (timeChoice === 'custom') {
      since = await input({
        message: '请输入时间范围 (例如: "2024-01-01", "1 week ago"):',
      });
    }

    // Select number of lines
    const linesStr = await input({
      message: '显示多少条日志? (默认 50):',
      default: '50',
    });

    const lines = parseInt(linesStr, 10);

    // Query logs
    await viewLogs({
      ...options,
      level: levelChoice === 'none' ? undefined : levelChoice,
      since,
      lines,
    });
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}
