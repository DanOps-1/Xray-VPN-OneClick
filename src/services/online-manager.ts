/**
 * Online User Manager
 *
 * Detects currently active users using two methods:
 * 1. Xray Stats API: compare traffic snapshots to detect active users
 * 2. TCP connections: parse `ss` output for connections to Xray ports
 *
 * @module services/online-manager
 */

import { execSync } from 'child_process';
import { ConfigManager } from './config-manager';

export interface OnlineUser {
  email: string;
  upload: number;
  download: number;
  activeNow: boolean;
}

export interface TcpConnection {
  remoteIp: string;
  remotePort: number;
  localPort: number;
}

export interface OnlineUserSummary {
  /** Users with traffic activity in the last interval */
  activeUsers: OnlineUser[];
  /** Number of active users */
  activeCount: number;
  /** TCP connections to Xray ports */
  tcpConnections: TcpConnection[];
  /** Unique remote IPs */
  uniqueIps: number;
  /** Xray listening ports */
  listeningPorts: number[];
  /** Xray stats API available */
  statsAvailable: boolean;
}

interface TrafficSnapshot {
  email: string;
  uplink: number;
  downlink: number;
}

/**
 * Parse ss address like "172.31.44.89:443" or "[::ffff:1.2.3.4]:443"
 */
function parseAddr(addr: string): { ip: string; port: number } | null {
  const v6 = addr.match(/^\[(.+)\]:(\d+)$/);
  if (v6) {
    let ip = v6[1]!;
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (mapped) ip = mapped[1]!;
    return { ip, port: parseInt(v6[2]!, 10) };
  }
  const v4 = addr.match(/^(.+):(\d+)$/);
  if (v4) return { ip: v4[1]!, port: parseInt(v4[2]!, 10) };
  return null;
}

export class OnlineManager {
  private configManager: ConfigManager;
  private previousSnapshot: Map<string, { up: number; down: number }> = new Map();
  private apiPort: number = 10085;

  constructor(configPath?: string) {
    this.configManager = new ConfigManager(configPath);
  }

  /**
   * Get Xray listening ports and API port from config
   */
  private async loadPorts(): Promise<{ listen: number[]; api: number }> {
    try {
      const config = await this.configManager.readConfig();
      const listen: number[] = [];
      let api = 10085;
      for (const inbound of config.inbounds ?? []) {
        if (inbound.tag === 'api' && inbound.port) {
          api = inbound.port;
        } else if (inbound.port) {
          listen.push(inbound.port);
        }
      }
      this.apiPort = api;
      return { listen, api };
    } catch {
      return { listen: [], api: 10085 };
    }
  }

  /**
   * Query Xray Stats API via the xray binary
   */
  private queryStats(): TrafficSnapshot[] {
    try {
      const output = execSync(
        `/usr/local/bin/xray api statsquery --server=127.0.0.1:${this.apiPort} 2>/dev/null`,
        { encoding: 'utf-8', timeout: 5000 }
      );
      const data = JSON.parse(output);
      const userMap = new Map<string, { uplink: number; downlink: number }>();

      for (const stat of data.stat ?? []) {
        const match = (stat.name as string).match(/^user>>>(.+?)>>>traffic>>>(uplink|downlink)$/);
        if (!match) continue;
        const email = match[1]!;
        const direction = match[2]!;
        if (!userMap.has(email)) userMap.set(email, { uplink: 0, downlink: 0 });
        const entry = userMap.get(email)!;
        if (direction === 'uplink') entry.uplink = Number(stat.value ?? 0);
        else entry.downlink = Number(stat.value ?? 0);
      }

      return Array.from(userMap.entries()).map(([email, v]) => ({
        email,
        uplink: v.uplink,
        downlink: v.downlink,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get TCP connections to Xray ports via ss
   */
  private getTcpConnections(ports: number[]): TcpConnection[] {
    if (ports.length === 0) return [];
    const connections: TcpConnection[] = [];

    try {
      const output = execSync('ss -tnH state established 2>/dev/null || true', {
        encoding: 'utf-8',
        timeout: 5000,
      });

      for (const line of output.split('\n')) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 4) continue;

        const local = parseAddr(parts[2]!);
        const peer = parseAddr(parts[3]!);
        if (!local || !peer) continue;
        if (!ports.includes(local.port)) continue;
        if (peer.ip === '127.0.0.1' || peer.ip === '::1' || peer.ip === '0.0.0.0') continue;

        connections.push({
          remoteIp: peer.ip,
          remotePort: peer.port,
          localPort: local.port,
        });
      }
    } catch {
      // ss failed
    }

    return connections;
  }

  /**
   * Detect online users by comparing traffic snapshots
   */
  async getOnlineConnections(): Promise<OnlineUserSummary> {
    const { listen } = await this.loadPorts();

    // Method 1: Stats API — compare with previous snapshot
    const currentStats = this.queryStats();
    const statsAvailable = currentStats.length > 0;
    const activeUsers: OnlineUser[] = [];

    for (const user of currentStats) {
      const prev = this.previousSnapshot.get(user.email);
      const activeNow = prev ? user.uplink > prev.up || user.downlink > prev.down : false; // First run, can't determine

      activeUsers.push({
        email: user.email,
        upload: user.uplink,
        download: user.downlink,
        activeNow,
      });
    }

    // Save current snapshot for next comparison
    this.previousSnapshot.clear();
    for (const user of currentStats) {
      this.previousSnapshot.set(user.email, { up: user.uplink, down: user.downlink });
    }

    const activeCount = activeUsers.filter((u) => u.activeNow).length;

    // Method 2: TCP connections
    const tcpConnections = this.getTcpConnections(listen);
    const uniqueIps = new Set(tcpConnections.map((c) => c.remoteIp)).size;

    return {
      activeUsers,
      activeCount,
      tcpConnections,
      uniqueIps,
      listeningPorts: listen,
      statsAvailable,
    };
  }

  /**
   * Get connection count per IP
   */
  async getConnectionCounts(): Promise<Map<string, number>> {
    const summary = await this.getOnlineConnections();
    const counts = new Map<string, number>();
    for (const conn of summary.tcpConnections) {
      counts.set(conn.remoteIp, (counts.get(conn.remoteIp) ?? 0) + 1);
    }
    return counts;
  }
}
