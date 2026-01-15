/**
 * LogManager - System Log Management via journalctl
 *
 * Provides safe interface to query and follow systemd journal logs
 *
 * @module services/log-manager
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { readFile, stat } from 'fs/promises';
import { which } from '../utils/which';
import { DEFAULT_PATHS } from '../constants/paths';

const DEFAULT_LOG_LINES = 200;
const DEFAULT_FILE_LOG_LINES = 50;

/**
 * Log entry structure
 */
export interface LogEntry {
  /** Log timestamp */
  timestamp: Date;

  /** Log message */
  message: string;

  /** Log level */
  level: string;

  /** Process ID */
  pid?: string;

  /** Hostname */
  hostname?: string;

  /** Systemd unit */
  unit?: string;

  /** Raw log data */
  raw?: string;
}

/**
 * Log query options
 */
export interface LogQueryOptions {
  /** Filter by log level (error, warning, info, debug) */
  level?: string;

  /** Time range start (e.g., "1 hour ago", "today", "2024-01-01") */
  since?: string;

  /** Time range end */
  until?: string;

  /** Number of lines to retrieve */
  lines?: number;

  /** Follow mode (real-time) */
  follow?: boolean;
}

/**
 * Log follow process
 */
export interface LogFollowProcess {
  /** Kill the follow process */
  kill: () => void;

  /** Child process */
  process: ChildProcess;
}

/**
 * LogManager - Query and follow systemd journal logs
 */
export class LogManager {
  private serviceName: string;

  /**
   * Create a new LogManager
   *
   * @param serviceName - Service name to query logs for
   */
  constructor(serviceName: string) {
    this.validateServiceName(serviceName);
    this.serviceName = serviceName;
  }

  /**
   * Validate service name to prevent command injection
   *
   * @param name - Service name to validate
   * @throws Error if invalid
   */
  private validateServiceName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Service name cannot be empty');
    }

    // Prevent path traversal
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
      throw new Error(`Invalid service name: ${name} (path traversal detected)`);
    }

    // Prevent command injection
    const dangerousChars = /[;&|`$()]/;
    if (dangerousChars.test(name)) {
      throw new Error(`Invalid service name: ${name} (potentially dangerous characters detected)`);
    }

    // Only allow alphanumeric, dash, underscore, and dot
    const validPattern = /^[a-zA-Z0-9_.-]+$/;
    if (!validPattern.test(name)) {
      throw new Error(`Invalid service name: ${name}`);
    }
  }

  /**
   * Check if journalctl is available
   *
   * @returns True if journalctl is available
   */
  isJournalctlAvailable(): boolean {
    try {
      const journalctlPath = which('journalctl');
      return journalctlPath !== null && existsSync(journalctlPath);
    } catch {
      return false;
    }
  }

  /**
   * Map log level to journalctl priority
   *
   * @param level - Log level (error, warning, info, debug)
   * @returns journalctl priority string
   */
  private mapLevelToPriority(level: string): string {
    const mapping: Record<string, string> = {
      emergency: 'emerg',
      alert: 'alert',
      critical: 'crit',
      error: 'err',
      warning: 'warning',
      notice: 'notice',
      info: 'info',
      debug: 'debug',
    };

    return mapping[level.toLowerCase()] || level;
  }

  /**
   * Map journalctl priority to readable level
   *
   * @param priority - Journalctl priority (0-7)
   * @returns Readable log level
   */
  private mapPriorityToLevel(priority: string): string {
    const mapping: Record<string, string> = {
      '0': 'emergency',
      '1': 'alert',
      '2': 'critical',
      '3': 'error',
      '4': 'warning',
      '5': 'notice',
      '6': 'info',
      '7': 'debug',
    };

    return mapping[priority] || 'unknown';
  }

  /**
   * Parse a JSON log entry from journalctl
   *
   * @param jsonLine - JSON string from journalctl -o json
   * @returns Parsed log entry
   */
  parseLogEntry(jsonLine: string): LogEntry {
    try {
      const data = JSON.parse(jsonLine);

      // Extract timestamp (microseconds since epoch)
      const timestampMicros = parseInt(data.__REALTIME_TIMESTAMP || '0', 10);
      const timestamp = new Date(timestampMicros / 1000);

      // Extract message
      const message = data.MESSAGE || '';

      // Extract and map priority
      const priority = data.PRIORITY || '6';
      const level = this.mapPriorityToLevel(priority);

      // Extract metadata
      const pid = data._PID;
      const hostname = data._HOSTNAME;
      const unit = data._SYSTEMD_UNIT;

      return {
        timestamp,
        message,
        level,
        pid,
        hostname,
        unit,
        raw: jsonLine,
      };
    } catch (error) {
      throw new Error(`Failed to parse log entry: ${(error as Error).message}`);
    }
  }

  /**
   * Query logs with filters
   *
   * @param options - Query options
   * @returns Array of log entries
   */
  async queryLogs(options: LogQueryOptions = {}): Promise<LogEntry[]> {
    if (!this.isJournalctlAvailable()) {
      throw new Error(
        'journalctl is not available on this system. Please ensure systemd is installed.'
      );
    }

    const lineLimit = options.lines ?? DEFAULT_LOG_LINES;

    // Build journalctl arguments
    const args: string[] = [
      '-u',
      this.serviceName, // Unit filter
      '-o',
      'json', // JSON output
      '--no-pager', // Disable pager
    ];

    // Add level filter
    if (options.level) {
      const priority = this.mapLevelToPriority(options.level);
      args.push('-p', priority);
    }

    // Add time range filters
    if (options.since) {
      args.push('--since', options.since);
    }

    if (options.until) {
      args.push('--until', options.until);
    }

    // Add line limit
    if (Number.isFinite(lineLimit) && lineLimit > 0) {
      args.push('-n', String(lineLimit));
    }

    return new Promise((resolve, reject) => {
      const child = spawn('journalctl', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code: number) => {
        if (code !== 0) {
          const errorMsg = stderr.trim() || `journalctl exited with code ${code}`;

          // Provide helpful error messages
          if (errorMsg.includes('permission') || errorMsg.includes('access')) {
            reject(
              new Error(`无权访问日志。请使用 sudo 或以 root 用户运行。\n详细错误: ${errorMsg}`)
            );
          } else {
            reject(new Error(`查询日志失败: ${errorMsg}`));
          }
          return;
        }

        // Parse log entries
        const logs: LogEntry[] = [];
        const lines = stdout.trim().split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const entry = this.parseLogEntry(line);
            logs.push(entry);
          } catch (error) {
            // Skip malformed entries
            console.warn(`Skipped malformed log entry: ${(error as Error).message}`);
          }
        }

        resolve(logs);
      });

      child.on('error', (error: Error) => {
        reject(new Error(`Failed to execute journalctl: ${error.message}`));
      });
    });
  }

  /**
   * Follow logs in real-time
   *
   * @param options - Query options
   * @param onLog - Callback for each log entry
   * @returns Follow process controller
   */
  async followLogs(
    options: LogQueryOptions = {},
    onLog?: (_entry: LogEntry) => void
  ): Promise<LogFollowProcess> {
    if (!this.isJournalctlAvailable()) {
      throw new Error(
        'journalctl is not available on this system. Please ensure systemd is installed.'
      );
    }

    // Build journalctl arguments
    const args: string[] = [
      '-u',
      this.serviceName,
      '-o',
      'json',
      '--no-pager',
      '-f', // Follow mode
    ];

    // Add level filter
    if (options.level) {
      const priority = this.mapLevelToPriority(options.level);
      args.push('-p', priority);
    }

    // Add line limit for initial output
    if (options.lines) {
      args.push('-n', String(options.lines));
    }

    const child = spawn('journalctl', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Handle stdout
    if (onLog) {
      let buffer = '';

      child.stdout.on('data', (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const entry = this.parseLogEntry(line);
            onLog(entry);
          } catch (error) {
            console.warn(`Skipped malformed log entry: ${(error as Error).message}`);
          }
        }

        // Keep incomplete line in buffer
        buffer = lines[lines.length - 1];
      });
    }

    // Handle stderr
    child.stderr.on('data', (data: Buffer) => {
      const errorMsg = data.toString();
      console.error(`journalctl error: ${errorMsg}`);
    });

    return {
      process: child,
      kill: () => {
        child.kill('SIGINT');
      },
    };
  }

  /**
   * Read last N lines from access log file
   *
   * @param lines - Number of lines to read (default: 50)
   * @returns Array of log entry objects
   */
  async readAccessLog(lines: number = DEFAULT_FILE_LOG_LINES): Promise<LogEntry[]> {
    return this.readLogFile(DEFAULT_PATHS.ACCESS_LOG, lines);
  }

  /**
   * Read last N lines from error log file
   *
   * @param lines - Number of lines to read (default: 50)
   * @returns Array of log entry objects
   */
  async readErrorLog(lines: number = DEFAULT_FILE_LOG_LINES): Promise<LogEntry[]> {
    return this.readLogFile(DEFAULT_PATHS.ERROR_LOG, lines);
  }

  /**
   * Check if a log file exists
   *
   * @param type - Log type ('access' or 'error')
   * @returns true if file exists
   */
  async logExists(type: 'access' | 'error'): Promise<boolean> {
    const logPath = type === 'access' ? DEFAULT_PATHS.ACCESS_LOG : DEFAULT_PATHS.ERROR_LOG;
    return existsSync(logPath);
  }

  /**
   * Get log file size
   *
   * @param type - Log type ('access' or 'error')
   * @returns File size in bytes, or 0 if file doesn't exist
   */
  async getLogSize(type: 'access' | 'error'): Promise<number> {
    const logPath = type === 'access' ? DEFAULT_PATHS.ACCESS_LOG : DEFAULT_PATHS.ERROR_LOG;
    try {
      const stats = await stat(logPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Read last N lines from a log file
   *
   * @param logPath - Path to log file
   * @param lines - Number of lines to read
   * @returns Array of log entry objects
   */
  private async readLogFile(logPath: string, lines: number): Promise<LogEntry[]> {
    if (!existsSync(logPath)) {
      return [];
    }

    try {
      const content = await readFile(logPath, 'utf-8');
      const allLines = content.split('\n').filter(line => line.trim());

      // Get last N lines
      const lastLines = allLines.slice(-lines);

      return lastLines.map((line, index) => this.parseFileLogEntry(line, allLines.length - lines + index + 1));
    } catch (error) {
      throw new Error(`读取日志文件失败: ${(error as Error).message}`);
    }
  }

  /**
   * Parse a log line from file into LogEntry
   *
   * @param line - Raw log line
   * @param lineNumber - Line number in file
   * @returns LogEntry object
   */
  private parseFileLogEntry(line: string, _lineNumber: number): LogEntry {
    // Try to parse timestamp from common log formats
    // Format 1: 2024/01/15 10:30:00 [Info] message
    // Format 2: 2024-01-15T10:30:00.000Z message
    let timestamp = new Date();
    let level = 'info';
    let message = line;

    // Try to extract timestamp
    const timestampMatch = line.match(/^(\d{4}[/-]\d{2}[/-]\d{2}[T\s]\d{2}:\d{2}:\d{2})/);
    if (timestampMatch) {
      try {
        timestamp = new Date(timestampMatch[1].replace(' ', 'T'));
        message = line.substring(timestampMatch[0].length).trim();
      } catch {
        // Keep default timestamp
      }
    }

    // Try to extract log level
    const levelMatch = message.match(/^\[?(Info|Warning|Error|Debug)\]?:?\s*/i);
    if (levelMatch) {
      level = levelMatch[1].toLowerCase();
      message = message.substring(levelMatch[0].length);
    }

    return {
      timestamp,
      message,
      level,
      raw: line,
    };
  }
}
