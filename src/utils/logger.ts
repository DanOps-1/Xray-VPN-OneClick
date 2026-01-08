/**
 * 日志工具函数（使用 chalk 颜色）
 * @module utils/logger
 */

import chalk from 'chalk';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志选项
 */
export interface LogOptions {
  /** 是否启用颜色（默认 true） */
  color?: boolean;

  /** 是否显示时间戳（默认 false） */
  timestamp?: boolean;

  /** 日志级别（用于过滤） */
  level?: LogLevel;
}

/**
 * 全局日志配置
 */
let globalOptions: LogOptions = {
  color: true,
  timestamp: false,
  level: LogLevel.INFO,
};

/**
 * 配置全局日志选项
 */
export function configureLogger(options: LogOptions): void {
  globalOptions = { ...globalOptions, ...options };
}

/**
 * 获取时间戳字符串
 */
function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
}

/**
 * 格式化日志消息
 */
function formatMessage(level: LogLevel, message: string): string {
  let formatted = message;

  if (globalOptions.timestamp) {
    formatted = `${chalk.gray(getTimestamp())} ${formatted}`;
  }

  return formatted;
}

/**
 * 调试日志（灰色）
 */
export function debug(...args: unknown[]): void {
  if (globalOptions.color) {
    console.debug(chalk.gray(formatMessage(LogLevel.DEBUG, args.join(' '))));
  } else {
    console.debug('[DEBUG]', ...args);
  }
}

/**
 * 信息日志（默认颜色）
 */
export function info(...args: unknown[]): void {
  if (globalOptions.color) {
    console.info(formatMessage(LogLevel.INFO, args.join(' ')));
  } else {
    console.info('[INFO]', ...args);
  }
}

/**
 * 成功日志（绿色，带 ✅ 图标）
 */
export function success(...args: unknown[]): void {
  if (globalOptions.color) {
    console.log(chalk.green(formatMessage(LogLevel.SUCCESS, `✅ ${args.join(' ')}`)));
  } else {
    console.log('[SUCCESS]', ...args);
  }
}

/**
 * 警告日志（黄色，带 ⚠️ 图标）
 */
export function warn(...args: unknown[]): void {
  if (globalOptions.color) {
    console.warn(chalk.yellow(formatMessage(LogLevel.WARN, `⚠️  ${args.join(' ')}`)));
  } else {
    console.warn('[WARN]', ...args);
  }
}

/**
 * 错误日志（红色，带 ❌ 图标）
 */
export function error(...args: unknown[]): void {
  if (globalOptions.color) {
    console.error(chalk.red(formatMessage(LogLevel.ERROR, `❌ ${args.join(' ')}`)));
  } else {
    console.error('[ERROR]', ...args);
  }
}

/**
 * 标题日志（青色，加粗）
 */
export function title(message: string): void {
  if (globalOptions.color) {
    console.log(chalk.cyan.bold(`\n${message}\n`));
  } else {
    console.log(`\n=== ${message} ===\n`);
  }
}

/**
 * 分隔线
 */
export function separator(char: string = '─', length: number = 50): void {
  if (globalOptions.color) {
    console.log(chalk.gray(char.repeat(length)));
  } else {
    console.log(char.repeat(length));
  }
}

/**
 * 表格表头（带边框）
 */
export function tableHeader(title: string): void {
  const width = 59; // 符合 contracts 中的宽度
  const border = '═'.repeat(width);

  if (globalOptions.color) {
    console.log(chalk.cyan(`╔${border}╗`));
    console.log(chalk.cyan(`║${title.padStart((width + title.length) / 2).padEnd(width)}║`));
    console.log(chalk.cyan(`╚${border}╝`));
  } else {
    console.log(border);
    console.log(title);
    console.log(border);
  }
}

/**
 * 加载动画消息（带 ⏳ 图标）
 */
export function loading(message: string): void {
  if (globalOptions.color) {
    console.log(chalk.cyan(`⏳ ${message}...`));
  } else {
    console.log(`[LOADING] ${message}...`);
  }
}

/**
 * 进度消息（带 🔄 图标）
 */
export function progress(message: string): void {
  if (globalOptions.color) {
    console.log(chalk.blue(`🔄 ${message}...`));
  } else {
    console.log(`[PROGRESS] ${message}...`);
  }
}

/**
 * 提示消息（带 💡 图标）
 */
export function hint(message: string): void {
  if (globalOptions.color) {
    console.log(chalk.cyan(`💡 提示: ${message}`));
  } else {
    console.log(`[HINT] ${message}`);
  }
}

/**
 * 带颜色的键值对输出
 */
export function keyValue(key: string, value: string, keyColor = chalk.gray): void {
  if (globalOptions.color) {
    console.log(`  ${keyColor(key + ':')} ${value}`);
  } else {
    console.log(`  ${key}: ${value}`);
  }
}

/**
 * 打印空行
 */
export function newline(count: number = 1): void {
  console.log('\n'.repeat(count - 1));
}

/**
 * 带颜色的列表项
 */
export function listItem(message: string, symbol: string = '•'): void {
  if (globalOptions.color) {
    console.log(chalk.gray(`  ${symbol} `) + message);
  } else {
    console.log(`  ${symbol} ${message}`);
  }
}

/**
 * 代码块（带灰色背景）
 */
export function code(code: string): void {
  if (globalOptions.color) {
    console.log(chalk.bgGray.white(` ${code} `));
  } else {
    console.log(`\`${code}\``);
  }
}

/**
 * 默认导出对象
 */
export default {
  debug,
  info,
  success,
  warn,
  error,
  title,
  separator,
  tableHeader,
  loading,
  progress,
  hint,
  keyValue,
  newline,
  listItem,
  code,
  configure: configureLogger,
};
