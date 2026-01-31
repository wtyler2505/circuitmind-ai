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
  pushNotification: (n: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string }) => void;
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

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string }) => {
    const id = n.id || crypto.randomUUID();
    
    setNotifications((prev) => {
      // Prevent duplicate active notifications with the same ID
      if (prev.some(notif => notif.id === id)) {
        return prev;
      }

      const newNotification: AppNotification = {
        ...n,
        id,
        timestamp: Date.now(),
      };

      return [...prev, newNotification];
    });

    // For history, we can still add it if needed, or check duplicates there too
    const newEntry: AppNotification = { ...n, id, timestamp: Date.now() };
    setHistory((prev) => [newEntry, ...prev].slice(0, 100));

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

  const contextValue = React.useMemo(() => ({
    notifications,
    history,
    pushNotification,
    dismissNotification,
    clearAll
  }), [notifications, history, pushNotification, dismissNotification, clearAll]);

  return (
    <NotificationContext.Provider value={contextValue}>
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
