/**
 * 日志工具函数（使用 chalk 颜色和通用文本指示符）
 * @module utils/logger
 */

import chalk from 'chalk';
import { detectTerminalCapabilities } from './terminal';
import { resolveIcon, resolveSpecialIcon, getStatusIndicator } from './icons';

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
 * 输出模式
 */
 
export enum OutputMode {
  /** 完整模式：颜色 + 格式化 */
  RICH = 'rich',
  /** 朴素模式：无颜色 + 格式化 */
  PLAIN_TTY = 'plain_tty',
  /** 管道模式：纯文本 + 时间戳 */
  PIPE = 'pipe',
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
 * 缓存的终端能力
 */
let cachedCapabilities = detectTerminalCapabilities();

/**
 * 配置全局日志选项
 */
export function configureLogger(options: LogOptions): void {
  globalOptions = { ...globalOptions, ...options };
}

/**
 * 获取当前输出模式
 * @returns 输出模式（RICH, PLAIN_TTY, 或 PIPE）
 */
export function getOutputMode(): OutputMode {
  const isTTY = cachedCapabilities.isTTY;
  const colorEnabled = globalOptions.color !== false;

  if (!isTTY) {
    return OutputMode.PIPE;
  }

  if (!colorEnabled) {
    return OutputMode.PLAIN_TTY;
  }

  return OutputMode.RICH;
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
 * 格式化日志消息（使用新的输出模式检测）
 * @param level - 日志级别
 * @param message - 消息内容
 * @param includeIndicator - 是否包含状态指示符（默认 true）
 * @returns 格式化后的消息
 */
function formatMessage(level: LogLevel, message: string, includeIndicator: boolean = true): string {
  const mode = getOutputMode();
  const indicator = includeIndicator ? resolveIcon(level, cachedCapabilities) : '';

  switch (mode) {
    case OutputMode.PIPE:
      // 管道模式：[timestamp] [LEVEL] message
      const levelLabel = getStatusIndicator(level).ascii;
      return `${getTimestamp()} ${levelLabel} ${message}`;

    case OutputMode.PLAIN_TTY:
      // 朴素 TTY 模式：indicator message（无颜色）
      return includeIndicator ? `${indicator} ${message}` : message;

    case OutputMode.RICH:
    default:
      // 完整模式：颜色 + indicator + message
      const formattedMessage = includeIndicator ? `${indicator} ${message}` : message;

      if (globalOptions.timestamp) {
        return `${chalk.gray(getTimestamp())} ${formattedMessage}`;
      }

      return formattedMessage;
  }
}

/**
 * 应用颜色（仅在 RICH 模式下）
 * @param message - 消息
 * @param colorFn - Chalk 颜色函数
 * @returns 着色后的消息
 */
function applyColor(message: string, colorFn: (text: string) => string): string {
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    return colorFn(message);
  }

  return message;
}

/**
 * 调试日志（灰色，[DEBUG] 指示符）
 */
export function debug(...args: unknown[]): void {
  const message = args.join(' ');
  const formatted = formatMessage(LogLevel.DEBUG, message);
  console.debug(applyColor(formatted, chalk.gray));
}

/**
 * 信息日志（默认颜色，[INFO] 指示符）
 */
export function info(...args: unknown[]): void {
  const message = args.join(' ');
  const formatted = formatMessage(LogLevel.INFO, message);
  console.info(applyColor(formatted, chalk.cyan));
}

/**
 * 成功日志（绿色，✓ 或 [OK] 指示符）
 */
export function success(...args: unknown[]): void {
  const message = args.join(' ');
  const formatted = formatMessage(LogLevel.SUCCESS, message);
  console.log(applyColor(formatted, chalk.green));
}

/**
 * 警告日志（黄色，! 或 [WARN] 指示符）
 */
export function warn(...args: unknown[]): void {
  const message = args.join(' ');
  const formatted = formatMessage(LogLevel.WARN, message);
  console.warn(applyColor(formatted, chalk.yellow));
}

/**
 * 错误日志（红色，✗ 或 [ERROR] 指示符）
 */
export function error(...args: unknown[]): void {
  const message = args.join(' ');
  const formatted = formatMessage(LogLevel.ERROR, message);
  console.error(applyColor(formatted, chalk.red));
}

/**
 * 标题日志（青色，加粗）
 */
export function title(message: string): void {
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    console.log(chalk.cyan.bold(`\n${message}\n`));
  } else {
    console.log(`\n=== ${message} ===\n`);
  }
}

/**
 * 分隔线（自动适应终端宽度，最大 80 列）
 * @param char - 分隔符字符
 * @param length - 分隔线长度（默认 50）
 */
export function separator(char: string = '─', length: number = 50): void {
  // Ensure separator doesn't exceed 80 columns
  const maxWidth = 80;
  const actualLength = Math.min(length, maxWidth);
  const line = char.repeat(actualLength);
  console.log(applyColor(line, chalk.gray));
}

/**
 * 表格表头（带边框，确保在 80 列内）
 * @param titleText - 标题文本
 */
export function tableHeader(titleText: string): void {
  // Use 59 character width to ensure box drawing chars stay within 80 columns
  // 59 (content) + 2 (borders) = 61 chars total
  const width = 59;
  const border = '═'.repeat(width);
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    console.log(chalk.cyan(`╔${border}╗`));
    console.log(chalk.cyan(`║${titleText.padStart((width + titleText.length) / 2).padEnd(width)}║`));
    console.log(chalk.cyan(`╚${border}╝`));
  } else {
    console.log(border);
    console.log(titleText);
    console.log(border);
  }
}

/**
 * 加载动画消息（... 或 [...] 指示符）
 */
export function loading(message: string): void {
  const icon = resolveSpecialIcon('LOADING', cachedCapabilities);
  const formatted = `${icon} ${message}...`;
  console.log(applyColor(formatted, chalk.cyan));
}

/**
 * 进度消息（> 或 [>>] 指示符）
 */
export function progress(message: string): void {
  const icon = resolveSpecialIcon('PROGRESS', cachedCapabilities);
  const formatted = `${icon} ${message}...`;
  console.log(applyColor(formatted, chalk.blue));
}

/**
 * 提示消息（* 或 [TIP] 指示符）
 */
export function hint(message: string): void {
  const icon = resolveSpecialIcon('HINT', cachedCapabilities);
  const formatted = `${icon} 提示: ${message}`;
  console.log(applyColor(formatted, chalk.cyan));
}

/**
 * 带颜色的键值对输出
 */
export function keyValue(key: string, value: string, keyColor = chalk.gray): void {
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    console.log(`  ${keyColor(key + ':')} ${value}`);
  } else {
    console.log(`  ${key}: ${value}`);
  }
}

/**
 * 打印空行（用于操作之间的视觉分隔，保持一致间距）
 * @param count - 空行数量（默认 1）
 */
export function newline(count: number = 1): void {
  console.log('\n'.repeat(count - 1));
}

/**
 * 带颜色的列表项
 */
export function listItem(message: string, symbol: string = '•'): void {
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    console.log(chalk.gray(`  ${symbol} `) + message);
  } else {
    console.log(`  ${symbol} ${message}`);
  }
}

/**
 * 代码块（带灰色背景）
 */
export function code(codeText: string): void {
  const mode = getOutputMode();

  if (mode === OutputMode.RICH) {
    console.log(chalk.bgGray.white(` ${codeText} `));
  } else {
    console.log(`\`${codeText}\``);
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
  getOutputMode,
};
