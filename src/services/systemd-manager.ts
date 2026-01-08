/**
 * SystemdManager - Service Management via systemctl
 *
 * Provides safe interface to systemd service management with:
 * - Command injection prevention
 * - Action and service name validation
 * - Graceful shutdown with configurable timeout
 * - Detailed status parsing
 *
 * @module services/systemd-manager
 */

import { spawn, ChildProcess } from 'child_process';
import { TIMEOUTS } from '../constants/timeouts';

/**
 * Service status information
 */
export interface ServiceStatus {
  /** Service name */
  serviceName: string;

  /** Whether service is active */
  active: boolean;

  /** Active state (active, inactive, failed, etc.) */
  activeState: string;

  /** Sub state (running, dead, failed, etc.) */
  subState: string;

  /** Whether service is loaded */
  loaded: boolean;

  /** Whether service is healthy */
  healthy: boolean;

  /** Main process PID (null if not running) */
  pid: number | null;

  /** Memory usage (formatted string) */
  memory?: string;

  /** Number of restarts */
  restarts?: number;

  /** Uptime (formatted string) */
  uptime?: string;

  /** Start timestamp */
  startTime?: Date;
}

/**
 * Service operation result
 */
export interface ServiceOperationResult {
  /** Whether operation succeeded */
  success: boolean;

  /** Operation type */
  operation: string;

  /** Service name */
  serviceName: string;

  /** Exit code */
  exitCode: number;

  /** Duration in milliseconds */
  duration: number;

  /** Downtime in milliseconds (for restart) */
  downtime?: number;

  /** Standard output */
  stdout?: string;

  /** Standard error */
  stderr?: string;
}

/**
 * Systemctl execution options
 */
export interface SystemctlOptions {
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Restart options
 */
export interface RestartOptions {
  /** Graceful shutdown timeout in milliseconds */
  gracefulTimeout?: number;

  /** Whether to wait for active connections to complete */
  waitForConnections?: boolean;
}

/**
 * SystemdManager - Safe systemctl wrapper
 */
export class SystemdManager {
  private serviceName: string;

  /** Valid systemctl actions (whitelist) */
  private static readonly VALID_ACTIONS = [
    'start',
    'stop',
    'restart',
    'status',
    'enable',
    'disable',
    'is-active',
    'is-enabled',
    'show',
  ];

  /**
   * Create a new SystemdManager
   *
   * @param serviceName - Service name to manage
   * @throws Error if service name is invalid
   */
  constructor(serviceName: string) {
    this.validateServiceName(serviceName);
    this.serviceName = serviceName;
  }

  /**
   * Validate service name
   *
   * @param name - Service name to validate
   * @throws Error if service name is invalid
   */
  private validateServiceName(name: string): void {
    // Prevent empty names
    if (!name || name.trim().length === 0) {
      throw new Error('Service name cannot be empty');
    }

    // Prevent path traversal attempts
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
      throw new Error(`Invalid service name: ${name} (path traversal detected)`);
    }

    // Prevent command injection attempts
    const dangerousChars = /[;&|`$()]/;
    if (dangerousChars.test(name)) {
      throw new Error(`Invalid service name: ${name} (potentially dangerous characters detected)`);
    }

    // Only allow alphanumeric, dash, underscore
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(name)) {
      throw new Error(`Invalid service name: ${name} (only alphanumeric, dash, and underscore allowed)`);
    }
  }

  /**
   * Validate systemctl action
   *
   * @param action - Action to validate
   * @throws Error if action is invalid
   */
  validateAction(action: string): void {
    if (!SystemdManager.VALID_ACTIONS.includes(action)) {
      throw new Error(`Invalid systemctl action: ${action} (must be one of: ${SystemdManager.VALID_ACTIONS.join(', ')})`);
    }

    // Extra paranoia: check for command injection attempts
    const dangerousChars = /[;&|`$()]/;
    if (dangerousChars.test(action)) {
      throw new Error(`Invalid systemctl action: ${action} (potentially dangerous characters detected)`);
    }
  }

  /**
   * Execute systemctl command
   *
   * @param action - Systemctl action to execute
   * @param options - Execution options
   * @returns Command output
   */
  async executeSystemctl(action: string, options?: SystemctlOptions): Promise<string> {
    // Validate action to prevent command injection
    this.validateAction(action);

    const timeout = options?.timeout || TIMEOUTS.SYSTEMCTL_DEFAULT;

    return new Promise((resolve, reject) => {
      // Use spawn (not exec) to prevent shell injection
      const child = spawn('systemctl', [action, this.serviceName], {
        timeout,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          const errorMessage = this.parseSystemdError(stderr || stdout, action);
          reject(new Error(errorMessage));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute systemctl: ${error.message}`));
      });
    });
  }

  /**
   * Parse systemd error messages and provide suggestions
   *
   * @param errorOutput - Error output from systemctl
   * @param action - Action that was attempted
   * @returns User-friendly error message with suggestions
   */
  private parseSystemdError(errorOutput: string, action: string): string {
    const lowerError = errorOutput.toLowerCase();

    // Service not found
    if (lowerError.includes('not found') || lowerError.includes('does not exist') || lowerError.includes('could not be found')) {
      return `服务 '${this.serviceName}' 不存在。请确认服务名称是否正确。`;
    }

    // Permission denied
    if (lowerError.includes('permission denied') || lowerError.includes('access denied') || lowerError.includes('authentication required')) {
      return `权限不足: 无法执行 ${action} 操作。请使用 sudo 或以 root 用户运行。`;
    }

    // Timeout
    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return `操作超时: ${action} 操作未能在规定时间内完成。`;
    }

    // Already running/stopped
    if (action === 'start' && (lowerError.includes('already running') || lowerError.includes('already active'))) {
      return `服务 '${this.serviceName}' 已经在运行中。`;
    }

    if (action === 'stop' && (lowerError.includes('already stopped') || lowerError.includes('inactive'))) {
      return `服务 '${this.serviceName}' 已经停止。`;
    }

    // Generic error with original output
    return `执行 systemctl ${action} 失败: ${errorOutput}`;
  }

  /**
   * Parse systemctl show output
   *
   * @param output - Raw output from systemctl show
   * @returns Parsed service status
   */
  parseSystemdShow(output: string): ServiceStatus {
    const lines = output.split('\n');
    const props: Record<string, string> = {};

    // Parse key=value pairs
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.includes('=')) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('='); // Handle values with '=' in them
      props[key] = value;
    }

    // Validate we have at least basic properties
    if (!props.ActiveState && !props.SubState) {
      throw new Error('Invalid systemctl show output: missing required fields (parse error)');
    }

    // Parse active state
    const activeState = props.ActiveState || 'unknown';
    const subState = props.SubState || 'unknown';
    const active = activeState === 'active';

    // Parse loaded state
    const loaded = props.LoadState === 'loaded';

    // Parse PID
    const pidStr = props.MainPID || '0';
    const pid = parseInt(pidStr, 10);
    const pidValue = pid > 0 ? pid : null;

    // Parse memory usage
    const memoryBytes = parseInt(props.MemoryCurrent || '0', 10);
    const memory = this.formatBytes(memoryBytes);

    // Parse restart count
    const restarts = parseInt(props.NRestarts || '0', 10);

    // Parse start time and calculate uptime
    const startTimestamp = props.ExecMainStartTimestamp;
    let uptime: string | undefined;
    let startTime: Date | undefined;

    if (startTimestamp && startTimestamp.trim() !== '') {
      try {
        startTime = new Date(startTimestamp);
        const now = Date.now();
        const startMs = startTime.getTime();
        const uptimeMs = now - startMs;
        uptime = this.formatUptime(uptimeMs);
      } catch {
        // Ignore parse errors
      }
    }

    // Determine health
    const healthy = active && subState === 'running';

    return {
      serviceName: this.serviceName,
      active,
      activeState,
      subState,
      loaded,
      healthy,
      pid: pidValue,
      memory,
      restarts,
      uptime,
      startTime,
    };
  }

  /**
   * Format bytes to human-readable string
   *
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "45.2 MB")
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return `${value.toFixed(1)} ${units[i]}`;
  }

  /**
   * Format uptime in milliseconds to human-readable string
   *
   * @param ms - Uptime in milliseconds
   * @returns Formatted string (e.g., "2小时15分钟")
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天${hours % 24}小时`;
    } else if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * Get service status
   *
   * @returns Service status information
   */
  async getStatus(): Promise<ServiceStatus> {
    const output = await this.executeSystemctl('show');
    return this.parseSystemdShow(output);
  }

  /**
   * Start service
   *
   * @returns Operation result
   */
  async start(): Promise<ServiceOperationResult> {
    const startTime = Date.now();

    try {
      const stdout = await this.executeSystemctl('start', {
        timeout: TIMEOUTS.SERVICE_START,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        operation: 'start',
        serviceName: this.serviceName,
        exitCode: 0,
        duration,
        stdout,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        operation: 'start',
        serviceName: this.serviceName,
        exitCode: 1,
        duration,
        stderr: (error as Error).message,
      };
    }
  }

  /**
   * Stop service
   *
   * @returns Operation result
   */
  async stop(): Promise<ServiceOperationResult> {
    const startTime = Date.now();

    try {
      const stdout = await this.executeSystemctl('stop', {
        timeout: TIMEOUTS.SERVICE_STOP,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        operation: 'stop',
        serviceName: this.serviceName,
        exitCode: 0,
        duration,
        stdout,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        operation: 'stop',
        serviceName: this.serviceName,
        exitCode: 1,
        duration,
        stderr: (error as Error).message,
      };
    }
  }

  /**
   * Restart service with graceful shutdown
   *
   * @param options - Restart options
   * @returns Operation result
   */
  async restart(options?: RestartOptions): Promise<ServiceOperationResult> {
    const gracefulTimeout = options?.gracefulTimeout || 10000; // Default 10s (FR-016)
    const restartStartTime = Date.now();

    try {
      // Measure service downtime
      const downtimeStart = Date.now();

      // Use systemctl restart which handles graceful shutdown internally
      const stdout = await this.executeSystemctl('restart', {
        timeout: TIMEOUTS.SERVICE_RESTART,
      });

      // Wait a moment for service to fully start
      await this.waitForServiceReady(gracefulTimeout);

      const downtimeEnd = Date.now();
      const downtime = downtimeEnd - downtimeStart;
      const duration = Date.now() - restartStartTime;

      return {
        success: true,
        operation: 'restart',
        serviceName: this.serviceName,
        exitCode: 0,
        duration,
        downtime,
        stdout,
      };
    } catch (error) {
      const duration = Date.now() - restartStartTime;

      return {
        success: false,
        operation: 'restart',
        serviceName: this.serviceName,
        exitCode: 1,
        duration,
        stderr: (error as Error).message,
      };
    }
  }

  /**
   * Wait for service to be ready after start/restart
   *
   * @param maxWait - Maximum time to wait in milliseconds
   */
  private async waitForServiceReady(maxWait: number): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 100; // Check every 100ms

    while (Date.now() - startTime < maxWait) {
      try {
        const status = await this.getStatus();
        if (status.active && status.subState === 'running') {
          return; // Service is ready
        }
      } catch {
        // Ignore errors during polling
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // If we get here, service didn't become ready in time
    // But don't throw - let caller determine if this is critical
  }

  /**
   * Check if running as root
   *
   * @returns True if running as root
   */
  isRoot(): boolean {
    return !!(process.getuid && process.getuid() === 0);
  }

  /**
   * Check if sudo is available
   *
   * @returns True if sudo is available
   */
  async canUseSudo(): Promise<boolean> {
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

  /**
   * Get permission warning message
   *
   * @returns Warning message if not running with sufficient permissions
   */
  getPermissionWarning(): string | undefined {
    if (this.isRoot()) {
      return undefined;
    }

    return '当前用户不是 root - 某些操作可能需要 sudo 权限';
  }

  /**
   * Estimate downtime for restart operation
   *
   * @returns Estimated downtime in milliseconds
   */
  estimateDowntime(): number {
    // Estimate based on typical graceful shutdown time
    // Conservative estimate: 5 seconds
    return 5000;
  }
}
