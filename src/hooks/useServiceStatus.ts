import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../contexts/ServiceContext.js';

interface ServiceStatusData {
  active: boolean;
  activeState: string;
  subState: string;
  loaded: boolean;
  healthy: boolean;
  pid?: number;
  uptime?: string;
  memory?: string;
}

export function useServiceStatus(pollInterval = 5000) {
  const { systemdManager } = useServices();
  const [status, setStatus] = useState<ServiceStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await systemdManager.getStatus();
      setStatus({
        active: s.active,
        activeState: s.activeState,
        subState: s.subState,
        loaded: s.loaded,
        healthy: s.healthy,
        pid: s.pid ?? undefined,
        uptime: s.uptime,
        memory: s.memory,
      });
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [systemdManager]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, pollInterval);
    return () => clearInterval(timer);
  }, [refresh, pollInterval]);

  return { status, loading, refresh };
}
