/**
 * 流量配额相关常量
 * @module constants/quota
 */

/**
 * 配额配置文件路径
 */
export const QUOTA_CONFIG_PATH = '/usr/local/etc/xray/quota.json';

/**
 * 默认 Xray Stats API 端口
 */
export const DEFAULT_API_PORT = 10085;

/**
 * 默认 API 服务器地址
 */
export const DEFAULT_API_SERVER = '127.0.0.1';

/**
 * 警告阈值（百分比）
 */
export const WARNING_THRESHOLD = 80;

/**
 * 超额阈值（百分比）
 */
export const EXCEEDED_THRESHOLD = 100;

/**
 * Xray Stats 命令
 */
export const XRAY_STATS_COMMAND = 'xray';

/**
 * Stats API 子命令
 */
export const STATS_SUBCOMMAND = 'api';

/**
 * 流量统计名称模式
 */
export const STATS_PATTERNS = {
  /** 用户上行流量 */
  USER_UPLINK: (email: string) => `user>>>${email}>>>traffic>>>uplink`,
  /** 用户下行流量 */
  USER_DOWNLINK: (email: string) => `user>>>${email}>>>traffic>>>downlink`,
};

/**
 * 配额配置版本
 */
export const QUOTA_CONFIG_VERSION = '1.0';

/**
 * 单位字节数映射
 */
export const UNIT_BYTES = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
} as const;

/**
 * 预设配额选项（用于 UI）
 */
export const PRESET_QUOTAS = [
  { label: '1 GB', bytes: 1 * UNIT_BYTES.GB },
  { label: '5 GB', bytes: 5 * UNIT_BYTES.GB },
  { label: '10 GB', bytes: 10 * UNIT_BYTES.GB },
  { label: '50 GB', bytes: 50 * UNIT_BYTES.GB },
  { label: '100 GB', bytes: 100 * UNIT_BYTES.GB },
  { label: '500 GB', bytes: 500 * UNIT_BYTES.GB },
  { label: '1 TB', bytes: 1 * UNIT_BYTES.TB },
  { label: '无限制', bytes: -1 },
];

/**
 * 默认 Stats API 配置
 */
export const DEFAULT_STATS_CONFIG = {
  /** Stats 配置块（空对象启用统计） */
  stats: {},

  /** Policy 配置（启用用户和入站流量统计） */
  policy: {
    levels: {
      '0': {
        statsUserUplink: true,
        statsUserDownlink: true,
      },
    },
    system: {
      statsInboundUplink: true,
      statsInboundDownlink: true,
    },
  },

  /** API 配置 */
  api: {
    tag: 'api',
    services: ['StatsService'] as const,
  },

  /** API 入站配置 */
  apiInbound: {
    tag: 'api',
    port: DEFAULT_API_PORT,
    listen: DEFAULT_API_SERVER,
    protocol: 'dokodemo-door' as const,
    settings: {
      address: DEFAULT_API_SERVER,
    },
  },

  /** API 路由规则 */
  apiRoutingRule: {
    type: 'field' as const,
    inboundTag: ['api'],
    outboundTag: 'api',
  },

  /** API 出站配置 */
  apiOutbound: {
    protocol: 'freedom' as const,
    tag: 'api',
  },
} as const;

/**
 * Stats API 端口范围
 */
export const STATS_PORT_RANGE = {
  /** 起始端口 */
  START: 10085,
  /** 结束端口 */
  END: 10099,
} as const;

/**
 * Stats API 连接超时（毫秒）
 */
export const STATS_API_TIMEOUT = 5000;

/**
 * 服务重启等待时间（毫秒）
 */
export const SERVICE_RESTART_WAIT = 2000;
