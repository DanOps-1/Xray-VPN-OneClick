import { useState, useEffect, useCallback, useRef } from 'react';
import { useServices } from '../contexts/ServiceContext.js';
import { type DashboardData } from '../components/Dashboard.js';
import { OnlineManager } from '../services/online-manager.js';
import { SystemMonitor } from '../services/system-monitor.js';

export function useDashboardData(refreshInterval = 30000) {
  const { systemdManager, userManager, quotaManager, trafficManager } = useServices();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const onlineManagerRef = useRef(new OnlineManager());
  const systemMonitorRef = useRef(new SystemMonitor());

  const refresh = useCallback(async () => {
    try {
      const [status, users, quotas] = await Promise.allSettled([
        systemdManager.getStatus(),
        userManager.listUsers(),
        quotaManager.getAllQuotas(),
      ]);

      const serviceStatus = status.status === 'fulfilled' ? status.value : null;
      const userList = users.status === 'fulfilled' ? users.value : [];
      const quotaMap = quotas.status === 'fulfilled' ? quotas.value : {};

      // Calculate quota summary
      let ok = 0;
      let warning = 0;
      let exceeded = 0;

      for (const q of Object.values(quotaMap)) {
        if (q.status === 'exceeded' || q.status === 'disabled') exceeded++;
        else if (q.quotaBytes > 0 && q.usedBytes / q.quotaBytes >= 0.8) warning++;
        else ok++;
      }

      // Users without quotas count as OK
      ok += Math.max(0, userList.length - Object.keys(quotaMap).length);

      // Traffic totals
      let totalTraffic = 0;
      let uploadTraffic = 0;
      let downloadTraffic = 0;

      try {
        const usages = await trafficManager.getAllUsage();
        for (const u of usages) {
          totalTraffic += (u.uplink ?? 0) + (u.downlink ?? 0);
          uploadTraffic += u.uplink ?? 0;
          downloadTraffic += u.downlink ?? 0;
        }
      } catch {
        // Stats API might not be available
      }

      // Format uptime
      let uptime: string | undefined;
      if (serviceStatus?.uptime) {
        uptime = serviceStatus.uptime;
      }

      // Online users (based on stats API traffic diff)
      let onlineCount: number | undefined;
      try {
        const online = await onlineManagerRef.current.getOnlineConnections();
        onlineCount = online.activeCount;
      } catch {
        // Ignore
      }

      // System metrics
      const sysMetrics = systemMonitorRef.current.getAll();

      setData({
        serviceActive: serviceStatus?.active ?? false,
        uptime,
        userCount: userList.length,
        onlineCount,
        totalTraffic,
        uploadTraffic,
        downloadTraffic,
        quotaSummary: { ok, warning, exceeded },
        cpuPercent: sysMetrics.cpuPercent,
        memPercent: sysMetrics.memPercent,
        diskPercent: sysMetrics.diskPercent,
      });
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [systemdManager, userManager, quotaManager, trafficManager]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, refreshInterval);
    return () => clearInterval(timer);
  }, [refresh, refreshInterval]);

  return { data, loading, refresh };
}
