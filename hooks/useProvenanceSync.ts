import { useState, useCallback, useRef, useEffect } from 'react';
import { ElectronicComponent } from '../types';
import { inventoryApi } from '../services/inventoryApiClient';

type SyncStatus = NonNullable<ElectronicComponent['syncStatus']>;

interface ProvenanceSyncResult {
  /** Map from component ID to its computed sync status */
  syncStatuses: Map<string, SyncStatus>;
  /** Trigger a manual sync check against the backend */
  checkSync: () => Promise<void>;
  /** ISO timestamp of the last successful check, or null if never checked */
  lastChecked: string | null;
  /** Whether a sync check is currently in progress */
  isChecking: boolean;
}

const DEBOUNCE_MS = 5_000;

/**
 * Computes per-item sync status by comparing local inventory state
 * against the backend catalog's `/catalog/changes` endpoint.
 *
 * Safe to call when the backend is unavailable — gracefully no-ops.
 */
export function useProvenanceSync(
  inventory: ElectronicComponent[],
  backendAvailable: boolean
): ProvenanceSyncResult {
  const [syncStatuses, setSyncStatuses] = useState<Map<string, SyncStatus>>(
    () => new Map()
  );
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Track the latest inventory ref so the debounced callback always
  // operates on current data without re-triggering itself.
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  const backendRef = useRef(backendAvailable);
  backendRef.current = backendAvailable;

  // Guard against concurrent checks
  const checkInFlightRef = useRef(false);

  const checkSync = useCallback(async () => {
    if (!backendRef.current || checkInFlightRef.current) return;

    const items = inventoryRef.current;
    if (items.length === 0) return;

    checkInFlightRef.current = true;
    setIsChecking(true);

    try {
      // Only items that have a backendCatalogId can be compared server-side.
      const syncableItems = items.filter((c) => c.backendCatalogId);
      const localOnlyItems = items.filter((c) => !c.backendCatalogId);

      const next = new Map<string, SyncStatus>();

      // --- Local-only items ---
      for (const item of localOnlyItems) {
        if (item.provenance === 'imported') {
          // FZPZ imports that haven't been pushed yet
          next.set(item.id, 'pending_upload');
        } else {
          next.set(item.id, 'pending_upload');
        }
      }

      // --- Items that exist on the backend ---
      if (syncableItems.length > 0) {
        const payload = syncableItems.map((c) => ({
          id: c.backendCatalogId!,
          updated_at: c.lastSyncedAt ?? new Date(0).toISOString(),
        }));

        const result = await inventoryApi.detectChanges(payload);

        // Build a quick lookup: backendCatalogId -> local item
        const catalogToLocal = new Map<string, ElectronicComponent>();
        for (const item of syncableItems) {
          catalogToLocal.set(item.backendCatalogId!, item);
        }

        // Mark unchanged items as synced
        for (const item of syncableItems) {
          // Default to synced; will be overridden below if changed/deleted.
          next.set(item.id, 'synced');
        }

        // Items whose server version differs from what the client last saw
        for (const change of result.changed) {
          const local = catalogToLocal.get(change.id);
          if (!local) continue;

          // If the client modified locally after the last sync, it's a conflict.
          // Otherwise, the server simply has a newer version (local_modified
          // from the server's perspective — the client hasn't pushed its
          // local edits yet).
          if (local.lastSyncedAt && change.clientUpdatedAt !== change.serverUpdatedAt) {
            // Both sides diverged
            next.set(local.id, 'conflict');
          } else {
            next.set(local.id, 'local_modified');
          }
        }

        // Items deleted from the server — treat as conflict
        for (const deletedId of result.deleted) {
          const local = catalogToLocal.get(deletedId);
          if (local) {
            next.set(local.id, 'conflict');
          }
        }
      }

      setSyncStatuses(next);
      setLastChecked(new Date().toISOString());
    } catch (err) {
      // Graceful degradation: log but don't throw.
      console.warn('[useProvenanceSync] sync check failed:', err);
    } finally {
      setIsChecking(false);
      checkInFlightRef.current = false;
    }
  }, []); // no deps — reads from refs

  // Debounced auto-check when backend becomes available or inventory changes.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!backendAvailable) return;

    // Clear any pending debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      checkSync();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [backendAvailable, inventory, checkSync]);

  return { syncStatuses, checkSync, lastChecked, isChecking };
}
