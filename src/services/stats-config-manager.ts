/**
 * StatsConfigManager - Xray Stats API 配置管理
 *
 * 提供自动检测、配置、备份和回滚 Stats API 的功能
 *
 * @module services/stats-config-manager
 */

import { createServer } from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigManager } from './config-manager';
import { SystemdManager } from './systemd-manager';
import { DEFAULT_PATHS } from '../constants/paths';
import {
  DEFAULT_API_PORT,
  DEFAULT_API_SERVER,
  DEFAULT_STATS_CONFIG,
  STATS_PORT_RANGE,
  STATS_API_TIMEOUT,
  SERVICE_RESTART_WAIT,
  XRAY_STATS_COMMAND,
} from '../constants/quota';
import type { XrayConfigWithStats, ApiInbound, RoutingRule, ApiServiceType } from '../types/config';
import type { StatsDetectionResult, StatsConfigResult, MissingComponent } from '../types/quota';

const execAsync = promisify(exec);

/**
 * StatsConfigManager - Stats API 配置管理服务
 */
export class StatsConfigManager {
  private configManager: ConfigManager;
  private systemdManager: SystemdManager;
  private configPath: string;

  /**
   * 创建 StatsConfigManager 实例
   *
   * @param configPath - Xray 配置文件路径
   * @param serviceName - systemd 服务名称
   */
  constructor(configPath?: string, serviceName?: string) {
    this.configPath = configPath || DEFAULT_PATHS.CONFIG_FILE;
    this.configManager = new ConfigManager(this.configPath);
    this.systemdManager = new SystemdManager(serviceName || DEFAULT_PATHS.SERVICE_NAME);
  }

  /**
   * 检测缺失的 Stats API 配置组件
   *
   * @returns 缺失组件列表
   */
  async detectMissingComponents(): Promise<MissingComponent[]> {
    const missing: MissingComponent[] = [];

    try {
      const config = (await this.configManager.readConfig()) as XrayConfigWithStats;

      // 检查 stats 配置
      if (!config.stats) {
        missing.push('stats');
      }

      // 检查 api 配置
      if (!config.api || !config.api.services?.includes('StatsService')) {
        missing.push('api');
      }

      // 检查 api inbound
      const hasApiInbound = config.inbounds?.some(
        (inbound) => inbound.tag === 'api' && inbound.protocol === 'dokodemo-door'
      );
      if (!hasApiInbound) {
        missing.push('api-inbound');
      }

      // 检查 api 路由规则
      const hasApiRouting = config.routing?.rules?.some(
        (rule) => rule.inboundTag?.includes('api') && rule.outboundTag === 'api'
      );
      if (!hasApiRouting) {
        missing.push('api-routing');
      }
    } catch {
      // 配置文件不存在或无法读取，所有组件都缺失
      return ['stats', 'api', 'api-inbound', 'api-routing'];
    }

    return missing;
  }

  /**
   * 检测端口是否可用
   *
   * @param port - 要检测的端口
   * @returns 端口是否可用
   */
  async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer();

      server.once('error', () => {
        resolve(false);
      });

      server.once('listening', () => {
        server.close();
        resolve(true);
      });

      server.listen(port, DEFAULT_API_SERVER);
    });
  }

  /**
   * 查找可用端口
   *
   * @param startPort - 起始端口
   * @returns 可用端口，如果没有可用端口则返回 null
   */
  async findAvailablePort(startPort: number = DEFAULT_API_PORT): Promise<number | null> {
    for (let port = startPort; port <= STATS_PORT_RANGE.END; port++) {
      // 检查端口是否被系统占用
      const available = await this.isPortAvailable(port);
      if (!available) {
        continue;
      }

      // 检查端口是否已被 Xray 配置使用
      try {
        const config = (await this.configManager.readConfig()) as XrayConfigWithStats;
        const portInUse = config.inbounds?.some((inbound) => inbound.port === port);
        if (portInUse) {
          continue;
        }
      } catch {
        // 配置文件不存在，端口可用
      }

      return port;
    }

    return null;
  }

  /**
   * 生成 Stats API 配置对象
   *
   * @param port - API 端口
   * @returns Stats API 配置对象
   */
  generateStatsConfig(port: number = DEFAULT_API_PORT): {
    stats: Record<string, never>;
    api: { tag: string; services: ApiServiceType[] };
    apiInbound: ApiInbound;
    apiRoutingRule: RoutingRule;
  } {
    return {
      stats: {},
      api: {
        tag: DEFAULT_STATS_CONFIG.api.tag,
        services: [...DEFAULT_STATS_CONFIG.api.services] as ApiServiceType[],
      },
      apiInbound: {
        tag: DEFAULT_STATS_CONFIG.apiInbound.tag,
        port,
        listen: DEFAULT_STATS_CONFIG.apiInbound.listen,
        protocol: DEFAULT_STATS_CONFIG.apiInbound.protocol,
        settings: {
          address: DEFAULT_STATS_CONFIG.apiInbound.settings.address,
        },
      },
      apiRoutingRule: {
        type: DEFAULT_STATS_CONFIG.apiRoutingRule.type,
        inboundTag: [...DEFAULT_STATS_CONFIG.apiRoutingRule.inboundTag],
        outboundTag: DEFAULT_STATS_CONFIG.apiRoutingRule.outboundTag,
      },
    };
  }

  /**
   * 智能合并 Stats 配置到现有配置
   *
   * @param config - 现有配置
   * @param statsConfig - Stats 配置
   * @returns 合并后的配置
   */
  mergeStatsConfig(
    config: XrayConfigWithStats,
    statsConfig: ReturnType<typeof this.generateStatsConfig>
  ): XrayConfigWithStats {
    const merged = { ...config };

    // 添加 stats 配置（如果不存在）
    if (!merged.stats) {
      merged.stats = statsConfig.stats;
    }

    // 添加或更新 api 配置
    if (!merged.api) {
      merged.api = statsConfig.api;
    } else if (!merged.api.services.includes('StatsService')) {
      merged.api.services = [...merged.api.services, 'StatsService'];
    }

    // 添加 api inbound（如果不存在）
    const hasApiInbound = merged.inbounds?.some(
      (inbound) => inbound.tag === 'api' && inbound.protocol === 'dokodemo-door'
    );
    if (!hasApiInbound) {
      merged.inbounds = [...(merged.inbounds || []), statsConfig.apiInbound];
    }

    // 添加 api 路由规则（如果不存在）
    if (!merged.routing) {
      merged.routing = { rules: [] };
    }
    if (!merged.routing.rules) {
      merged.routing.rules = [];
    }

    const hasApiRouting = merged.routing.rules.some(
      (rule) => rule.inboundTag?.includes('api') && rule.outboundTag === 'api'
    );
    if (!hasApiRouting) {
      merged.routing.rules = [statsConfig.apiRoutingRule, ...merged.routing.rules];
    }

    return merged;
  }

  /**
   * 验证 Stats API 连接
   *
   * @param port - API 端口
   * @returns 是否可连接
   */
  async verifyStatsApiConnection(port: number = DEFAULT_API_PORT): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `${XRAY_STATS_COMMAND} api statsquery --server=${DEFAULT_API_SERVER}:${port} 2>/dev/null`,
        { timeout: STATS_API_TIMEOUT }
      );
      // 如果命令成功执行并返回 JSON，则 API 可用
      JSON.parse(stdout || '{}');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 备份配置文件
   *
   * @returns 备份文件路径
   */
  async backupBeforeModify(): Promise<string> {
    return await this.configManager.backupConfig();
  }

  /**
   * 回滚配置并重启服务
   *
   * @param backupPath - 备份文件路径
   */
  async rollbackOnFailure(backupPath: string): Promise<void> {
    await this.configManager.restoreConfig(backupPath);
    await this.systemdManager.restart();
  }

  /**
   * 重启服务并验证状态
   *
   * @returns 服务是否正常运行
   */
  async restartAndVerify(): Promise<boolean> {
    try {
      await this.systemdManager.restart();

      // 等待服务启动
      await new Promise((resolve) => setTimeout(resolve, SERVICE_RESTART_WAIT));

      // 检查服务状态
      const status = await this.systemdManager.getStatus();
      return status.active;
    } catch {
      return false;
    }
  }

  /**
   * 检测 Stats API 状态
   *
   * @returns 检测结果
   */
  async detectStatsConfig(): Promise<StatsDetectionResult> {
    const missingComponents = await this.detectMissingComponents();
    let serviceRunning = false;
    try {
      const status = await this.systemdManager.getStatus();
      serviceRunning = status.active;
    } catch {
      serviceRunning = false;
    }

    // 如果所有组件都存在，尝试连接 API
    if (missingComponents.length === 0 && serviceRunning) {
      // 获取配置的端口
      let detectedPort = DEFAULT_API_PORT;
      try {
        const config = (await this.configManager.readConfig()) as XrayConfigWithStats;
        const apiInbound = config.inbounds?.find(
          (inbound) => inbound.tag === 'api' && inbound.protocol === 'dokodemo-door'
        );
        if (apiInbound) {
          detectedPort = apiInbound.port;
        }
      } catch {
        // 使用默认端口
      }

      const available = await this.verifyStatsApiConnection(detectedPort);

      return {
        available,
        configDetected: true,
        detectedPort,
        serviceRunning,
        message: available ? 'Stats API 已配置且可用' : 'Stats API 已配置但无法连接',
        suggestion: available ? undefined : '请检查 Xray 服务状态和防火墙设置',
        missingComponents: [],
      };
    }

    // 有缺失组件
    const componentNames: Record<MissingComponent, string> = {
      stats: 'stats 配置块',
      api: 'API 配置',
      'api-inbound': 'API 入站配置',
      'api-routing': 'API 路由规则',
    };

    const missingNames = missingComponents.map((c) => componentNames[c]).join('、');

    return {
      available: false,
      configDetected: missingComponents.length < 4,
      serviceRunning,
      message: `Stats API 未完全配置，缺少: ${missingNames}`,
      suggestion: '是否自动配置 Stats API？',
      missingComponents,
    };
  }

  /**
   * 启用 Stats API（主方法）
   *
   * @returns 配置结果
   */
  async enableStatsApi(): Promise<StatsConfigResult> {
    let backupPath: string | undefined;

    try {
      // 1. 查找可用端口
      const port = await this.findAvailablePort();
      if (!port) {
        return {
          success: false,
          apiPort: DEFAULT_API_PORT,
          message: '无法找到可用端口',
          error: `端口范围 ${STATS_PORT_RANGE.START}-${STATS_PORT_RANGE.END} 均被占用`,
          rolledBack: false,
        };
      }

      // 2. 备份配置
      backupPath = await this.backupBeforeModify();

      // 3. 读取现有配置
      const config = (await this.configManager.readConfig()) as XrayConfigWithStats;

      // 4. 生成并合并 Stats 配置
      const statsConfig = this.generateStatsConfig(port);
      const mergedConfig = this.mergeStatsConfig(config, statsConfig);

      // 5. 写入配置 (cast to unknown first to bypass strict type checking)
      await this.configManager.writeConfig(mergedConfig as unknown as Parameters<typeof this.configManager.writeConfig>[0]);

      // 6. 重启服务
      const serviceOk = await this.restartAndVerify();
      if (!serviceOk) {
        // 服务重启失败，回滚
        await this.rollbackOnFailure(backupPath);
        return {
          success: false,
          backupPath,
          apiPort: port,
          message: '服务重启失败，已恢复原配置',
          error: 'Xray 服务启动失败，请检查配置文件',
          rolledBack: true,
        };
      }

      // 7. 验证 API 连接
      const apiOk = await this.verifyStatsApiConnection(port);
      if (!apiOk) {
        // API 无法连接，但服务运行正常，不回滚
        return {
          success: true,
          backupPath,
          apiPort: port,
          message: 'Stats API 配置成功，但连接验证失败',
          error: 'API 可能需要几秒钟才能就绪，或检查防火墙设置',
          rolledBack: false,
        };
      }

      return {
        success: true,
        backupPath,
        apiPort: port,
        message: 'Stats API 配置成功！',
        rolledBack: false,
      };
    } catch (error) {
      // 发生错误，尝试回滚
      if (backupPath) {
        try {
          await this.rollbackOnFailure(backupPath);
          return {
            success: false,
            backupPath,
            apiPort: DEFAULT_API_PORT,
            message: '配置失败，已恢复原配置',
            error: (error as Error).message,
            rolledBack: true,
          };
        } catch (rollbackError) {
          return {
            success: false,
            backupPath,
            apiPort: DEFAULT_API_PORT,
            message: '配置失败，回滚也失败',
            error: `原错误: ${(error as Error).message}; 回滚错误: ${(rollbackError as Error).message}`,
            rolledBack: false,
          };
        }
      }

      return {
        success: false,
        apiPort: DEFAULT_API_PORT,
        message: '配置失败',
        error: (error as Error).message,
        rolledBack: false,
      };
    }
  }
}
