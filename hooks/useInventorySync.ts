/**
 * useInventorySync Hook
 *
 * Automatically syncs diagram components with inventory changes.
 * Inventory is the SINGLE SOURCE OF TRUTH - diagram components inherit changes.
 *
 * This hook eliminates the provider-ordering dependency by falling back to
 * IndexedDB when the passed inventory array is empty (e.g., InventoryContext
 * hasn't loaded yet). It also uses BroadcastChannel for cross-tab sync.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ElectronicComponent, WiringDiagram } from '../types';
import {
  validateDiagramInventoryConsistency,
  syncDiagramWithInventory,
} from '../services/componentValidator';

// ---------------------------------------------------------------------------
// IndexedDB constants (duplicated from storage.ts to avoid circular deps)
// ---------------------------------------------------------------------------
const IDB_NAME = 'CircuitMindDB';
const IDB_VERSION = 3;
const IDB_STORE_INVENTORY = 'inventory';

// ---------------------------------------------------------------------------
// BroadcastChannel name
// ---------------------------------------------------------------------------
const BROADCAST_CHANNEL_NAME = 'circuitmind-inventory-sync';

// ---------------------------------------------------------------------------
// IndexedDB direct-read cache (module-level, shared across instances)
// ---------------------------------------------------------------------------
interface InventoryCache {
  items: ElectronicComponent[];
  loadedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let inventoryCache: InventoryCache | null = null;

/**
 * Open CircuitMindDB directly (no import from storage.ts).
 * Returns the IDBDatabase handle or throws.
 */
function openInventoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Ensure the inventory store exists (mirrors storage.ts logic)
      if (!db.objectStoreNames.contains(IDB_STORE_INVENTORY)) {
        db.createObjectStore(IDB_STORE_INVENTORY, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load inventory items directly from IndexedDB.
 * Uses a module-level cache with a 5-minute TTL.
 */
async function loadInventoryDirect(): Promise<ElectronicComponent[]> {
  // Return cached data if still fresh
  if (inventoryCache && Date.now() - inventoryCache.loadedAt < CACHE_TTL_MS) {
    return inventoryCache.items;
  }

  const db = await openInventoryDB();
  return new Promise<ElectronicComponent[]>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_INVENTORY, 'readonly');
    const request = tx.objectStore(IDB_STORE_INVENTORY).getAll();

    request.onsuccess = () => {
      const items = (request.result || []) as ElectronicComponent[];
      inventoryCache = { items, loadedAt: Date.now() };
      resolve(items);
    };

    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

interface UseInventorySyncOptions {
  /** Enable auto-sync when inventory changes (default: true) */
  autoSync?: boolean;
  /** Debounce time for validation in ms (default: 300) */
  debounceMs?: number;
  /** Callback when sync occurs */
  onSync?: (changeCount: number) => void;
  /** Callback when validation fails */
  onValidationFail?: (mismatches: ReturnType<typeof validateDiagramInventoryConsistency>['mismatches']) => void;
}

interface UseInventorySyncReturn {
  /** Manually trigger sync */
  syncNow: () => number;
  /** Manually trigger validation */
  validateNow: () => ReturnType<typeof validateDiagramInventoryConsistency>;
  /** Last sync timestamp */
  lastSyncTime: number | null;
  /** Whether currently syncing */
  isSyncing: boolean;
  /** Error message if both context and IndexedDB fallback fail */
  syncError: string | null;
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------

/**
 * Hook that keeps diagram components in sync with inventory.
 *
 * When the passed `inventory` is empty (e.g., InventoryContext hasn't loaded
 * yet), the hook falls back to reading directly from IndexedDB so that sync
 * succeeds regardless of provider mount ordering.
 *
 * @param inventory - Current inventory items (may be empty during mount race)
 * @param diagram - Current wiring diagram
 * @param updateDiagram - Function to update the diagram
 * @param options - Configuration options
 */
export function useInventorySync(
  inventory: ElectronicComponent[],
  diagram: WiringDiagram | null,
  updateDiagram: (diagram: WiringDiagram) => void,
  options: UseInventorySyncOptions = {}
): UseInventorySyncReturn {
  const {
    autoSync = true,
    debounceMs = 300,
    onSync,
    onValidationFail,
  } = options;

  const lastSyncTimeRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevInventoryRef = useRef<string>('');
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Resolved inventory: context-provided OR IndexedDB-loaded fallback
  const [fallbackInventory, setFallbackInventory] = useState<ElectronicComponent[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Determine the effective inventory to use for sync operations.
  // If the caller passed a non-empty array, use it. Otherwise use fallback.
  const effectiveInventory = inventory.length > 0 ? inventory : fallbackInventory;

  // -----------------------------------------------------------------------
  // IndexedDB fallback: load when context inventory is empty
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (inventory.length > 0) {
      // Context provided inventory — clear any previous error/fallback
      if (syncError) setSyncError(null);
      return;
    }

    let cancelled = false;

    loadInventoryDirect()
      .then((items) => {
        if (cancelled) return;
        if (items.length > 0) {
          setFallbackInventory(items);
          console.info(
            `[useInventorySync] Context inventory empty — loaded ${items.length} items from IndexedDB fallback`
          );
        } else {
          // Both sources are empty
          console.warn(
            '[useInventorySync] Context inventory empty and IndexedDB returned 0 items'
          );
        }
        if (syncError) setSyncError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Unknown IndexedDB error';
        console.error('[useInventorySync] IndexedDB fallback failed:', message);
        setSyncError(
          `Inventory sync failed: context inventory empty and IndexedDB fallback error — ${message}`
        );
      });

    return () => {
      cancelled = true;
    };
    // Only re-run when inventory length transitions to/from 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory.length === 0]);

  // -----------------------------------------------------------------------
  // BroadcastChannel: cross-tab sync
  // -----------------------------------------------------------------------
  useEffect(() => {
    // BroadcastChannel may not exist in all environments (e.g., some test runners)
    if (typeof BroadcastChannel === 'undefined') return;

    let resyncTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === 'inventory-updated') {
          // Invalidate the module-level cache so next read is fresh
          inventoryCache = null;

          // Re-sync within 1 second
          if (resyncTimer) clearTimeout(resyncTimer);
          resyncTimer = setTimeout(() => {
            // If context inventory is still empty, reload from IDB
            if (inventory.length === 0) {
              loadInventoryDirect()
                .then((items) => {
                  if (items.length > 0) setFallbackInventory(items);
                })
                .catch(() => {
                  // Silently ignore — the main effect already handles errors
                });
            }
            // Trigger a re-sync with whatever effective inventory we have
            // (the syncNow below uses the latest ref-captured values)
            syncNowRef.current();
          }, 1000);
        }
      };
    } catch {
      // BroadcastChannel constructor can throw in restricted contexts
      console.warn('[useInventorySync] BroadcastChannel not available');
    }

    return () => {
      if (resyncTimer) clearTimeout(resyncTimer);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Core sync / validate callbacks
  // -----------------------------------------------------------------------

  /**
   * Manually validate diagram against effective inventory
   */
  const validateNow = useCallback(() => {
    if (!diagram) {
      return {
        isValid: true,
        mismatches: [],
        orphanedCount: 0,
        syncedCount: 0,
        totalChecked: 0,
      };
    }

    const result = validateDiagramInventoryConsistency(diagram, effectiveInventory);

    if (!result.isValid && onValidationFail) {
      onValidationFail(result.mismatches);
    }

    return result;
  }, [diagram, effectiveInventory, onValidationFail]);

  /**
   * Manually sync diagram with effective inventory
   */
  const syncNow = useCallback(() => {
    if (!diagram) return 0;
    if (effectiveInventory.length === 0) return 0;

    isSyncingRef.current = true;

    try {
      const { diagram: syncedDiagram, changeCount } = syncDiagramWithInventory(
        diagram,
        effectiveInventory
      );

      if (changeCount > 0) {
        updateDiagram(syncedDiagram);
        lastSyncTimeRef.current = Date.now();

        if (onSync) {
          onSync(changeCount);
        }

        // Notify other tabs
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({ type: 'inventory-updated' });
          } catch {
            // Channel may be closed — ignore
          }
        }
      }

      isSyncingRef.current = false;
      return changeCount;
    } catch (err) {
      isSyncingRef.current = false;
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      console.error('[useInventorySync] Sync failed:', message);
      setSyncError(`Sync failed: ${message}`);
      return 0;
    }
  }, [diagram, effectiveInventory, updateDiagram, onSync]);

  // Stable ref so BroadcastChannel handler always calls latest syncNow
  const syncNowRef = useRef(syncNow);
  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  /**
   * Debounced sync triggered by inventory changes
   */
  const debouncedSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      syncNow();
    }, debounceMs);
  }, [syncNow, debounceMs]);

  // -----------------------------------------------------------------------
  // Auto-sync on inventory changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!autoSync || !diagram) return;

    // Create a stable representation of effective inventory for comparison
    const inventorySnapshot = JSON.stringify(
      effectiveInventory.map(i => ({ id: i.id, name: i.name, type: i.type, pins: i.pins }))
    );

    // Skip if inventory hasn't actually changed
    if (inventorySnapshot === prevInventoryRef.current) {
      return;
    }

    prevInventoryRef.current = inventorySnapshot;

    // First sync - no debounce
    if (lastSyncTimeRef.current === null) {
      syncNow();
      return;
    }

    // Subsequent changes - debounce
    debouncedSync();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [effectiveInventory, diagram, autoSync, syncNow, debouncedSync]);

  // -----------------------------------------------------------------------
  // Dev-mode validation on diagram changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!diagram || process.env.NODE_ENV !== 'development') return;

    // Validate when diagram loads or changes
    // We use a small timeout to let the sync effect finish if it's racing
    const timer = setTimeout(() => {
        const result = validateNow();

        if (!result.isValid) {
          console.warn(
            `[useInventorySync] Diagram has ${result.mismatches.length} inconsistencies.`
          );
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [diagram, validateNow]);

  return {
    syncNow,
    validateNow,
    lastSyncTime: lastSyncTimeRef.current,
    isSyncing: isSyncingRef.current,
    syncError,
  };
}

/**
 * Lightweight validation hook for dev mode warnings
 * (Less overhead than full sync hook)
 */
export function useDevValidation(
  inventory: ElectronicComponent[],
  diagram: WiringDiagram | null,
  debounceMs = 300
): void {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;
    if (!diagram) return;

    // Debounced validation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const result = validateDiagramInventoryConsistency(diagram, inventory);
      // Validation runs silently - check result in dev tools if needed
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inventory, diagram, debounceMs]);
}

export default useInventorySync;
