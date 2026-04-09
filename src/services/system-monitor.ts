/**
 * System Monitor Service
 *
 * Collects system resource metrics: CPU, memory, disk, network.
 *
 * @module services/system-monitor
 */

import os from 'os';
import { execSync } from 'child_process';

export interface SystemMetrics {
  cpuPercent: number;
  memTotal: number;
  memUsed: number;
  memPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  networkRx: number;
  networkTx: number;
  uptime: number;
  loadAvg: number[];
}

export class SystemMonitor {
  private lastCpuInfo: { idle: number; total: number } | null = null;
  private lastNetInfo: { rx: number; tx: number; time: number } | null = null;

  /**
   * Get CPU usage percentage (averaged over interval since last call)
   */
  getCpuPercent(): number {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      idle += cpu.times.idle;
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle;
    }

    if (this.lastCpuInfo) {
      const idleDiff = idle - this.lastCpuInfo.idle;
      const totalDiff = total - this.lastCpuInfo.total;
      this.lastCpuInfo = { idle, total };
      if (totalDiff === 0) return 0;
      return Math.round((1 - idleDiff / totalDiff) * 100);
    }

    this.lastCpuInfo = { idle, total };
    return 0; // First call, no data yet
  }

  /**
   * Get memory usage
   */
  getMemory(): { total: number; used: number; percent: number } {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total,
      used,
      percent: Math.round((used / total) * 100),
    };
  }

  /**
   * Get disk usage of root partition
   */
  getDisk(): { total: number; used: number; percent: number } {
    try {
      const output = execSync('df -B1 / 2>/dev/null | tail -1', {
        encoding: 'utf-8',
        timeout: 3000,
      });
      const parts = output.trim().split(/\s+/);
      if (parts.length >= 5) {
        const total = parseInt(parts[1]!, 10) || 0;
        const used = parseInt(parts[2]!, 10) || 0;
        return {
          total,
          used,
          percent: total > 0 ? Math.round((used / total) * 100) : 0,
        };
      }
    } catch {
      // Fallback
    }
    return { total: 0, used: 0, percent: 0 };
  }

  /**
   * Get network throughput (bytes/sec since last call)
   */
  getNetworkThroughput(): { rx: number; tx: number } {
    try {
      const output = execSync('cat /proc/net/dev 2>/dev/null', {
        encoding: 'utf-8',
        timeout: 2000,
      });

      let totalRx = 0;
      let totalTx = 0;

      for (const line of output.split('\n')) {
        const match = line.match(
          /^\s*(\w+):\s*(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/
        );
        if (match && match[1] !== 'lo') {
          totalRx += parseInt(match[2]!, 10);
          totalTx += parseInt(match[3]!, 10);
        }
      }

      const now = Date.now();

      if (this.lastNetInfo) {
        const elapsed = (now - this.lastNetInfo.time) / 1000;
        const rx = elapsed > 0 ? (totalRx - this.lastNetInfo.rx) / elapsed : 0;
        const tx = elapsed > 0 ? (totalTx - this.lastNetInfo.tx) / elapsed : 0;
        this.lastNetInfo = { rx: totalRx, tx: totalTx, time: now };
        return { rx: Math.max(0, rx), tx: Math.max(0, tx) };
      }

      this.lastNetInfo = { rx: totalRx, tx: totalTx, time: now };
    } catch {
      // /proc not available
    }
    return { rx: 0, tx: 0 };
  }

  /**
   * Get all system metrics in one call
   */
  getAll(): SystemMetrics {
    const mem = this.getMemory();
    const disk = this.getDisk();
    const net = this.getNetworkThroughput();

    return {
      cpuPercent: this.getCpuPercent(),
      memTotal: mem.total,
      memUsed: mem.used,
      memPercent: mem.percent,
      diskTotal: disk.total,
      diskUsed: disk.used,
      diskPercent: disk.percent,
      networkRx: net.rx,
      networkTx: net.tx,
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
    };
  }
}
