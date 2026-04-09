import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../contexts/ServiceContext.js';
import { type TrafficQuota } from '../types/quota.js';

export function useQuotas() {
  const { quotaManager } = useServices();
  const [quotas, setQuotas] = useState<Record<string, TrafficQuota>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const all = await quotaManager.getAllQuotas();
      setQuotas(all);
    } catch {
      setQuotas({});
    } finally {
      setLoading(false);
    }
  }, [quotaManager]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quotas, loading, refresh };
}
