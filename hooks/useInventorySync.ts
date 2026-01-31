/**
 * useInventorySync Hook
 *
 * Automatically syncs diagram components with inventory changes.
 * Inventory is the SINGLE SOURCE OF TRUTH - diagram components inherit changes.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { ElectronicComponent, WiringDiagram } from '../types';
import {
  validateDiagramInventoryConsistency,
  syncDiagramWithInventory,
} from '../services/componentValidator';

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
}

/**
 * Hook that keeps diagram components in sync with inventory
 *
 * @param inventory - Current inventory items
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

  /**
   * Manually validate diagram against inventory
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

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    if (!result.isValid && onValidationFail) {
      onValidationFail(result.mismatches);
    }

    return result;
  }, [diagram, inventory, onValidationFail]);

  /**
   * Manually sync diagram with inventory
   */
  const syncNow = useCallback(() => {
    if (!diagram) return 0;

    isSyncingRef.current = true;

    const { diagram: syncedDiagram, changeCount } = syncDiagramWithInventory(
      diagram,
      inventory
    );

    if (changeCount > 0) {
      updateDiagram(syncedDiagram);
      lastSyncTimeRef.current = Date.now();

      if (onSync) {
        onSync(changeCount);
      }
    }

    isSyncingRef.current = false;
    return changeCount;
  }, [diagram, inventory, updateDiagram, onSync]);

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

  /**
   * Watch for inventory changes and auto-sync
   */
  useEffect(() => {
    if (!autoSync || !diagram) return;

    // Create a stable representation of inventory for comparison
    const inventorySnapshot = JSON.stringify(
      inventory.map(i => ({ id: i.id, name: i.name, type: i.type, pins: i.pins }))
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
  }, [inventory, diagram, autoSync, syncNow, debouncedSync]);

  /**
   * Validate on diagram changes
   */
  useEffect(() => {
    if (!diagram || process.env.NODE_ENV !== 'development') return;

    // Validate when diagram loads or changes
    // We use a small timeout to let the sync effect finish if it's racing
    const timer = setTimeout(() => {
        const result = validateNow();

        if (!result.isValid) {
          console.warn(
            `⚠️ Diagram has ${result.mismatches.length} inconsistencies.`
          );
        } else {
            // Optional: Log success if we want to confirm sync
            // console.log('✅ Diagram consistency verified');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [diagram, validateNow]);

  return {
    syncNow,
    validateNow,
    lastSyncTime: lastSyncTimeRef.current,
    isSyncing: isSyncingRef.current,
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
