/**
 * 服务管理相关类型定义
 * @module types/service
 */

/**
 * 服务状态信息
 */
export interface ServiceStatus {
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

  /** 服务是否健康（综合判断） */
  healthy: boolean;

  /** 最后日志行（可选） */
  lastLog?: string;
}

/**
 * 服务操作结果
 */
export interface ServiceOperationResult {
  /** 操作是否成功 */
  success: boolean;

  /** 操作类型 */
  operation: 'start' | 'stop' | 'restart' | 'enable' | 'disable' | 'status';

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

  /** 错误消息（如果失败） */
  error?: string;
}

/**
 * systemd 服务操作类型
 */
export type ServiceOperation =
  | 'start'
  | 'stop'
  | 'restart'
  | 'enable'
  | 'disable'
  | 'status'
  | 'is-active'
  | 'is-enabled'
  | 'show';

/**
 * systemd show 命令输出的属性映射
 */
export interface SystemdShowOutput {
  ActiveState?: string;
  SubState?: string;
  LoadState?: string;
  MainPID?: string;
  ExecMainStartTimestamp?: string;
  MemoryCurrent?: string;
  NRestarts?: string;
  [key: string]: string | undefined;
}

/**
 * 服务管理选项
 */
export interface ServiceManagerOptions {
  /** systemctl 命令路径 */
  systemctlPath?: string;

  /** 是否使用 sudo */
  useSudo?: boolean;

  /** 超时时间（毫秒） */
  timeout?: number;

  /** 是否启用详细日志 */
  verbose?: boolean;
}

/**
 * 优雅关闭选项
 */
export interface GracefulShutdownOptions {
  /** 优雅关闭超时（毫秒） */
  timeout: number;

  /** 是否等待连接完成 */
  waitForConnections?: boolean;

  /** 是否显示进度 */
  showProgress?: boolean;
}
