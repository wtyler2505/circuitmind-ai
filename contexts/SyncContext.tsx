import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { SyncManager } from '../services/syncManager';
import { offlineQueue } from '../services/offlineQueue';

interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  failedCount: number;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncState | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const managerRef = useRef<SyncManager | null>(null);

  useEffect(() => {
    const manager = new SyncManager({
      onOnlineChange: (online) => setIsOnline(online),
      onSyncStart: () => setIsSyncing(true),
      onSyncComplete: (processed, failed) => {
        setIsSyncing(false);
        if (processed > 0 || failed > 0) {
          setLastSyncAt(new Date().toISOString());
        }
      },
      onQueueChange: (pending, failed) => {
        setPendingCount(pending);
        setFailedCount(failed);
      },
    });

    managerRef.current = manager;
    manager.start();

    // Load initial counts
    offlineQueue.count().then(({ pending, failed }) => {
      setPendingCount(pending);
      setFailedCount(failed);
    });

    return () => {
      manager.stop();
      managerRef.current = null;
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.sync();
    }
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        lastSyncAt,
        failedCount,
        triggerSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
