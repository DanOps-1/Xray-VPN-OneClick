# Data Model: Xray 服务管理 CLI 工具

**Feature**: npm-installable CLI tool for Xray service management
**Date**: 2026-01-07
**Phase 1**: Data Model Definition
**Input**: [spec.md](./spec.md), [research.md](./research.md)

---

## Overview

本文档定义 Xray 服务管理 CLI 工具涉及的所有核心实体、数据结构和领域模型。所有定义采用 TypeScript 类型系统表达，确保类型安全。

---

## 1. Core Entities (核心实体)

### 1.1 XrayConfig - Xray 配置

**描述**: Xray 核心配置文件的 TypeScript 类型定义

```typescript
/**
 * Xray 配置文件顶层结构
 * 对应文件: /usr/local/etc/xray/config.json
 */
interface XrayConfig {
  /** 日志配置 */
  log: LogConfig;

  /** 入站连接配置 */
  inbounds: Inbound[];

  /** 出站连接配置 */
  outbounds: Outbound[];

  /** 路由规则 */
  routing?: RoutingConfig;

  /** DNS 配置 */
  dns?: DnsConfig;
}

/**
 * 日志配置
 */
interface LogConfig {
  /** 日志级别: debug, info, warning, error, none */
  loglevel: 'debug' | 'info' | 'warning' | 'error' | 'none';

  /** 访问日志路径（空字符串表示不记录） */
  access: string;

  /** 错误日志路径（空字符串表示不记录） */
  error: string;
}

/**
 * 入站连接配置（服务端监听）
 */
interface Inbound {
  /** 监听端口 */
  port: number;

  /** 监听地址（默认 0.0.0.0） */
  listen?: string;

  /** 协议类型: vless, vmess, trojan, shadowsocks 等 */
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';

  /** 协议特定配置 */
  settings: InboundSettings;

  /** 流传输配置（TLS, TCP, WebSocket 等） */
  streamSettings?: StreamSettings;

  /** 嗅探配置 */
  sniffing?: SniffingConfig;

  /** 标签（用于路由引用） */
  tag?: string;
}

/**
 * 入站协议配置（VLESS 为例）
 */
interface InboundSettings {
  /** 客户端列表 */
  clients: XrayClient[];

  /** 解密方式（VLESS 必须为 "none"） */
  decryption?: string;

  /** 回落配置（用于伪装） */
  fallbacks?: Fallback[];
}

/**
 * Xray 客户端（用户）
 */
interface XrayClient {
  /** 用户唯一标识（UUID v4 格式） */
  id: string;

  /** 用户邮箱或标识符（用于管理） */
  email?: string;

  /** 协议级别（0 表示默认） */
  level?: number;

  /** 流控模式（xtls-rprx-vision 等） */
  flow?: string;
}

/**
 * 流传输配置
 */
interface StreamSettings {
  /** 传输层协议: tcp, ws, http, grpc 等 */
  network: 'tcp' | 'ws' | 'http' | 'grpc';

  /** TLS/Reality 安全配置 */
  security: 'none' | 'tls' | 'reality';

  /** TLS 配置 */
  tlsSettings?: TlsSettings;

  /** Reality 配置 */
  realitySettings?: RealitySettings;

  /** TCP 配置 */
  tcpSettings?: TcpSettings;

  /** WebSocket 配置 */
  wsSettings?: WsSettings;
}

/**
 * TLS 配置
 */
interface TlsSettings {
  /** 服务器名称指示（SNI） */
  serverName?: string;

  /** 证书配置 */
  certificates: Certificate[];

  /** ALPN 协议列表 */
  alpn?: string[];
}

/**
 * Reality 协议配置（新型伪装协议）
 */
interface RealitySettings {
  /** 目标网站地址（用于伪装） */
  dest: string;

  /** 服务器名称列表 */
  serverNames: string[];

  /** 私钥 */
  privateKey: string;

  /** 短 ID 列表 */
  shortIds: string[];

  /** 最小客户端版本 */
  minClientVer?: string;

  /** 最大客户端版本 */
  maxClientVer?: string;

  /** 最大时间差（秒） */
  maxTimeDiff?: number;
}

/**
 * 证书配置
 */
interface Certificate {
  /** 证书用途: sign, verify, issue */
  usage: 'sign' | 'verify' | 'issue';

  /** 证书文件路径 */
  certificateFile?: string;

  /** 私钥文件路径 */
  keyFile?: string;

  /** 证书内容（Base64 编码） */
  certificate?: string[];

  /** 私钥内容（Base64 编码） */
  key?: string[];
}

/**
 * TCP 配置
 */
interface TcpSettings {
  /** HTTP 头部伪装 */
  header?: {
    type: 'none' | 'http';
    request?: HttpRequest;
    response?: HttpResponse;
  };
}

/**
 * WebSocket 配置
 */
interface WsSettings {
  /** WebSocket 路径 */
  path: string;

  /** HTTP 头部 */
  headers?: Record<string, string>;
}

/**
 * 嗅探配置（流量识别）
 */
interface SniffingConfig {
  /** 是否启用嗅探 */
  enabled: boolean;

  /** 嗅探目标: http, tls, quic */
  destOverride: ('http' | 'tls' | 'quic')[];
}

/**
 * 回落配置（用于伪装和负载均衡）
 */
interface Fallback {
  /** ALPN 协议 */
  alpn?: string;

  /** 路径匹配 */
  path?: string;

  /** 目标地址 */
  dest: string | number;

  /** 目标 xver（PROXY protocol） */
  xver?: number;
}

/**
 * 出站连接配置
 */
interface Outbound {
  /** 协议类型 */
  protocol: 'freedom' | 'blackhole' | 'vless' | 'vmess';

  /** 协议配置 */
  settings?: OutboundSettings;

  /** 标签 */
  tag?: string;

  /** 流传输配置 */
  streamSettings?: StreamSettings;
}

/**
 * 出站协议配置
 */
interface OutboundSettings {
  /** 域名策略: AsIs, UseIP, UseIPv4, UseIPv6 */
  domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';

  /** 服务器列表（用于客户端） */
  vnext?: VNextServer[];
}

/**
 * 出站服务器配置
 */
interface VNextServer {
  /** 服务器地址 */
  address: string;

  /** 服务器端口 */
  port: number;

  /** 用户列表 */
  users: XrayClient[];
}

/**
 * 路由配置
 */
interface RoutingConfig {
  /** 域名解析策略 */
  domainStrategy?: 'AsIs' | 'IPIfNonMatch' | 'IPOnDemand';

  /** 路由规则 */
  rules: RoutingRule[];
}

/**
 * 路由规则
 */
interface RoutingRule {
  /** 规则类型: field */
  type: 'field';

  /** 域名列表 */
  domain?: string[];

  /** IP 列表 */
  ip?: string[];

  /** 端口范围 */
  port?: string;

  /** 入站标签 */
  inboundTag?: string[];

  /** 出站标签 */
  outboundTag: string;
}

/**
 * DNS 配置
 */
interface DnsConfig {
  /** DNS 服务器列表 */
  servers: (string | DnsServer)[];
}

/**
 * DNS 服务器配置
 */
interface DnsServer {
  /** 服务器地址 */
  address: string;

  /** 端口 */
  port?: number;

  /** 域名列表 */
  domains?: string[];
}

/**
 * HTTP 请求头（用于伪装）
 */
interface HttpRequest {
  version?: string;
  method?: string;
  path?: string[];
  headers?: Record<string, string[]>;
}

/**
 * HTTP 响应头（用于伪装）
 */
interface HttpResponse {
  version?: string;
  status?: string;
  reason?: string;
  headers?: Record<string, string[]>;
}
```

---

### 1.2 User - 用户管理

**描述**: CLI 工具管理的用户实体（对应 XrayClient）

```typescript
/**
 * 用户实体（CLI 层）
 */
interface User {
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
}

/**
 * 用户创建参数
 */
interface CreateUserParams {
  /** 用户邮箱或标识符 */
  email: string;

  /** 流控模式（可选，默认根据协议） */
  flow?: string;

  /** 协议级别（可选，默认 0） */
  level?: number;
}

/**
 * 用户分享信息
 */
interface UserShareInfo {
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
```

---

### 1.3 ServiceStatus - 服务状态

**描述**: systemd 服务状态信息

```typescript
/**
 * 服务状态信息
 */
interface ServiceStatus {
  /** 服务名称 */
  serviceName: string;

  /** 是否活跃 */
  active: boolean;

  /** 活跃状态: active, inactive, activating, deactivating, failed */
  activeState: 'active' | 'inactive' | 'activating' | 'deactivating' | 'failed';

  /** 子状态: running, exited, dead, failed, etc. */
  subState: string;

  /** 是否已加载 */
  loaded: boolean;

  /** 主进程 PID */
  pid: number | null;

  /** 运行时长（格式化字符串，如 "2天 3小时 15分钟"） */
  uptime: string;

  /** 内存占用（格式化字符串，如 "45.2 MB"） */
  memory: string;

  /** 重启次数 */
  restarts: number;

  /** 最后结果: success, failure, timeout, signal */
  result: string;

  /** 服务是否健康（active + running） */
  healthy: boolean;

  /** 错误信息（如有） */
  error?: string;
}

/**
 * 服务控制操作结果
 */
interface ServiceOperationResult {
  /** 操作是否成功 */
  success: boolean;

  /** 操作类型 */
  operation: 'start' | 'stop' | 'restart' | 'enable' | 'disable';

  /** 服务名称 */
  serviceName: string;

  /** 标准输出 */
  stdout?: string;

  /** 错误输出 */
  stderr?: string;

  /** 退出代码 */
  exitCode: number;

  /** 执行时长（毫秒） */
  duration?: number;

  /** 中断时间（毫秒，仅 restart） */
  downtime?: number;
}
```

---

### 1.4 ConfigBackup - 配置备份

**描述**: 配置文件备份管理

```typescript
/**
 * 配置备份记录
 */
interface ConfigBackup {
  /** 备份文件名 */
  filename: string;

  /** 完整路径 */
  path: string;

  /** 备份时间（ISO 8601 字符串） */
  timestamp: string;

  /** 文件大小（字节） */
  size: number;

  /** 备份原因 */
  reason: 'manual' | 'auto_before_modify' | 'auto_before_restore';

  /** 创建者 */
  createdBy?: string;

  /** 备份描述 */
  description?: string;
}

/**
 * 配置备份选项
 */
interface BackupOptions {
  /** 备份原因 */
  reason?: string;

  /** 备份描述 */
  description?: string;

  /** 备份目录（默认 /var/backups/xray/） */
  backupDir?: string;
}

/**
 * 配置恢复结果
 */
interface RestoreResult {
  /** 是否成功 */
  success: boolean;

  /** 恢复的备份文件 */
  backup: ConfigBackup;

  /** 恢复前自动备份 */
  preRestoreBackup?: ConfigBackup;

  /** 服务是否已重启 */
  serviceRestarted: boolean;

  /** 错误信息（如有） */
  error?: string;
}
```

---

### 1.5 LogEntry - 日志条目

**描述**: 服务日志条目

```typescript
/**
 * 日志条目
 */
interface LogEntry {
  /** 时间戳（ISO 8601） */
  timestamp: string;

  /** 日志级别 */
  level: 'debug' | 'info' | 'warning' | 'error';

  /** 进程 PID */
  pid?: number;

  /** 日志消息 */
  message: string;

  /** 原始日志行（未解析） */
  raw?: string;
}

/**
 * 日志查询选项
 */
interface LogQueryOptions {
  /** 查询行数（默认 50） */
  lines?: number;

  /** 时间范围（如 "1 hour ago", "2024-01-07 10:00:00"） */
  since?: string;

  /** 是否实时跟踪 */
  follow?: boolean;

  /** 过滤级别 */
  level?: 'debug' | 'info' | 'warning' | 'error';

  /** 关键词过滤 */
  grep?: string;
}
```

---

### 1.6 CLICommand - 命令定义

**描述**: CLI 命令结构（用于 Commander.js）

```typescript
/**
 * CLI 主命令
 */
type MainCommand =
  | 'interactive'  // 交互式菜单（默认）
  | 'service'      // 服务管理
  | 'user'         // 用户管理
  | 'config'       // 配置管理
  | 'logs'         // 日志查看
  | 'version'      // 版本信息
  | 'help';        // 帮助信息

/**
 * 服务管理子命令
 */
type ServiceSubCommand =
  | 'start'    // 启动服务
  | 'stop'     // 停止服务
  | 'restart'  // 重启服务
  | 'status'   // 查看状态
  | 'enable'   // 开机自启
  | 'disable'; // 禁用自启

/**
 * 用户管理子命令
 */
type UserSubCommand =
  | 'list'     // 列出所有用户
  | 'add'      // 添加用户
  | 'delete'   // 删除用户
  | 'show'     // 显示分享链接
  | 'export';  // 导出用户列表

/**
 * 配置管理子命令
 */
type ConfigSubCommand =
  | 'show'     // 查看配置
  | 'edit'     // 编辑配置
  | 'backup'   // 备份配置
  | 'restore'  // 恢复配置
  | 'validate';// 验证配置

/**
 * 日志管理子命令
 */
type LogsSubCommand =
  | 'view'     // 查看日志
  | 'follow'   // 实时跟踪
  | 'export';  // 导出日志

/**
 * CLI 命令选项
 */
interface CLIOptions {
  /** 是否静默模式（无交互） */
  silent?: boolean;

  /** 是否输出 JSON 格式 */
  json?: boolean;

  /** 是否详细输出 */
  verbose?: boolean;

  /** 配置文件路径（覆盖默认） */
  config?: string;

  /** 服务名称（默认 xray） */
  service?: string;
}
```

---

## 2. Validation Rules (验证规则)

### 2.1 用户输入验证

```typescript
/**
 * 邮箱验证规则
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * UUID v4 验证规则
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 端口号验证规则（1-65535）
 */
const PORT_REGEX = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

/**
 * 域名验证规则
 */
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/**
 * 服务名验证规则（仅字母数字、@、._-）
 */
const SERVICE_NAME_REGEX = /^[a-zA-Z0-9@._-]+$/;

/**
 * 验证器函数
 */
interface Validator {
  validate(value: string): boolean;
  errorMessage: string;
}

const validators: Record<string, Validator> = {
  email: {
    validate: (value) => EMAIL_REGEX.test(value),
    errorMessage: '请输入有效的邮箱地址（如 user@example.com）'
  },

  uuid: {
    validate: (value) => UUID_V4_REGEX.test(value),
    errorMessage: '请输入有效的 UUID v4 格式'
  },

  port: {
    validate: (value) => {
      const num = parseInt(value);
      return PORT_REGEX.test(value) && num >= 1 && num <= 65535;
    },
    errorMessage: '端口号必须在 1-65535 之间'
  },

  domain: {
    validate: (value) => DOMAIN_REGEX.test(value),
    errorMessage: '请输入有效的域名（如 example.com）'
  },

  serviceName: {
    validate: (value) => SERVICE_NAME_REGEX.test(value),
    errorMessage: '服务名仅允许包含字母、数字、@、.、_、- 字符'
  }
};
```

---

### 2.2 配置文件验证

```typescript
/**
 * 配置验证结果
 */
interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean;

  /** 错误列表 */
  errors: ConfigValidationError[];

  /** 警告列表 */
  warnings: string[];
}

/**
 * 配置验证错误
 */
interface ConfigValidationError {
  /** 错误路径（JSONPath 格式） */
  path: string;

  /** 错误消息 */
  message: string;

  /** 严重程度 */
  severity: 'error' | 'warning';

  /** 建议修复方案 */
  suggestion?: string;
}

/**
 * 配置验证规则
 */
const configValidationRules = {
  // 必须包含至少一个 inbound
  inboundsRequired: (config: XrayConfig) =>
    config.inbounds && config.inbounds.length > 0,

  // 必须包含至少一个 outbound
  outboundsRequired: (config: XrayConfig) =>
    config.outbounds && config.outbounds.length > 0,

  // 端口范围验证
  validPorts: (config: XrayConfig) =>
    config.inbounds.every(inbound =>
      inbound.port >= 1 && inbound.port <= 65535
    ),

  // 用户 UUID 格式验证
  validClientIds: (config: XrayConfig) =>
    config.inbounds.every(inbound =>
      inbound.settings?.clients?.every(client =>
        UUID_V4_REGEX.test(client.id)
      ) ?? true
    ),

  // TLS 证书路径验证
  validCertificates: (config: XrayConfig) => {
    // 验证证书文件是否存在（在实际文件系统中检查）
    return true; // 实现省略
  }
};
```

---

## 3. Constants and Enums (常量和枚举)

```typescript
/**
 * 默认配置路径
 */
export const DEFAULT_PATHS = {
  /** Xray 配置文件 */
  CONFIG: '/usr/local/etc/xray/config.json',

  /** Xray 二进制文件 */
  BINARY: '/usr/local/bin/xray',

  /** systemd 服务文件 */
  SERVICE: '/etc/systemd/system/xray.service',

  /** 备份目录 */
  BACKUP_DIR: '/var/backups/xray/',

  /** 日志目录 */
  LOG_DIR: '/var/log/xray/'
} as const;

/**
 * 默认端口
 */
export const DEFAULT_PORTS = {
  /** VLESS/VMESS 默认端口 */
  VLESS: 443,

  /** Trojan 默认端口 */
  TROJAN: 443,

  /** Shadowsocks 默认端口 */
  SHADOWSOCKS: 8388
} as const;

/**
 * 超时时间（毫秒）
 */
export const TIMEOUTS = {
  /** systemctl 启动超时 */
  SERVICE_START: 15000,

  /** systemctl 停止超时 */
  SERVICE_STOP: 10000,

  /** systemctl 重启超时 */
  SERVICE_RESTART: 30000,

  /** systemctl 状态查询超时 */
  SERVICE_STATUS: 5000,

  /** 优雅关闭超时（符合 FR-016） */
  GRACEFUL_SHUTDOWN: 10000
} as const;

/**
 * 协议类型
 */
export enum Protocol {
  VLESS = 'vless',
  VMESS = 'vmess',
  TROJAN = 'trojan',
  SHADOWSOCKS = 'shadowsocks'
}

/**
 * 传输层协议
 */
export enum Network {
  TCP = 'tcp',
  WS = 'ws',
  HTTP = 'http',
  GRPC = 'grpc'
}

/**
 * 安全协议
 */
export enum Security {
  NONE = 'none',
  TLS = 'tls',
  REALITY = 'reality'
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  NONE = 'none'
}

/**
 * 用户状态
 */
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

/**
 * 服务状态
 */
export enum ServiceState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ACTIVATING = 'activating',
  DEACTIVATING = 'deactivating',
  FAILED = 'failed'
}
```

---

## 4. Utility Types (工具类型)

```typescript
/**
 * 脱敏显示选项
 */
interface MaskOptions {
  /** 显示前 N 位 */
  prefixLength: number;

  /** 显示后 N 位 */
  suffixLength: number;

  /** 遮罩字符 */
  maskChar: string;
}

/**
 * 脱敏结果
 */
interface MaskedValue {
  /** 脱敏后的显示值 */
  masked: string;

  /** 原始完整值 */
  original: string;

  /** 是否已复制到剪贴板 */
  copied: boolean;
}

/**
 * 分页结果
 */
interface Paginated<T> {
  /** 数据项 */
  items: T[];

  /** 总数 */
  total: number;

  /** 当前页 */
  page: number;

  /** 每页数量 */
  pageSize: number;

  /** 总页数 */
  totalPages: number;

  /** 是否有下一页 */
  hasNext: boolean;

  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * API 响应包装
 */
interface ApiResponse<T> {
  /** 是否成功 */
  success: boolean;

  /** 响应数据 */
  data?: T;

  /** 错误信息 */
  error?: string;

  /** 错误代码 */
  code?: string;

  /** 时间戳 */
  timestamp: string;
}

/**
 * 进度信息
 */
interface Progress {
  /** 当前进度（0-100） */
  current: number;

  /** 总数 */
  total: number;

  /** 百分比（0-100） */
  percentage: number;

  /** 状态消息 */
  message: string;

  /** 是否完成 */
  done: boolean;
}
```

---

## 5. Domain Logic Interfaces (领域逻辑接口)

```typescript
/**
 * 用户管理服务接口
 */
interface IUserManager {
  /** 列出所有用户 */
  listUsers(): Promise<User[]>;

  /** 添加新用户 */
  addUser(params: CreateUserParams): Promise<User>;

  /** 删除用户 */
  deleteUser(userId: string): Promise<boolean>;

  /** 获取用户分享信息 */
  getShareInfo(userId: string): Promise<UserShareInfo>;

  /** 验证用户是否存在 */
  userExists(userId: string): Promise<boolean>;
}

/**
 * 配置管理服务接口
 */
interface IConfigManager {
  /** 读取配置 */
  readConfig(): Promise<XrayConfig>;

  /** 写入配置 */
  writeConfig(config: XrayConfig): Promise<void>;

  /** 验证配置 */
  validateConfig(config: XrayConfig): ConfigValidationResult;

  /** 备份配置 */
  backupConfig(options?: BackupOptions): Promise<ConfigBackup>;

  /** 恢复配置 */
  restoreConfig(backup: ConfigBackup): Promise<RestoreResult>;

  /** 列出所有备份 */
  listBackups(): Promise<ConfigBackup[]>;
}

/**
 * 服务管理服务接口
 */
interface IServiceManager {
  /** 启动服务 */
  start(): Promise<ServiceOperationResult>;

  /** 停止服务 */
  stop(): Promise<ServiceOperationResult>;

  /** 重启服务（优雅关闭） */
  restart(): Promise<ServiceOperationResult>;

  /** 获取服务状态 */
  getStatus(): Promise<ServiceStatus>;

  /** 检查服务是否活跃 */
  isActive(): Promise<boolean>;

  /** 启用开机自启 */
  enable(): Promise<ServiceOperationResult>;

  /** 禁用开机自启 */
  disable(): Promise<ServiceOperationResult>;
}

/**
 * 日志管理服务接口
 */
interface ILogManager {
  /** 查询日志 */
  queryLogs(options: LogQueryOptions): Promise<LogEntry[]>;

  /** 实时跟踪日志 */
  followLogs(callback: (entry: LogEntry) => void): Promise<void>;

  /** 导出日志 */
  exportLogs(outputPath: string, options: LogQueryOptions): Promise<void>;
}
```

---

## 6. Error Types (错误类型)

```typescript
/**
 * 基础错误类
 */
class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 配置错误
 */
class ConfigError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
  }
}

/**
 * 服务错误
 */
class ServiceError extends BaseError {
  constructor(
    message: string,
    public exitCode?: number,
    public stderr?: string,
    public suggestions: string[] = []
  ) {
    super(message, 'SERVICE_ERROR', { exitCode, stderr, suggestions });
  }
}

/**
 * 用户错误
 */
class UserError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 'USER_ERROR', details);
  }
}

/**
 * 验证错误
 */
class ValidationError extends BaseError {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message, 'VALIDATION_ERROR', { field, value });
  }
}

/**
 * 权限错误
 */
class PermissionError extends BaseError {
  constructor(message: string, public requiredPermission: string) {
    super(message, 'PERMISSION_ERROR', { requiredPermission });
  }
}
```

---

## 7. Type Guards (类型守卫)

```typescript
/**
 * 检查是否为有效的 UUID v4
 */
function isUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

/**
 * 检查是否为有效的邮箱
 */
function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * 检查是否为有效的端口号
 */
function isValidPort(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

/**
 * 检查是否为有效的 Xray 配置
 */
function isValidXrayConfig(obj: any): obj is XrayConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.inbounds) &&
    Array.isArray(obj.outbounds) &&
    obj.inbounds.length > 0 &&
    obj.outbounds.length > 0
  );
}

/**
 * 检查服务是否健康
 */
function isServiceHealthy(status: ServiceStatus): boolean {
  return status.active && status.activeState === 'active' && status.subState === 'running';
}
```

---

## 8. Data Transformation (数据转换)

```typescript
/**
 * 将 XrayClient 转换为 User
 */
function clientToUser(client: XrayClient): User {
  return {
    id: client.id,
    email: client.email || 'unknown',
    createdAt: new Date().toISOString(),
    status: 'active',
    flow: client.flow,
    level: client.level || 0
  };
}

/**
 * 将 User 转换为 XrayClient
 */
function userToClient(user: User): XrayClient {
  return {
    id: user.id,
    email: user.email,
    level: user.level,
    flow: user.flow
  };
}

/**
 * 脱敏显示敏感信息（符合 CR-001）
 */
function maskSensitiveValue(
  value: string,
  options: MaskOptions = { prefixLength: 4, suffixLength: 4, maskChar: '*' }
): MaskedValue {
  const { prefixLength, suffixLength, maskChar } = options;

  if (value.length <= prefixLength + suffixLength) {
    return {
      masked: maskChar.repeat(value.length),
      original: value,
      copied: false
    };
  }

  const prefix = value.slice(0, prefixLength);
  const suffix = value.slice(-suffixLength);
  const maskLength = value.length - prefixLength - suffixLength;
  const masked = `${prefix}${maskChar.repeat(maskLength)}${suffix}`;

  return {
    masked,
    original: value,
    copied: false
  };
}

/**
 * 格式化运行时长
 */
function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
```

---

## 9. Constitution Compliance (宪章合规性)

### ✅ CR-001: 安全性
- **敏感信息脱敏**: `maskSensitiveValue()` 函数实现前4后4显示
- **UUID 自动生成**: 不允许硬编码，所有 ID 通过 `crypto.randomUUID()` 生成
- **输入验证**: 所有验证器（validators）严格验证用户输入
- **错误类型安全**: TypeScript 类型系统确保编译时安全

### ✅ CR-002: 简洁易用
- **清晰的类型定义**: 所有接口都有 JSDoc 注释
- **工具函数**: 提供 `formatUptime()`, `formatBytes()` 等格式化工具
- **错误提示**: `ServiceError` 包含 `suggestions` 字段

### ✅ CR-003: 可靠稳定
- **配置验证**: `ConfigValidationResult` 提供详细验证结果
- **备份机制**: `ConfigBackup` 和 `RestoreResult` 支持自动备份恢复
- **状态检查**: `ServiceStatus` 提供全面的健康检查信息

### ✅ CR-004: 测试优先
- **接口定义**: 所有服务接口（`IUserManager` 等）便于 mock 测试
- **类型守卫**: 提供 `isValidXrayConfig()` 等测试辅助函数
- **错误类型**: 明确的错误类型便于测试错误路径

### ✅ CR-005: 文档完整
- **所有接口包含 JSDoc 注释**: 说明每个字段的含义
- **示例常量**: `DEFAULT_PATHS`, `TIMEOUTS` 等提供清晰的默认值
- **类型导出**: 所有类型可被外部引用和文档化

---

## 10. Next Steps

1. **Phase 1**: 基于这些类型定义生成 `contracts/` 目录中的 CLI 命令合约
2. **Phase 2**: 在 `src/types/` 中创建对应的 TypeScript 类型文件
3. **Phase 2**: 实现 `src/services/` 中的服务类（实现 `I*Manager` 接口）
4. **Phase 2**: 编写单元测试验证数据模型的完整性和正确性

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
**下一步**: 生成 contracts/ 目录
