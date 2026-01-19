/**
 * TrafficManager - 流量统计服务
 *
 * 通过 Xray Stats API 获取用户流量使用情况
 *
 * @module services/traffic-manager
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import type { TrafficUsage, XrayStatsResponse } from '../types/quota';
import { QuotaManager } from './quota-manager';
import {
  DEFAULT_API_PORT,
  DEFAULT_API_SERVER,
  STATS_PATTERNS,
  XRAY_STATS_COMMAND,
} from '../constants/quota';

const execAsync = promisify(exec);

/**
 * Stats API 检测结果
 */
export interface StatsDetectionResult {
  /** API 是否可用 */
  available: boolean;

  /** 是否检测到 stats 配置 */
  configDetected: boolean;

  /** 检测到的 API 端口 */
  detectedPort?: number;

  /** 服务是否运行 */
  serviceRunning: boolean;

  /** 提示消息 */
  message: string;

  /** 建议操作 */
  suggestion?: string;
}

/**
 * 默认 Xray 配置路径
 */
const DEFAULT_XRAY_CONFIG_PATH = '/usr/local/etc/xray/config.json';

/**
 * TrafficManager - 管理 Xray 流量统计
 */
export class TrafficManager {
  private apiServer: string;
  private apiPort: number;

  /**
   * 创建 TrafficManager 实例
   *
   * @param apiServer - API 服务器地址（默认 127.0.0.1）
   * @param apiPort - API 端口（默认 10085）
   */
  constructor(apiServer: string = DEFAULT_API_SERVER, apiPort: number = DEFAULT_API_PORT) {
    this.apiServer = apiServer;
    this.apiPort = apiPort;
  }

  /**
   * 从 Xray 配置中读取 API 端口
   */
  private async detectApiPortFromConfig(
    configPath: string = DEFAULT_XRAY_CONFIG_PATH
  ): Promise<number | null> {
    try {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      const apiTag = config.api?.tag || 'api';
      const apiInbound = config.inbounds?.find(
        (inbound: { tag?: string }) => inbound.tag === apiTag
      );
      const port = Number(apiInbound?.port);
      if (Number.isInteger(port) && port >= 1 && port <= 65535) {
        return port;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 从配额配置中同步 API 端口
   */
  private async syncApiPort(): Promise<void> {
    let quotaPort: number | null = null;
    try {
      const quotaManager = new QuotaManager();
      quotaPort = await quotaManager.getApiPort();
    } catch {
      quotaPort = null;
    }

    const configPort = await this.detectApiPortFromConfig();
    const resolvedPort = configPort ?? quotaPort;

    if (
      typeof resolvedPort === 'number' &&
      Number.isInteger(resolvedPort) &&
      resolvedPort >= 1 &&
      resolvedPort <= 65535
    ) {
      this.apiPort = resolvedPort;
    }
  }

  /**
   * 获取 API 服务器地址
   */
  getServerAddress(): string {
    return `${this.apiServer}:${this.apiPort}`;
  }

  /**
   * 检查 Xray Stats API 是否可用
   *
   * @returns 是否可用
   */
  async isStatsAvailable(): Promise<boolean> {
    try {
      await this.syncApiPort();
      const { stdout } = await execAsync(
        `${XRAY_STATS_COMMAND} api statsquery --server=${this.getServerAddress()} 2>/dev/null`
      );
      // 如果命令成功执行并返回 JSON，则 API 可用
      JSON.parse(stdout || '{}');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 判断流量统计是否可用（含 policy 检查）
   */
  async isUsageAvailable(): Promise<boolean> {
    const [available, policyEnabled] = await Promise.all([
      this.isStatsAvailable(),
      this.hasUserStatsPolicy(),
    ]);

    return available && policyEnabled;
  }

  /**
   * 执行 Xray stats 命令
   *
   * @param name - 统计名称
   * @returns 统计值（字节数）
   */
  private async queryStats(name: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `${XRAY_STATS_COMMAND} api stats --server=${this.getServerAddress()} -name "${name}" 2>/dev/null`
      );
      const result = JSON.parse(stdout || '{}');
      return Number(result.stat?.value) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 检查用户流量统计策略是否启用
   */
  private async hasUserStatsPolicy(
    configPath: string = DEFAULT_XRAY_CONFIG_PATH
  ): Promise<boolean> {
    try {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      const levels = config.policy?.levels;
      if (!levels) {
        return false;
      }
      const levelValues = Object.values(
        levels as Record<string, { statsUserUplink?: boolean; statsUserDownlink?: boolean }>
      );
      return levelValues.some(
        (level) => level?.statsUserUplink === true && level?.statsUserDownlink === true
      );
    } catch {
      return false;
    }
  }

  /**
   * 获取用户流量使用情况
   *
   * @param email - 用户邮箱
   * @returns 流量使用数据，服务未运行时返回 null
   */
  async getUsage(email: string): Promise<TrafficUsage | null> {
    const available = await this.isStatsAvailable();
    if (!available) {
      return null;
    }

    const policyEnabled = await this.hasUserStatsPolicy();
    if (!policyEnabled) {
      return null;
    }

    const uplinkName = STATS_PATTERNS.USER_UPLINK(email);
    const downlinkName = STATS_PATTERNS.USER_DOWNLINK(email);

    const [uplink, downlink] = await Promise.all([
      this.queryStats(uplinkName),
      this.queryStats(downlinkName),
    ]);

    return {
      email,
      uplink,
      downlink,
      total: uplink + downlink,
      queriedAt: new Date().toISOString(),
    };
  }

  /**
   * 获取所有用户流量使用情况
   *
   * @returns 所有用户的流量数据
   */
  async getAllUsage(): Promise<TrafficUsage[]> {
    const available = await this.isStatsAvailable();
    if (!available) {
      return [];
    }

    const policyEnabled = await this.hasUserStatsPolicy();
    if (!policyEnabled) {
      return [];
    }

    try {
      const { stdout } = await execAsync(
        `${XRAY_STATS_COMMAND} api statsquery --server=${this.getServerAddress()} 2>/dev/null`
      );
      const response: XrayStatsResponse = JSON.parse(stdout || '{"stat":[]}');

      // 解析所有用户流量
      const userStats = new Map<string, { uplink: number; downlink: number }>();

      for (const stat of response.stat || []) {
        const match = stat.name.match(/^user>>>(.+?)>>>traffic>>>(uplink|downlink)$/);
        if (match) {
          const email = match[1];
          const direction = match[2] as 'uplink' | 'downlink';

          if (!userStats.has(email)) {
            userStats.set(email, { uplink: 0, downlink: 0 });
          }

          const stats = userStats.get(email)!;
          stats[direction] = Number(stat.value) || 0;
        }
      }

      // 转换为 TrafficUsage 数组
      const now = new Date().toISOString();
      const usages: TrafficUsage[] = [];

      for (const [email, stats] of userStats) {
        usages.push({
          email,
          uplink: stats.uplink,
          downlink: stats.downlink,
          total: stats.uplink + stats.downlink,
          queriedAt: now,
        });
      }

      return usages;
    } catch {
      return [];
    }
  }

  /**
   * 重置用户流量统计（查询并重置）
   *
   * @param email - 用户邮箱
   * @returns 重置前的流量数据
   */
  async resetUserStats(email: string): Promise<TrafficUsage | null> {
    const available = await this.isStatsAvailable();
    if (!available) {
      return null;
    }

    const uplinkName = STATS_PATTERNS.USER_UPLINK(email);
    const downlinkName = STATS_PATTERNS.USER_DOWNLINK(email);

    // 使用 -reset 参数查询并重置
    const queryAndReset = async (name: string): Promise<number> => {
      try {
        const { stdout } = await execAsync(
          `${XRAY_STATS_COMMAND} api stats --server=${this.getServerAddress()} -name "${name}" -reset 2>/dev/null`
        );
        const result = JSON.parse(stdout || '{}');
        return Number(result.stat?.value) || 0;
      } catch {
        return 0;
      }
    };

    const [uplink, downlink] = await Promise.all([
      queryAndReset(uplinkName),
      queryAndReset(downlinkName),
    ]);

    return {
      email,
      uplink,
      downlink,
      total: uplink + downlink,
      queriedAt: new Date().toISOString(),
    };
  }

  /**
   * 检测 Xray Stats API 配置状态
   *
   * @param configPath - Xray 配置文件路径
   * @returns 检测结果
   */
  async detectStatsConfig(
    configPath: string = DEFAULT_XRAY_CONFIG_PATH
  ): Promise<StatsDetectionResult> {
    const result: StatsDetectionResult = {
      available: false,
      configDetected: false,
      serviceRunning: false,
      message: '',
    };

    // 1. 检查服务是否运行
    try {
      await execAsync('systemctl is-active xray');
      result.serviceRunning = true;
    } catch {
      result.serviceRunning = false;
      result.message = 'Xray 服务未运行';
      result.suggestion = '请先启动 Xray 服务: systemctl start xray';
      return result;
    }

    // 2. 检查配置文件是否存在
    if (!existsSync(configPath)) {
      result.message = `未找到 Xray 配置文件: ${configPath}`;
      result.suggestion = '请确认 Xray 已正确安装';
      return result;
    }

    // 3. 解析配置文件查找 stats 和 api 配置
    try {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      // 检查 stats 配置
      if (!config.stats) {
        result.message = 'Xray 配置中未启用 stats 统计功能';
        result.suggestion = '请在配置文件中添加 "stats": {} 来启用流量统计';
        return result;
      }

      // 检查 policy 配置
      const levels = config.policy?.levels;
      const hasUserStatsPolicy = levels
        ? Object.values(
            levels as Record<string, { statsUserUplink?: boolean; statsUserDownlink?: boolean }>
          ).some((level) => level?.statsUserUplink === true && level?.statsUserDownlink === true)
        : false;
      if (!hasUserStatsPolicy) {
        result.message = 'Xray 配置中未启用 policy 流量统计';
        result.suggestion = '请在 policy.levels 中启用 statsUserUplink/statsUserDownlink';
        return result;
      }

      result.configDetected = true;

      // 检查 api 配置
      if (!config.api) {
        result.message = 'Xray 配置中未启用 API 接口';
        result.suggestion = '请在配置文件中添加 api 配置来启用 Stats API';
        return result;
      }

      // 查找 api inbound 端口
      const apiTag = config.api.tag || 'api';
      const apiInbound = config.inbounds?.find(
        (inbound: { tag?: string }) => inbound.tag === apiTag
      );

      if (apiInbound?.port) {
        result.detectedPort = apiInbound.port;
      }

      // 4. 测试 API 连接
      result.available = await this.isStatsAvailable();

      if (result.available) {
        result.message = 'Stats API 已就绪';
      } else {
        result.message = 'Stats API 配置已检测到，但无法连接';
        result.suggestion = `请检查 API 端口 ${this.apiPort} 是否正确，或重启 Xray 服务`;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        result.message = 'Xray 配置文件 JSON 格式错误';
        result.suggestion = '请检查配置文件格式';
      } else {
        result.message = `读取配置文件失败: ${(error as Error).message}`;
      }
    }

    return result;
  }

  /**
   * 获取 Stats API 状态的友好提示信息
   *
   * @returns 状态提示
   */
  async getStatusMessage(): Promise<string> {
    const [available, policyEnabled] = await Promise.all([
      this.isStatsAvailable(),
      this.hasUserStatsPolicy(),
    ]);

    if (available && policyEnabled) {
      return '流量统计功能正常';
    }

    if (available && !policyEnabled) {
      return '流量统计不可用 (需要在 Xray 配置中启用 policy 统计)';
    }

    const detection = await this.detectStatsConfig();

    if (!detection.serviceRunning) {
      return '流量统计不可用 (Xray 服务未运行)';
    }

    if (!detection.configDetected) {
      return '流量统计不可用 (需要在 Xray 配置中启用 stats)';
    }

    return '流量统计不可用 (Stats API 连接失败)';
  }
}
