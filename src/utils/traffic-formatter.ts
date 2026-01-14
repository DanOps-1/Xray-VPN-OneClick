/**
 * 流量格式化工具
 * @module utils/traffic-formatter
 */

import type { TrafficUnit, FormattedTraffic } from '../types/quota';

/**
 * 单位转换常量（使用 IEC 二进制单位）
 */
const UNIT_BYTES: Record<TrafficUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

/**
 * 单位顺序（从小到大）
 */
const UNIT_ORDER: TrafficUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * 格式化字节数为人类可读格式
 * @param bytes 字节数
 * @returns 格式化结果
 */
export function formatTraffic(bytes: number): FormattedTraffic {
  if (bytes < 0) {
    return { value: 0, unit: 'B', display: '无限制' };
  }

  if (bytes === 0) {
    return { value: 0, unit: 'B', display: '0 B' };
  }

  // 找到合适的单位
  let selectedUnit: TrafficUnit = 'B';
  for (const unit of UNIT_ORDER) {
    if (bytes >= UNIT_BYTES[unit]) {
      selectedUnit = unit;
    } else {
      break;
    }
  }

  const value = bytes / UNIT_BYTES[selectedUnit];
  const display = `${value.toFixed(2)} ${selectedUnit}`;

  return { value, unit: selectedUnit, display };
}

/**
 * 解析人类可读格式为字节数
 * @param input 输入字符串（如 "10GB", "500MB", "1TB"）
 * @returns 字节数，无效输入返回 -1
 */
export function parseTraffic(input: string): number {
  const trimmed = input.trim().toUpperCase();

  // 处理特殊值
  if (trimmed === '无限制' || trimmed === 'UNLIMITED' || trimmed === '-1') {
    return -1;
  }

  // 匹配数字和单位
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);
  if (!match) {
    return -1;
  }

  const value = parseFloat(match[1]);
  const unit = (match[2]?.toUpperCase() || 'B') as TrafficUnit;

  if (isNaN(value) || value < 0) {
    return -1;
  }

  return Math.floor(value * UNIT_BYTES[unit]);
}

/**
 * 计算使用百分比
 * @param used 已使用字节数
 * @param quota 配额字节数（-1 表示无限制）
 * @returns 百分比（0-100），无限制返回 0
 */
export function calculateUsagePercent(used: number, quota: number): number {
  if (quota <= 0) {
    return 0; // 无限制
  }
  const percent = (used / quota) * 100;
  return Math.min(100, Math.round(percent * 100) / 100);
}

/**
 * 获取警告级别
 * @param usagePercent 使用百分比
 * @returns 警告级别
 */
export function getAlertLevel(usagePercent: number): 'normal' | 'warning' | 'exceeded' {
  if (usagePercent >= 100) {
    return 'exceeded';
  }
  if (usagePercent >= 80) {
    return 'warning';
  }
  return 'normal';
}

/**
 * 格式化剩余流量
 * @param used 已使用字节数
 * @param quota 配额字节数（-1 表示无限制）
 * @returns 格式化的剩余流量字符串
 */
export function formatRemaining(used: number, quota: number): string {
  if (quota < 0) {
    return '无限制';
  }
  const remaining = Math.max(0, quota - used);
  return formatTraffic(remaining).display;
}

/**
 * 格式化流量使用摘要
 * @param used 已使用字节数
 * @param quota 配额字节数（-1 表示无限制）
 * @returns 格式化的摘要字符串
 */
export function formatUsageSummary(used: number, quota: number): string {
  const usedStr = formatTraffic(used).display;
  if (quota < 0) {
    return `${usedStr} / 无限制`;
  }
  const quotaStr = formatTraffic(quota).display;
  const percent = calculateUsagePercent(used, quota);
  return `${usedStr} / ${quotaStr} (${percent}%)`;
}
