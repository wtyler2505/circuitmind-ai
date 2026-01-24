import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  linkedObjectId?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  history: AppNotification[];
  pushNotification: (n: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [history, setHistory] = useState<AppNotification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const newNotification: AppNotification = {
      ...n,
      id,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, newNotification]);
    setHistory((prev) => [newNotification, ...prev].slice(0, 100)); // Keep last 100

    if (n.duration !== 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, n.duration || 5000);
    }
  }, [dismissNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setHistory([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      history,
      pushNotification,
      dismissNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context;
};
