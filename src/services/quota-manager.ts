/**
 * QuotaManager - 配额配置管理服务
 *
 * 管理用户流量配额的配置和持久化
 *
 * @module services/quota-manager
 */

import { readFile, writeFile, mkdir, chmod } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import type { TrafficQuota, QuotaConfig, SetQuotaParams, AlertLevel } from '../types/quota';
import { DEFAULT_QUOTA, DEFAULT_QUOTA_CONFIG } from '../types/quota';
import { QUOTA_CONFIG_PATH, WARNING_THRESHOLD, EXCEEDED_THRESHOLD } from '../constants/quota';
import { QuotaError, ValidationError, NetworkError } from '../utils/errors';
import { QuotaErrors, ValidationErrors, NetworkErrors } from '../constants/error-codes';

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  return email.length > 0 && email.includes('@') && email.length <= 254;
}

/**
 * 验证配额值
 * @param bytes - 配额字节数
 * @returns true 如果有效（-1 表示无限制，或者 >= 0）
 */
function isValidQuotaBytes(bytes: number): boolean {
  return bytes === -1 || (Number.isFinite(bytes) && bytes >= 0);
}

/**
 * 验证端口号
 */
function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * QuotaManager - 管理用户流量配额
 */
export class QuotaManager {
  private configPath: string;

  /**
   * 创建 QuotaManager 实例
   *
   * @param configPath - 配额配置文件路径（默认 /usr/local/etc/xray/quota.json）
   */
  constructor(configPath: string = QUOTA_CONFIG_PATH) {
    this.configPath = configPath;
  }

  /**
   * 读取配额配置文件
   *
   * @returns 配额配置
   */
  async readConfig(): Promise<QuotaConfig> {
    try {
      if (!existsSync(this.configPath)) {
        return { ...DEFAULT_QUOTA_CONFIG };
      }

      const content = await readFile(this.configPath, 'utf-8');
      const config = JSON.parse(content) as QuotaConfig;

      // 确保配置结构完整
      return {
        ...DEFAULT_QUOTA_CONFIG,
        ...config,
        users: config.users || {},
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new QuotaError(QuotaErrors.QUOTA_CONFIG_NOT_FOUND, this.configPath);
      } else if (error instanceof SyntaxError) {
        throw new QuotaError(QuotaErrors.QUOTA_CONFIG_NOT_FOUND, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 写入配额配置文件
   *
   * @param config - 配额配置
   */
  async writeConfig(config: QuotaConfig): Promise<void> {
    try {
      // 确保目录存在
      const dir = dirname(this.configPath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // 写入配置
      const content = JSON.stringify(config, null, 2);
      await writeFile(this.configPath, content, 'utf-8');

      // 设置安全权限
      await chmod(this.configPath, 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new QuotaError(QuotaErrors.TRAFFIC_UPDATE_FAILED, this.configPath);
      }
      throw error;
    }
  }

  /**
   * 获取用户配额
   *
   * @param email - 用户邮箱
   * @returns 配额配置，不存在时返回默认值
   */
  async getQuota(email: string): Promise<TrafficQuota> {
    const config = await this.readConfig();
    return config.users[email] || { ...DEFAULT_QUOTA };
  }

  /**
   * 设置用户配额
   *
   * @param params - 配额设置参数
   * @throws Error 如果参数无效
   */
  async setQuota(params: SetQuotaParams): Promise<void> {
    // 验证邮箱
    if (!isValidEmail(params.email)) {
      throw new ValidationError(ValidationErrors.INVALID_FORMAT, params.email);
    }

    // 验证配额值
    if (!isValidQuotaBytes(params.quotaBytes)) {
      throw new QuotaError(QuotaErrors.INVALID_QUOTA_VALUE, String(params.quotaBytes));
    }

    const config = await this.readConfig();

    const existingQuota = config.users[params.email];
    const now = new Date().toISOString();

    config.users[params.email] = {
      quotaBytes: params.quotaBytes,
      quotaType: params.quotaType,
      usedBytes: existingQuota?.usedBytes || 0,
      lastReset: existingQuota?.lastReset || now,
      status: existingQuota?.status || 'active',
    };

    await this.writeConfig(config);
  }

  /**
   * 重置用户已用流量
   *
   * @param email - 用户邮箱
   */
  async resetUsage(email: string): Promise<void> {
    const config = await this.readConfig();

    if (!config.users[email]) {
      throw new QuotaError(QuotaErrors.USER_QUOTA_NOT_FOUND, email);
    }

    config.users[email].usedBytes = 0;
    config.users[email].lastReset = new Date().toISOString();
    config.users[email].status = 'active';

    await this.writeConfig(config);
  }

  /**
   * 更新用户已用流量
   *
   * @param email - 用户邮箱
   * @param usedBytes - 已用字节数
   * @throws Error 如果参数无效
   */
  async updateUsage(email: string, usedBytes: number): Promise<void> {
    // 验证已用字节数
    if (!Number.isFinite(usedBytes) || usedBytes < 0) {
      throw new ValidationError(ValidationErrors.VALUE_OUT_OF_RANGE, String(usedBytes));
    }

    const config = await this.readConfig();

    if (!config.users[email]) {
      // 如果用户没有配额记录，创建默认记录
      config.users[email] = { ...DEFAULT_QUOTA };
    }

    config.users[email].usedBytes = usedBytes;

    await this.writeConfig(config);
  }

  /**
   * 获取所有用户配额
   *
   * @returns 用户配额映射
   */
  async getAllQuotas(): Promise<Record<string, TrafficQuota>> {
    const config = await this.readConfig();
    return config.users;
  }

  /**
   * 删除用户配额记录
   *
   * @param email - 用户邮箱
   */
  async deleteQuota(email: string): Promise<void> {
    const config = await this.readConfig();

    if (!config.users[email]) {
      return; // 不存在则静默返回
    }

    delete config.users[email];
    await this.writeConfig(config);
  }

  /**
   * 设置用户状态
   *
   * @param email - 用户邮箱
   * @param status - 新状态
   */
  async setStatus(email: string, status: TrafficQuota['status']): Promise<void> {
    const config = await this.readConfig();

    if (!config.users[email]) {
      throw new QuotaError(QuotaErrors.USER_QUOTA_NOT_FOUND, email);
    }

    config.users[email].status = status;
    await this.writeConfig(config);
  }

  /**
   * 计算警告级别
   *
   * @param usedBytes - 已用字节数
   * @param quotaBytes - 配额字节数（-1 表示无限制）
   * @returns 警告级别
   */
  calculateAlertLevel(usedBytes: number, quotaBytes: number): AlertLevel {
    if (quotaBytes < 0) {
      return 'normal'; // 无限制
    }

    const percent = (usedBytes / quotaBytes) * 100;

    if (percent >= EXCEEDED_THRESHOLD) {
      return 'exceeded';
    }
    if (percent >= WARNING_THRESHOLD) {
      return 'warning';
    }
    return 'normal';
  }

  /**
   * 获取 API 端口
   *
   * @returns API 端口号
   */
  async getApiPort(): Promise<number> {
    const config = await this.readConfig();
    return config.apiPort;
  }

  /**
   * 设置 API 端口
   *
   * @param port - API 端口号
   * @throws Error 如果端口号无效
   */
  async setApiPort(port: number): Promise<void> {
    if (!isValidPort(port)) {
      throw new NetworkError(NetworkErrors.INVALID_PORT, String(port));
    }

    const config = await this.readConfig();
    config.apiPort = port;
    await this.writeConfig(config);
  }
}
