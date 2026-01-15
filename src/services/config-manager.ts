/**
 * ConfigManager - Xray Configuration File Management
 *
 * Provides safe interface to read, write, validate, and backup Xray config
 *
 * @module services/config-manager
 */

import { readFile, writeFile, mkdir, chmod, access, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { DEFAULT_PATHS } from '../constants/paths';
import type { XrayConfig } from '../types/config';

/**
 * ConfigManager - Safe configuration file operations
 */
export class ConfigManager {
  private configPath: string;
  private backupDir: string;

  /**
   * Create a new ConfigManager
   *
   * @param configPath - Path to config file (default: /usr/local/etc/xray/config.json)
   */
  constructor(configPath?: string) {
    this.configPath = configPath || DEFAULT_PATHS.CONFIG_FILE;
    this.backupDir = DEFAULT_PATHS.BACKUP_DIR || '/var/backups/xray';
  }

  /**
   * Read and parse config file
   *
   * @returns Parsed configuration object
   */
  async readConfig(): Promise<XrayConfig> {
    try {
      const content = await readFile(this.configPath, 'utf-8');
      const config = JSON.parse(content) as XrayConfig;
      return config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`配置文件不存在: ${this.configPath}`);
      } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`配置文件无读取权限: ${this.configPath}。请使用 sudo 或以 root 用户运行。`);
      } else if (error instanceof SyntaxError) {
        throw new Error(`配置文件 JSON 格式错误: ${(error as Error).message}`);
      }
      throw error;
    }
  }

  /**
   * Write config to file with secure permissions
   *
   * @param config - Configuration object to write
   */
  async writeConfig(config: XrayConfig): Promise<void> {
    try {
      // Validate config before writing
      this.validateConfig(config);

      // Ensure directory exists
      const dir = dirname(this.configPath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Write with pretty formatting
      const content = JSON.stringify(config, null, 2);
      await writeFile(this.configPath, content, 'utf-8');

      // Set secure permissions (600 = rw-------)
      await chmod(this.configPath, 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`配置文件无写入权限: ${this.configPath}。请使用 sudo 或以 root 用户运行。`);
      }
      throw error;
    }
  }

  /**
   * Validate configuration structure
   *
   * @param config - Configuration to validate
   * @throws Error if validation fails
   */
  validateConfig(config: XrayConfig): void {
    if (!config || typeof config !== 'object') {
      throw new Error('配置必须是一个对象');
    }

    // Check for required top-level fields
    if (!config.inbounds || !Array.isArray(config.inbounds)) {
      throw new Error('配置必须包含 inbounds 数组');
    }

    if (!config.outbounds || !Array.isArray(config.outbounds)) {
      throw new Error('配置必须包含 outbounds 数组');
    }

    // Validate inbounds
    for (const inbound of config.inbounds) {
      if (!inbound.protocol) {
        throw new Error('每个 inbound 必须指定 protocol');
      }
      if (typeof inbound.port !== 'number') {
        throw new Error('每个 inbound 必须指定有效的 port');
      }
    }

    // Validate outbounds
    for (const outbound of config.outbounds) {
      if (!outbound.protocol) {
        throw new Error('每个 outbound 必须指定 protocol');
      }
    }
  }

  /**
   * Backup configuration file
   *
   * @returns Path to backup file
   */
  async backupConfig(): Promise<string> {
    try {
      // Ensure backup directory exists
      if (!existsSync(this.backupDir)) {
        await mkdir(this.backupDir, { recursive: true, mode: 0o700 });
      }

      // Generate timestamp-based backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(this.backupDir, `config.${timestamp}.json`);

      // Read current config
      const config = await this.readConfig();

      // Write backup
      const content = JSON.stringify(config, null, 2);
      await writeFile(backupPath, content, 'utf-8');
      await chmod(backupPath, 0o600);

      return backupPath;
    } catch (error) {
      throw new Error(`备份配置失败: ${(error as Error).message}`);
    }
  }

  /**
   * List available backups
   *
   * @returns Array of backup file paths
   */
  async listBackups(): Promise<string[]> {
    try {
      if (!existsSync(this.backupDir)) {
        return [];
      }

      const files = await readdir(this.backupDir);
      const backups = files
        .filter((file) => file.startsWith('config.') && file.endsWith('.json'))
        .map((file) => join(this.backupDir, file))
        .sort()
        .reverse(); // Most recent first

      return backups;
    } catch (error) {
      throw new Error(`列出备份失败: ${(error as Error).message}`);
    }
  }

  /**
   * Restore configuration from backup
   *
   * @param backupPath - Path to backup file
   */
  async restoreConfig(backupPath: string): Promise<void> {
    try {
      // Verify backup file exists
      await access(backupPath);

      // Backup current config first (pre-restore backup)
      await this.backupConfig();

      // Read backup content
      const content = await readFile(backupPath, 'utf-8');
      const config = JSON.parse(content) as XrayConfig;

      // Validate and write
      await this.writeConfig(config);
    } catch (error) {
      throw new Error(`恢复配置失败: ${(error as Error).message}`);
    }
  }

  /**
   * Modify a configuration item
   *
   * @param path - Dot-separated path to config item (e.g., "log.loglevel")
   * @param value - New value
   */
  async modifyConfigItem(path: string, value: unknown): Promise<void> {
    const config = await this.readConfig();

    // Split path and navigate to parent object
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = config;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    // Set value
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;

    // Validate and write
    await this.writeConfig(config);
  }

  /**
   * Get formatted configuration for display
   *
   * @returns Pretty-printed JSON string
   */
  async getFormattedConfig(): Promise<string> {
    const config = await this.readConfig();
    return JSON.stringify(config, null, 2);
  }

  /**
   * List available backups with metadata
   *
   * @returns Array of backup info objects
   */
  async listBackupsWithInfo(): Promise<Array<{ path: string; filename: string; createdAt: Date; size: number }>> {
    const backupPaths = await this.listBackups();
    const backupsWithInfo = [];

    for (const backupPath of backupPaths) {
      try {
        const stats = await import('fs/promises').then(fs => fs.stat(backupPath));
        const filename = backupPath.split('/').pop() || '';

        // Extract timestamp from filename: config.2024-01-15T10-30-00-000Z.json
        let createdAt = stats.mtime;
        const timestampMatch = filename.match(/config\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        if (timestampMatch) {
          const isoString = timestampMatch[1].replace(/-/g, (match, offset) => {
            // Replace dashes in time portion with colons
            return offset > 10 ? ':' : '-';
          });
          try {
            createdAt = new Date(isoString);
          } catch {
            // Use file mtime as fallback
          }
        }

        backupsWithInfo.push({
          path: backupPath,
          filename,
          createdAt,
          size: stats.size,
        });
      } catch {
        // Skip files we can't stat
        continue;
      }
    }

    return backupsWithInfo;
  }

  /**
   * Restore configuration from backup with optional service restart
   *
   * @param backupPath - Path to backup file
   * @param restartService - Whether to restart service after restore (default: true)
   */
  async restoreFromBackup(backupPath: string, restartService: boolean = true): Promise<void> {
    // First restore the config
    await this.restoreConfig(backupPath);

    // Optionally restart service
    if (restartService) {
      const { SystemdManager } = await import('./systemd-manager');
      const systemd = new SystemdManager(DEFAULT_PATHS.SERVICE_NAME);
      await systemd.restart();
    }
  }
}
