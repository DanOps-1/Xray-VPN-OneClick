/**
 * 流量配额相关类型定义
 * @module types/quota
 */

/**
 * 流量配额类型
 */
export type QuotaType = 'limited' | 'unlimited';

/**
 * 配额状态
 */
export type QuotaStatus = 'active' | 'disabled' | 'exceeded';

/**
 * 警告级别
 */
export type AlertLevel = 'normal' | 'warning' | 'exceeded';

/**
 * 流量单位
 */
export type TrafficUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * 流量配额
 */
export interface TrafficQuota {
  /** 配额总量（字节），-1 表示无限制 */
  quotaBytes: number;
  /** 配额类型 */
  quotaType: QuotaType;
  /** 已使用流量（字节） */
  usedBytes: number;
  /** 上次重置时间（ISO 8601） */
  lastReset: string;
  /** 状态 */
  status: QuotaStatus;
}

/**
 * 流量使用情况
 */
export interface TrafficUsage {
  /** 用户邮箱标识 */
  email: string;
  /** 上行流量（字节） */
  uplink: number;
  /** 下行流量（字节） */
  downlink: number;
  /** 总流量（字节） */
  total: number;
  /** 查询时间（ISO 8601） */
  queriedAt: string;
}

/**
 * 带配额的用户
 */
export interface UserWithQuota {
  /** 用户 UUID */
  id: string;
  /** 用户邮箱标识 */
  email: string;
  /** 流量配额配置 */
  quota: TrafficQuota;
  /** 当前流量使用（可能不可用） */
  usage?: TrafficUsage;
  /** 使用百分比（0-100，无限制时为 0） */
  usagePercent?: number;
  /** 警告级别 */
  alertLevel?: AlertLevel;
}

/**
 * 配额配置文件
 */
export interface QuotaConfig {
  /** 配置版本号 */
  version: string;
  /** Xray Stats API 端口 */
  apiPort: number;
  /** 用户配额映射（key 为 email） */
  users: Record<string, TrafficQuota>;
}

/**
 * 配额设置参数
 */
export interface SetQuotaParams {
  /** 用户邮箱 */
  email: string;
  /** 配额字节数（-1 表示无限制） */
  quotaBytes: number;
  /** 配额类型 */
  quotaType: QuotaType;
}

/**
 * 格式化的流量值
 */
export interface FormattedTraffic {
  /** 数值 */
  value: number;
  /** 单位 */
  unit: TrafficUnit;
  /** 显示字符串 */
  display: string;
}

/**
 * Xray Stats API 响应
 */
export interface XrayStatsResponse {
  stat: Array<{
    name: string;
    value: number;
  }>;
}

/**
 * 默认配额值
 */
export const DEFAULT_QUOTA: TrafficQuota = {
  quotaBytes: -1,
  quotaType: 'unlimited',
  usedBytes: 0,
  lastReset: new Date().toISOString(),
  status: 'active',
};

/**
 * 默认配额配置
 */
export const DEFAULT_QUOTA_CONFIG: QuotaConfig = {
  version: '1.0',
  apiPort: 10085,
  users: {},
};

/**
 * Stats API 缺失组件类型
 */
export type MissingComponent = 'stats' | 'api' | 'api-inbound' | 'api-routing';

/**
 * Stats API 检测结果
 */
export interface StatsDetectionResult {
  /** API 是否可用（可连接） */
  available: boolean;
  /** 配置文件中是否检测到 stats 配置 */
  configDetected: boolean;
  /** 检测到的 API 端口 */
  detectedPort?: number;
  /** Xray 服务是否运行 */
  serviceRunning: boolean;
  /** 状态描述消息 */
  message: string;
  /** 建议操作 */
  suggestion?: string;
  /** 缺失的配置组件列表 */
  missingComponents: MissingComponent[];
}

/**
 * Stats API 配置结果
 */
export interface StatsConfigResult {
  /** 配置是否成功 */
  success: boolean;
  /** 备份文件路径 */
  backupPath?: string;
  /** 配置的 API 端口 */
  apiPort: number;
  /** 结果消息 */
  message: string;
  /** 错误信息（如果失败） */
  error?: string;
  /** 是否已回滚 */
  rolledBack: boolean;
}
