/**
 * UI Symbols Constants
 * @module constants/ui-symbols
 *
 * This file defines all text-based icons and status indicators
 * used throughout the CLI for universal terminal compatibility.
 */

/**
 * Status icons for different message types
 * These replace emoji indicators with text-based alternatives
 */
export const statusIcons = {
  SUCCESS: '[OK]',
  ERROR: '[ERROR]',
  WARN: '[WARN]',
  INFO: '[INFO]',
  DEBUG: '[DEBUG]',
  LOADING: '[...]',
  PROGRESS: '[>>]',
  HINT: '[TIP]',
} as const;

/**
 * Menu icons for different CLI operations
 * These replace emoji in menu options with text labels
 */
export const menuIcons = {
  STATUS: '[查看]',
  START: '[启动]',
  STOP: '[停止]',
  RESTART: '[重启]',
  USER: '[用户]',
  CONFIG: '[配置]',
  LOGS: '[日志]',
  LANGUAGE: '[语言]',
  EXIT: '[退出]',
  STATS: '[流量]',
  QUOTA: '[配额]',
  VIEW: '[查看]',
  BACK: '[返回]',
  ERROR: '[错误]',
  WARNING: '[警告]',
  BACKUP: '[备份]',
  RESTORE: '[恢复]',
} as const;

// Type exports for TypeScript support
export type StatusIcon = (typeof statusIcons)[keyof typeof statusIcons];
export type MenuIcon = (typeof menuIcons)[keyof typeof menuIcons];
