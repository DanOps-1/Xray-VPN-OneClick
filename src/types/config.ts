/**
 * Xray 配置文件类型定义
 * @module types/config
 */

/**
 * Xray 配置文件顶层结构
 * 对应文件: /usr/local/etc/xray/config.json
 */
export interface XrayConfig {
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

  /** Policy 配置（用于统计等功能） */
  policy?: PolicyConfig;
}

/**
 * 日志配置
 */
export interface LogConfig {
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
export interface Inbound {
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
 * 出站连接配置（客户端连接外部）
 */
export interface Outbound {
  /** 协议类型 */
  protocol: 'freedom' | 'blackhole' | 'socks' | 'http' | 'shadowsocks' | 'vmess' | 'vless';

  /** 协议特定配置 */
  settings?: OutboundSettings;

  /** 流传输配置 */
  streamSettings?: StreamSettings;

  /** 标签（用于路由引用） */
  tag: string;
}

/**
 * 入站协议配置（VLESS 为例）
 */
export interface InboundSettings {
  /** 客户端列表 */
  clients: XrayClient[];

  /** 解密方式（VLESS 必须为 "none"） */
  decryption?: string;

  /** 回落配置（用于伪装） */
  fallbacks?: Fallback[];
}

/**
 * 出站协议配置
 */
export interface OutboundSettings {
  /** 域名解析策略 */
  domainStrategy?: 'AsIs' | 'UseIP' | 'UseIPv4' | 'UseIPv6';

  /** 其他配置 */
  [key: string]: unknown;
}

/**
 * Xray 客户端（用户）
 */
export interface XrayClient {
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
export interface StreamSettings {
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
export interface TlsSettings {
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
export interface RealitySettings {
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
export interface Certificate {
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
export interface TcpSettings {
  /** HTTP 头部伪装 */
  header?: {
    type: 'none' | 'http';
    request?: HttpRequest;
    response?: HttpResponse;
  };
}

/**
 * HTTP 请求配置（用于伪装）
 */
export interface HttpRequest {
  version?: string;
  method?: string;
  path?: string[];
  headers?: Record<string, string[]>;
}

/**
 * HTTP 响应配置（用于伪装）
 */
export interface HttpResponse {
  version?: string;
  status?: string;
  reason?: string;
  headers?: Record<string, string[]>;
}

/**
 * WebSocket 配置
 */
export interface WsSettings {
  /** WebSocket 路径 */
  path: string;

  /** HTTP 头部 */
  headers?: Record<string, string>;
}

/**
 * 嗅探配置（流量识别）
 */
export interface SniffingConfig {
  /** 是否启用嗅探 */
  enabled: boolean;

  /** 嗅探目标: http, tls, quic */
  destOverride: ('http' | 'tls' | 'quic')[];
}

/**
 * 回落配置（用于伪装和负载均衡）
 */
export interface Fallback {
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
 * 路由配置
 */
export interface RoutingConfig {
  /** 域名解析策略 */
  domainStrategy?: 'AsIs' | 'IPIfNonMatch' | 'IPOnDemand';

  /** 路由规则列表 */
  rules?: RoutingRule[];
}

/**
 * 路由规则
 */
export interface RoutingRule {
  /** 规则类型 */
  type?: 'field';

  /** 域名匹配 */
  domain?: string[];

  /** IP 匹配 */
  ip?: string[];

  /** 端口匹配 */
  port?: string;

  /** 出站标签 */
  outboundTag: string;

  /** 入站标签 */
  inboundTag?: string[];
}

/**
 * DNS 配置
 */
export interface DnsConfig {
  /** DNS 服务器列表 */
  servers?: string[];

  /** 静态主机映射 */
  hosts?: Record<string, string | string[]>;

  /** 域名匹配 */
  tag?: string;
}

/**
 * Policy 配置（统计相关）
 */
export interface PolicyConfig {
  /** 用户等级配置 */
  levels?: Record<string, PolicyLevelConfig>;
  /** 系统级统计配置 */
  system?: PolicySystemConfig;
}

/**
 * Policy 用户等级配置
 */
export interface PolicyLevelConfig {
  /** 用户上行统计 */
  statsUserUplink?: boolean;
  /** 用户下行统计 */
  statsUserDownlink?: boolean;
  /** 允许其他扩展字段 */
  [key: string]: unknown;
}

/**
 * Policy 系统配置
 */
export interface PolicySystemConfig {
  /** 入站上行统计 */
  statsInboundUplink?: boolean;
  /** 入站下行统计 */
  statsInboundDownlink?: boolean;
  /** 允许其他扩展字段 */
  [key: string]: unknown;
}

/**
 * Stats 配置（启用流量统计）
 */
export interface StatsConfig {
  // 空对象即可启用统计功能
}

/**
 * API 服务类型
 */
export type ApiServiceType = 'StatsService' | 'HandlerService' | 'LoggerService' | 'RoutingService';

/**
 * API 配置（用于 Stats API）
 */
export interface ApiConfig {
  /** API 标签，用于路由引用 */
  tag: string;
  /** 启用的 API 服务列表 */
  services: ApiServiceType[];
}

/**
 * Dokodemo-door 入站设置（用于 API）
 */
export interface DokodemoSettings {
  /** 目标地址 */
  address: string;
}

/**
 * API 入站配置
 */
export interface ApiInbound {
  /** 入站标签 */
  tag: string;
  /** 监听端口 */
  port: number;
  /** 监听地址 */
  listen: string;
  /** 协议类型 */
  protocol: 'dokodemo-door';
  /** 协议设置 */
  settings: DokodemoSettings;
}

/**
 * 扩展的 Xray 配置（包含 Stats API）
 */
export interface XrayConfigWithStats extends Omit<XrayConfig, 'inbounds'> {
  /** Stats 配置 */
  stats?: StatsConfig;
  /** API 配置 */
  api?: ApiConfig;
  /** 入站连接配置（包含 API inbound） */
  inbounds: (Inbound | ApiInbound)[];
}
