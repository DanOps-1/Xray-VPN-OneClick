import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (type: Notification['type'], message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  notify: () => {},
  dismiss: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: Notification['type'], message: string) => {
      const id = nextId++;
      setNotifications((prev) => [...prev, { id, type, message }]);
      // Auto-dismiss after 3 seconds
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  return useContext(NotificationContext);
}
