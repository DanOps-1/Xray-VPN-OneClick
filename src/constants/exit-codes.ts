/**
 * 标准化退出代码
 * @module constants/exit-codes
 */

/**
 * CLI 工具退出代码常量
 * 遵循 Unix/Linux 退出代码规范
 */
export const ExitCode = {
  /** 成功 */
  SUCCESS: 0,

  /** 通用错误 */
  GENERAL_ERROR: 1,

  /** 参数错误 - 无效的命令行参数或选项 */
  INVALID_ARGUMENT: 2,

  /** 配置错误 - 配置文件错误、缺失或无法解析 */
  CONFIG_ERROR: 3,

  /** 权限错误 - 需要 root/sudo 权限但未提供 */
  PERMISSION_ERROR: 4,

  /** 服务错误 - systemd 服务操作失败 */
  SERVICE_ERROR: 5,

  /** 网络错误 - 网络连接失败或超时 */
  NETWORK_ERROR: 6,

  /** 文件错误 - 文件读写操作失败 */
  FILE_ERROR: 7,

  /** 验证错误 - 输入验证失败（邮箱、UUID 等） */
  VALIDATION_ERROR: 8,

  /** 未找到 - 资源不存在（用户、服务等） */
  NOT_FOUND: 9,

  /** 用户中断 - Ctrl+C 中断程序执行 */
  SIGINT: 130,
} as const;

/**
 * 退出代码类型
 */
export type ExitCodeType = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * 退出代码到描述的映射
 */
export const ExitCodeDescription: Record<number, string> = {
  [ExitCode.SUCCESS]: '成功',
  [ExitCode.GENERAL_ERROR]: '通用错误',
  [ExitCode.INVALID_ARGUMENT]: '参数错误',
  [ExitCode.CONFIG_ERROR]: '配置错误',
  [ExitCode.PERMISSION_ERROR]: '权限不足',
  [ExitCode.SERVICE_ERROR]: '服务操作失败',
  [ExitCode.NETWORK_ERROR]: '网络错误',
  [ExitCode.FILE_ERROR]: '文件错误',
  [ExitCode.VALIDATION_ERROR]: '输入验证失败',
  [ExitCode.NOT_FOUND]: '资源未找到',
  [ExitCode.SIGINT]: '用户中断',
};

/**
 * 根据错误类型获取退出代码
 */
export function getExitCodeForError(error: Error): ExitCodeType {
  const errorName = error.name.toLowerCase();
  const errorMessage = error.message.toLowerCase();

  // 根据错误名称或消息判断退出代码
  if (errorName.includes('permission') || errorMessage.includes('eacces')) {
    return ExitCode.PERMISSION_ERROR;
  }
  if (errorName.includes('validation') || errorMessage.includes('invalid')) {
    return ExitCode.VALIDATION_ERROR;
  }
  if (errorName.includes('notfound') || errorMessage.includes('not found')) {
    return ExitCode.NOT_FOUND;
  }
  if (errorName.includes('config') || errorMessage.includes('config')) {
    return ExitCode.CONFIG_ERROR;
  }
  if (errorName.includes('service') || errorMessage.includes('systemctl')) {
    return ExitCode.SERVICE_ERROR;
  }
  if (errorName.includes('file') || errorMessage.includes('enoent')) {
    return ExitCode.FILE_ERROR;
  }
  if (errorName.includes('network') || errorMessage.includes('timeout')) {
    return ExitCode.NETWORK_ERROR;
  }

  return ExitCode.GENERAL_ERROR;
}

/**
 * 优雅退出（清理资源后退出）
 */
export async function gracefulExit(
  code: ExitCodeType,
  cleanup?: () => Promise<void>
): Promise<never> {
  try {
    if (cleanup) {
      await cleanup();
    }
  } catch (error) {
    console.error('清理资源时出错:', error);
  } finally {
    process.exit(code);
  }
}
