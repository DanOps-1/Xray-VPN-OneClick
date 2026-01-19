/**
 * Preflight Checks Utility
 *
 * Performs system checks before starting the CLI tool
 *
 * @module utils/preflight
 */

import { spawn } from 'child_process';
import { access, constants as fsConstants } from 'fs/promises';
import { DEFAULT_PATHS } from '../constants/paths';
import { TIMEOUTS } from '../constants/timeouts';

/**
 * Preflight check options
 */
export interface PreflightOptions {
  /** Check if systemd is available */
  checkSystemd?: boolean;

  /** Check if Xray binary exists */
  checkXray?: boolean;

  /** Check if config file exists and is readable */
  checkConfig?: boolean;

  /** Config file path (if checking) */
  configPath?: string;

  /** Service name (if checking) */
  serviceName?: string;
}

/**
 * Preflight check result
 */
export interface PreflightResult {
  /** Overall passed status */
  passed: boolean;

  /** Whether failures are critical (should prevent startup) */
  critical: boolean;

  /** List of errors */
  errors: string[];

  /** List of warnings */
  warnings: string[];

  /** Suggestions for fixing issues */
  suggestions: string[];

  /** Individual check results */
  checks: {
    systemd?: boolean;
    xray?: boolean;
    config?: boolean;
    permissions?: boolean;
  };
}

/**
 * Check if systemd is available
 */
async function checkSystemd(): Promise<{ passed: boolean; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn('systemctl', ['--version'], {
      timeout: TIMEOUTS.SYSTEMCTL_DEFAULT,
    });

    let stdout = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.includes('systemd')) {
        resolve({ passed: true });
      } else {
        resolve({
          passed: false,
          error: 'systemd 不可用 - 此工具需要在 systemd 系统上运行',
        });
      }
    });

    child.on('error', (error) => {
      resolve({
        passed: false,
        error: `systemd 检查失败: ${error.message}`,
      });
    });
  });
}

/**
 * Check if Xray binary exists and is executable
 */
async function checkXray(
  path: string = DEFAULT_PATHS.XRAY_BINARY
): Promise<{ passed: boolean; error?: string; warning?: string }> {
  try {
    // Check if file exists and is executable
    await access(path, fsConstants.F_OK | fsConstants.X_OK);
    return { passed: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        passed: false,
        warning: `Xray 二进制文件不存在: ${path}`,
      };
    } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return {
        passed: false,
        error: `Xray 二进制文件不可执行: ${path}`,
      };
    } else {
      return {
        passed: false,
        warning: `Xray 二进制文件检查失败: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Check if config file exists and is readable
 */
async function checkConfig(
  path: string = DEFAULT_PATHS.CONFIG_FILE
): Promise<{ passed: boolean; error?: string; warning?: string }> {
  try {
    // Check if file exists and is readable
    await access(path, fsConstants.F_OK | fsConstants.R_OK);

    // Verify it's a JSON file
    if (!path.endsWith('.json')) {
      return {
        passed: false,
        warning: `配置文件应为 JSON 格式: ${path}`,
      };
    }

    return { passed: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        passed: false,
        warning: `配置文件不存在: ${path}`,
      };
    } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return {
        passed: false,
        error: `配置文件不可读: ${path}`,
      };
    } else {
      return {
        passed: false,
        warning: `配置文件检查失败: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * Check if current user has necessary permissions
 */
function checkPermissions(): { passed: boolean; warning?: string } {
  const isRoot = process.getuid && process.getuid() === 0;

  if (isRoot) {
    return { passed: true };
  }

  // Check if sudo is available
  return {
    passed: true,
    warning: '当前用户不是 root - 某些操作可能需要 sudo 权限',
  };
}

/**
 * Perform all preflight checks
 */
export async function preflightChecks(options: PreflightOptions = {}): Promise<PreflightResult> {
  const result: PreflightResult = {
    passed: true,
    critical: false,
    errors: [],
    warnings: [],
    suggestions: [],
    checks: {},
  };

  // Check systemd
  if (options.checkSystemd !== false) {
    const systemdResult = await checkSystemd();
    result.checks.systemd = systemdResult.passed;

    if (!systemdResult.passed) {
      result.passed = false;
      result.critical = true;
      if (systemdResult.error) {
        result.errors.push(systemdResult.error);
        result.suggestions.push(
          '确保在支持 systemd 的 Linux 发行版上运行 (Debian 10+, Ubuntu 20.04+, CentOS 8+)'
        );
      }
    }
  }

  // Check Xray binary
  if (options.checkXray) {
    const xrayResult = await checkXray();
    result.checks.xray = xrayResult.passed;

    if (!xrayResult.passed) {
      result.passed = false;

      if (xrayResult.error) {
        result.errors.push(xrayResult.error);
        result.suggestions.push(
          `修复 Xray 二进制文件权限: sudo chmod +x ${DEFAULT_PATHS.XRAY_BINARY}`
        );
      } else if (xrayResult.warning) {
        result.warnings.push(xrayResult.warning);
        result.suggestions.push(`安装 Xray: https://github.com/XTLS/Xray-install`);
      }
    }
  }

  // Check config file
  if (options.checkConfig) {
    const configPath = options.configPath || DEFAULT_PATHS.CONFIG_FILE;
    const configResult = await checkConfig(configPath);
    result.checks.config = configResult.passed;

    if (!configResult.passed) {
      result.passed = false;

      if (configResult.error) {
        result.errors.push(configResult.error);
        result.suggestions.push(`修复配置文件权限: sudo chmod 600 ${configPath}`);
      } else if (configResult.warning) {
        result.warnings.push(configResult.warning);
        result.suggestions.push(`创建配置文件: sudo touch ${configPath}`);
      }
    }
  }

  // Check permissions
  const permResult = checkPermissions();
  result.checks.permissions = permResult.passed;

  if (permResult.warning) {
    result.warnings.push(permResult.warning);
  }

  return result;
}

/**
 * Check if running as root
 */
export function isRoot(): boolean {
  return !!(process.getuid && process.getuid() === 0);
}

/**
 * Check if sudo is available
 */
export async function canUseSudo(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('which', ['sudo']);

    child.on('close', (code) => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}
