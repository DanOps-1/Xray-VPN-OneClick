/**
 * 路径常量定义
 * @module constants/paths
 */

import { homedir } from 'os';
import { join } from 'path';

/**
 * 默认路径配置
 */
export const DEFAULT_PATHS = {
  /** Xray 配置文件路径 */
  CONFIG_FILE: '/usr/local/etc/xray/config.json',

  /** Xray 配置目录 */
  CONFIG_DIR: '/usr/local/etc/xray',

  /** 配置备份目录 */
  BACKUP_DIR: '/var/backups/xray',

  /** systemd 服务名称 */
  SERVICE_NAME: 'xray',

  /** systemd 服务文件路径 */
  SERVICE_FILE: '/etc/systemd/system/xray.service',

  /** Xray 可执行文件路径 */
  XRAY_BINARY: '/usr/local/bin/xray',

  /** 日志目录（如果使用文件日志） */
  LOG_DIR: '/var/log/xray',

  /** 访问日志文件 */
  ACCESS_LOG: '/var/log/xray/access.log',

  /** 错误日志文件 */
  ERROR_LOG: '/var/log/xray/error.log',

  /** 临时文件目录 */
  TEMP_DIR: '/tmp/xray-manager',

  /** 用户配置目录（~/.xray-manager） */
  USER_CONFIG_DIR: join(homedir(), '.xray-manager'),

  /** 用户配置文件 */
  USER_CONFIG_FILE: join(homedir(), '.xray-manager', 'config.json'),
} as const;

/**
 * 路径验证规则
 */
export const PATH_VALIDATION = {
  /** 配置文件必须以 .json 结尾 */
  CONFIG_FILE_EXTENSION: '.json',

  /** 备份文件命名格式 */
  BACKUP_FILE_PATTERN: /^config\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.json$/,

  /** 最大路径长度 */
  MAX_PATH_LENGTH: 4096,
} as const;

/**
 * 备份文件名生成
 */
export function getBackupFileName(timestamp: Date = new Date()): string {
  const isoString = timestamp.toISOString().replace(/:/g, '-');
  return `config.${isoString}.json`;
}

/**
 * 获取完整备份路径
 */
export function getBackupFilePath(timestamp?: Date): string {
  return join(DEFAULT_PATHS.BACKUP_DIR, getBackupFileName(timestamp));
}

/**
 * 检查路径是否为备份文件
 */
export function isBackupFile(filename: string): boolean {
  return PATH_VALIDATION.BACKUP_FILE_PATTERN.test(filename);
}
