import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../contexts/ServiceContext.js';
import { type User } from '../types/user.js';

export function useUsers() {
  const { userManager } = useServices();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const list = await userManager.listUsers();
      setUsers(list);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userManager]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { users, loading, refresh };
}
