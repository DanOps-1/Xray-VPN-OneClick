/**
 * 用户管理相关类型定义
 * @module types/user
 */

import type { TrafficQuota, TrafficUsage, AlertLevel } from './quota';

/**
 * 用户实体
 */
export interface User {
  /** 用户唯一标识（UUID v4） */
  id: string;

  /** 用户邮箱或标识符 */
  email: string;

  /** 创建时间（ISO 8601 字符串） */
  createdAt: string;

  /** 状态：active, disabled */
  status: 'active' | 'disabled';

  /** 流控模式（可选） */
  flow?: string;

  /** 协议级别 */
  level: number;

  /** 最后修改时间 */
  updatedAt?: string;

  /** 流量配额（可选） */
  quota?: TrafficQuota;

  /** 当前流量使用（可选） */
  usage?: TrafficUsage;

  /** 使用百分比（0-100，无限制时为 0） */
  usagePercent?: number;

  /** 警告级别 */
  alertLevel?: AlertLevel;
}

/**
 * 用户配置（用于显示）
 */
export interface UserConfig {
  username: string;
  uuid: string;
  port?: number;
  protocol?: string;
  flow?: string;
  status?: string;
}

/**
 * 用户创建参数
 */
export interface CreateUserParams {
  /** 用户邮箱或标识符 */
  email: string;

  /** 流控模式（可选，默认根据协议） */
  flow?: string;

  /** 协议级别（可选，默认 0） */
  level?: number;
}

/**
 * 用户更新参数
 */
export interface UpdateUserParams {
  /** 用户邮箱或标识符（用于查找） */
  email: string;

  /** 新的流控模式（可选） */
  flow?: string;

  /** 新的协议级别（可选） */
  level?: number;

  /** 新的状态（可选） */
  status?: 'active' | 'disabled';
}

/**
 * 用户分享信息
 */
export interface UserShareInfo {
  /** 用户基本信息 */
  user: User;

  /** VLESS/VMESS 分享链接 */
  shareLink: string;

  /** 服务器地址 */
  serverAddress: string;

  /** 服务器端口 */
  serverPort: number;

  /** 协议类型 */
  protocol: string;

  /** TLS/Reality 配置 */
  security: string;

  /** 服务器名称（SNI） */
  serverName?: string;

  /** Public Key (Reality) */
  publicKey?: string;

  /** Short ID (Reality) */
  shortId?: string;

  /** 二维码 ASCII 艺术（可选） */
  qrCode?: string;
}

/**
 * 用户列表查询选项
 */
export interface ListUsersOptions {
  /** 过滤状态 */
  status?: 'active' | 'disabled';

  /** 排序字段 */
  sortBy?: 'createdAt' | 'email' | 'updatedAt';

  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';

  /** 分页：跳过数量 */
  skip?: number;

  /** 分页：限制数量 */
  limit?: number;
}

/**
 * 用户操作结果
 */
export interface UserOperationResult {
  /** 操作是否成功 */
  success: boolean;

  /** 操作类型 */
  operation: 'add' | 'delete' | 'update' | 'list' | 'show';

  /** 用户信息（如果适用） */
  user?: User;

  /** 用户列表（如果适用） */
  users?: User[];

  /** 错误消息（如果失败） */
  error?: string;

  /** 是否需要重启服务 */
  needsRestart?: boolean;
}

/**
 * 脱敏后的值
 */
export interface MaskedValue {
  /** 脱敏显示的值（前4后4） */
  masked: string;

  /** 原始完整值 */
  original: string;
}