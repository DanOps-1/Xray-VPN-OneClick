import { useState, useEffect, useCallback, useRef } from 'react';
import { OnlineManager, type OnlineUserSummary } from '../services/online-manager';

export function useOnlineUsers(pollInterval = 5000) {
  const [summary, setSummary] = useState<OnlineUserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const managerRef = useRef(new OnlineManager());

  const refresh = useCallback(async () => {
    try {
      const data = await managerRef.current.getOnlineConnections();
      setSummary(data);
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, pollInterval);
    return () => clearInterval(timer);
  }, [refresh, pollInterval]);

  return { summary, loading, refresh };
}
