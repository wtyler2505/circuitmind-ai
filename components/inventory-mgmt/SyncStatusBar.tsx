import React, { useState, useEffect, useCallback, useReducer } from 'react';

/**
 * SyncStatusBar - Persistent sync status indicator.
 *
 * Designed to integrate with SyncContext once available.
 * Until then, monitors navigator.onLine and shows basic online/offline status.
 */

type SyncState = 'online' | 'offline' | 'syncing';

interface SyncStatusBarProps {
  /** Override sync state (from SyncContext when available) */
  syncState?: SyncState;
  /** Number of pending actions waiting to sync */
  pendingCount?: number;
  /** Last successful sync timestamp */
  lastSyncTime?: Date | null;
  /** Callback to manually trigger sync */
  onSync?: () => void;
}

function formatSyncTime(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  syncState: externalState,
  pendingCount: externalPending,
  lastSyncTime: externalLastSync,
  onSync,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(externalLastSync ?? null);
  // Simple tick counter to force re-render for time display updates
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  // Sync lastSync state when prop changes
  useEffect(() => {
    if (externalLastSync !== undefined) {
      setLastSync(externalLastSync);
    }
  }, [externalLastSync]);

  // Listen for online/offline events
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Update time display every 30s
  useEffect(() => {
    const interval = setInterval(forceRender, 30000);
    return () => clearInterval(interval);
  }, []);

  // Derive effective state
  const state: SyncState = externalState ?? (isOnline ? 'online' : 'offline');
  const pendingCount = externalPending ?? 0;
  const effectiveLastSync = externalLastSync ?? lastSync;

  const handleSync = useCallback(() => {
    if (onSync) {
      onSync();
    } else {
      // Fallback: just update last sync time
      setLastSync(new Date());
    }
  }, [onSync]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-1.5 border-t border-[#1a1a2e] bg-[#0a0a12]/80"
      role="status"
      aria-label="Sync status"
    >
      {/* Status indicator */}
      {state === 'offline' ? (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-amber-400">
            Offline
          </span>
        </div>
      ) : state === 'syncing' ? (
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-cyan-400">
            Syncing...
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-green-400">
            Synced
          </span>
        </div>
      )}

      {/* Pending count */}
      {pendingCount > 0 && (
        <span className="text-[9px] text-slate-500 font-mono">
          {pendingCount} pending
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Last sync time */}
      <span className="text-[9px] text-slate-600 font-mono">
        {formatSyncTime(effectiveLastSync)}
      </span>

      {/* Manual sync button */}
      <button
        onClick={handleSync}
        disabled={state === 'syncing' || state === 'offline'}
        className="p-1 rounded text-slate-600 hover:text-slate-400 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
        aria-label="Sync now"
        title="Sync now"
      >
        <svg
          className={`w-3.5 h-3.5 ${state === 'syncing' ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};

export default SyncStatusBar;
