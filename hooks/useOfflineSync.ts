/**
 * useOfflineSync Hook
 *
 * Convenience wrapper around SyncContext for components
 * that need sync status and queue capabilities.
 */

import { useCallback } from 'react';
import { useSync } from '../contexts/SyncContext';
import { offlineQueue } from '../services/offlineQueue';

export function useOfflineSync() {
  const { isOnline, pendingCount, failedCount, isSyncing, lastSyncAt, triggerSync } = useSync();

  const queueApiCall = useCallback(async (
    action: string,
    endpoint: string,
    method: string,
    body?: unknown
  ) => {
    return offlineQueue.enqueue({
      action,
      endpoint,
      method,
      body: body ? JSON.stringify(body) : null,
    });
  }, []);

  return {
    isOnline,
    pendingCount,
    failedCount,
    isSyncing,
    lastSyncAt,
    triggerSync,
    queueApiCall,
    hasPendingActions: pendingCount > 0,
    hasFailedActions: failedCount > 0,
  };
}
