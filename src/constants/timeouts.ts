/**
 * 超时时间常量定义
 * @module constants/timeouts
 */

/**
 * 超时配置（单位：毫秒）
 */
export const TIMEOUTS = {
  /** systemctl 命令默认超时 */
  SYSTEMCTL_DEFAULT: 30000, // 30 秒

  /** 服务启动超时 */
  SERVICE_START: 15000, // 15 秒

  /** 服务停止超时（优雅关闭） */
  SERVICE_STOP: 10000, // 10 秒

  /** 服务重启超时 */
  SERVICE_RESTART: 25000, // 25 秒

  /** 服务状态查询超时 */
  SERVICE_STATUS: 5000, // 5 秒

  /** 配置文件读写超时 */
  CONFIG_IO: 5000, // 5 秒

  /** 配置备份操作超时 */
  CONFIG_BACKUP: 10000, // 10 秒

  /** 日志查询超时 */
  LOG_QUERY: 10000, // 10 秒

  /** 网络操作超时（下载、检查更新） */
  NETWORK: 30000, // 30 秒

  /** 用户输入超时（交互式菜单） */
  USER_INPUT: 60000, // 60 秒

  /** 文件系统操作超时 */
  FILESYSTEM: 10000, // 10 秒

  /** 优雅关闭等待时间 */
  GRACEFUL_SHUTDOWN: 10000, // 10 秒

  /** 进程杀死前等待时间 */
  KILL_WAIT: 2000, // 2 秒

  /** 菜单刷新间隔 */
  MENU_REFRESH: 1000, // 1 秒

  /** 状态轮询间隔 */
  STATUS_POLL: 500, // 500 毫秒
} as const;

/**
 * 性能要求（用于监控和测试）
 */
export const PERFORMANCE_TARGETS = {
  /** 菜单启动时间目标 */
  MENU_STARTUP: 500, // 500ms (SC-003)

  /** 菜单导航响应时间目标 */
  MENU_NAVIGATION: 100, // 100ms (SC-002)

  /** 按键响应时间目标 */
  KEY_RESPONSE: 50, // 50ms (SC-002)

  /** 服务重启中断时间目标 */
  SERVICE_DOWNTIME: 10000, // 10s (FR-016)
} as const;

/**
 * 重试配置
 */
export const RETRY_CONFIG = {
  /** 默认重试次数 */
  DEFAULT_ATTEMPTS: 3,

  /** 重试间隔（毫秒） */
  RETRY_DELAY: 1000, // 1 秒

  /** 指数退避基数 */
  BACKOFF_MULTIPLIER: 2,

  /** 最大重试间隔 */
  MAX_RETRY_DELAY: 10000, // 10 秒
} as const;

/**
 * 计算指数退避延迟
 * @param attempt 当前尝试次数（从 0 开始）
 * @returns 延迟时间（毫秒）
 */
export function getBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.RETRY_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
  return Math.min(delay, RETRY_CONFIG.MAX_RETRY_DELAY);
}

/**
 * 睡眠函数（用于延迟）
 * @param ms 毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带超时的 Promise
 * @param promise 原始 Promise
 * @param timeoutMs 超时时间（毫秒）
 * @param errorMessage 超时错误消息
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = '操作超时'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}
