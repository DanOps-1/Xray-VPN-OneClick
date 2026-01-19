/**
 * 格式化工具函数
 * @module utils/format
 */

/**
 * 脱敏选项
 */
export interface MaskOptions {
  /** 前缀长度（默认 4） */
  prefixLength?: number;

  /** 后缀长度（默认 4） */
  suffixLength?: number;

  /** 掩码字符（默认 *） */
  maskChar?: string;
}

/**
 * 脱敏显示敏感信息（前4后4）
 * @param value 原始值
 * @param options 脱敏选项
 * @returns 脱敏后的值
 */
export function maskSensitiveValue(value: string, options: MaskOptions = {}): string {
  const { prefixLength = 4, suffixLength = 4, maskChar = '*' } = options;

  // Handle empty or very short strings
  if (!value) {
    return maskChar.repeat(3);
  }

  if (value.length <= prefixLength + suffixLength) {
    // For short strings, show first char only
    if (value.length <= 3) {
      return value[0] + maskChar.repeat(value.length - 1 || 2);
    }
    return maskChar.repeat(value.length);
  }

  // Special handling for email addresses
  if (value.includes('@')) {
    const [localPart, domain] = value.split('@');
    const maskedLocal =
      localPart.slice(0, Math.min(4, localPart.length)) +
      maskChar.repeat(Math.max(0, localPart.length - 4));
    return `${maskedLocal}@${domain}`;
  }

  // Default masking: show first 4 and last 4
  const prefix = value.slice(0, prefixLength);
  const suffix = value.slice(-suffixLength);
  const maskLength = value.length - prefixLength - suffixLength;

  return `${prefix}${maskChar.repeat(maskLength)}${suffix}`;
}

/**
 * 格式化运行时长（毫秒转为可读格式）
 * @param milliseconds 毫秒数
 * @returns 格式化后的时长字符串
 */
export function formatUptime(milliseconds: number): string {
  if (!milliseconds || milliseconds < 0) {
    return '0秒';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @param decimals 小数位数（默认 2）
 * @returns 格式化后的大小字符串
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  if (!bytes || bytes < 0) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 格式化时间戳为可读日期
 * @param timestamp ISO 8601 字符串或 Unix 时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化相对时间（如 "2 小时前"）
 * @param timestamp ISO 8601 字符串或 Unix 时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return '未来';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`;
  } else {
    return `${diffSeconds}秒前`;
  }
}

/**
 * 格式化持续时间（毫秒转为简洁格式）
 * @param ms 毫秒数
 * @returns 格式化后的持续时间字符串
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else if (ms < 3600000) {
    return `${(ms / 60000).toFixed(1)}m`;
  } else {
    return `${(ms / 3600000).toFixed(1)}h`;
  }
}

/**
 * 格式化 JSON（美化输出）
 * @param obj 对象
 * @param spaces 缩进空格数（默认 2）
 * @returns 格式化后的 JSON 字符串
 */
export function formatJSON(obj: unknown, spaces: number = 2): string {
  try {
    return JSON.stringify(obj, null, spaces);
  } catch {
    return String(obj);
  }
}

/**
 * 截断字符串（添加省略号）
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @param ellipsis 省略号（默认 ...）
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (!str || str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 填充字符串（对齐）
 * @param str 原始字符串
 * @param length 目标长度
 * @param padChar 填充字符（默认空格）
 * @param align 对齐方式（默认 left）
 * @returns 填充后的字符串
 */
export function pad(
  str: string,
  length: number,
  padChar: string = ' ',
  align: 'left' | 'right' | 'center' = 'left'
): string {
  if (str.length >= length) {
    return str;
  }

  const padLength = length - str.length;

  switch (align) {
    case 'right':
      return padChar.repeat(padLength) + str;
    case 'center': {
      const leftPad = Math.floor(padLength / 2);
      const rightPad = padLength - leftPad;
      return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
    }
    case 'left':
    default:
      return str + padChar.repeat(padLength);
  }
}

/**
 * 格式化表格行（用于控制台输出）
 * @param columns 列数据
 * @param widths 列宽度
 * @returns 格式化后的行字符串
 */
export function formatTableRow(columns: string[], widths: number[]): string {
  return columns.map((col, i) => pad(truncate(col, widths[i]), widths[i])).join(' │ ');
}

/**
 * 格式化百分比
 * @param value 数值（0-1 或 0-100）
 * @param total 总数（可选）
 * @param decimals 小数位数（默认 1）
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, total?: number, decimals: number = 1): string {
  let percent: number;

  if (total !== undefined && total > 0) {
    percent = (value / total) * 100;
  } else if (value > 0 && value <= 1) {
    percent = value * 100;
  } else {
    percent = value;
  }

  return `${percent.toFixed(decimals)}%`;
}
