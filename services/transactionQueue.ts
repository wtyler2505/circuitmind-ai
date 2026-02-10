/**
 * Transaction Queue for IndexedDB Write Operations
 *
 * Solves persistence race conditions by:
 * 1. Write coalescing — rapid duplicate writes collapse to the latest data
 * 2. Sequential per-store execution — no concurrent writes to the same store
 * 3. Cross-store parallelism — independent stores flush in parallel
 * 4. Debounced auto-flush — batches rapid writes (default 300ms)
 * 5. Retry with exponential backoff — transient failures are retried up to 2x
 * 6. Error callback — consumers can register handlers for failed writes
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WriteOperation {
  /** Unique operation ID (used as coalescing key). */
  id: string;
  /** IndexedDB object store name. */
  store: string;
  /** Operation type. */
  type: 'put' | 'delete' | 'clear-and-put' | 'clear';
  /** Payload for put operations. */
  data?: unknown;
  /** When this operation was enqueued. */
  timestamp: number;
}

export interface TransactionQueueConfig {
  /** Milliseconds of silence before an automatic flush (default 300). */
  debounceMs?: number;
  /** Maximum retry attempts for a failed operation (default 2). */
  maxRetries?: number;
}

type ErrorCallback = (error: Error, op: WriteOperation) => void;

export interface TransactionQueue {
  enqueue(op: WriteOperation): void;
  flush(): Promise<void>;
  getPending(): number;
  onError(cb: ErrorCallback): void;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

function createTransactionQueue(config: TransactionQueueConfig = {}): TransactionQueue {
  const debounceMs = config.debounceMs ?? 300;
  const maxRetries = config.maxRetries ?? 2;

  // ---- Internal state ----

  /**
   * Pending operations keyed by the operation's `id` field.
   *
   * Coalescing strategy:
   * - `clear-and-put` operations use `${store}::clear-and-put` as their id,
   *   so rapid full-store replacements (e.g. saveInventoryToDB called 5x)
   *   collapse to a single write with the latest data.
   * - `put` operations for individual records use `${store}::put::${recordId}`
   *   so different records in the same store coexist, but rapid updates to
   *   the SAME record coalesce (e.g. updating conversation metadata 3x fast).
   */
  const pendingOps = new Map<string, WriteOperation>();

  /** Per-store promise chains that enforce sequential execution. */
  const storeChains = new Map<string, Promise<void>>();

  /** Registered error handlers. */
  const errorHandlers: ErrorCallback[] = [];

  /** Handle returned by setTimeout for the debounced auto-flush. */
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Tracks whether a flush is currently executing. */
  let flushing = false;

  // ---- Helpers ----

  function emitError(error: Error, op: WriteOperation): void {
    for (const cb of errorHandlers) {
      try {
        cb(error, op);
      } catch {
        // Error handlers should not throw, but if they do we swallow it to
        // avoid breaking the flush pipeline.
      }
    }
  }

  /**
   * Executes a single IndexedDB write with retry logic.
   *
   * The `openDB` function is obtained via dynamic import to avoid circular
   * dependency (storage.ts imports transactionQueue; transactionQueue calls
   * back into openDB at flush time).
   */
  async function executeOp(
    op: WriteOperation,
    dbOpener: () => Promise<IDBDatabase>,
    attempt = 0,
  ): Promise<void> {
    try {
      const db = await dbOpener();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(op.store, 'readwrite');
        const objectStore = tx.objectStore(op.store);

        switch (op.type) {
          case 'put': {
            if (op.data != null) {
              if (Array.isArray(op.data)) {
                for (const item of op.data) {
                  if (item && typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
                    objectStore.put(item);
                  }
                }
              } else {
                objectStore.put(op.data);
              }
            }
            break;
          }
          case 'delete': {
            if (op.data != null) {
              objectStore.delete(op.data as IDBValidKey);
            }
            break;
          }
          case 'clear-and-put': {
            // Atomic clear-then-bulk-put inside a single transaction.
            const clearReq = objectStore.clear();
            clearReq.onsuccess = () => {
              if (Array.isArray(op.data)) {
                for (const item of op.data) {
                  if (item && typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
                    objectStore.put(item);
                  }
                }
              }
            };
            clearReq.onerror = () => reject(clearReq.error);
            break;
          }
          case 'clear': {
            objectStore.clear();
            break;
          }
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        // Exponential backoff: 200ms, 400ms
        const delay = 200 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        return executeOp(op, dbOpener, attempt + 1);
      }
      emitError(error, op);
      // After exhausting retries, the error has been reported via callback.
      // We do NOT re-throw — remaining operations in other stores should
      // still proceed.
    }
  }

  /**
   * Chains an operation onto a store's sequential promise chain.
   * Returns the promise for this specific operation.
   */
  function chainOnStore(
    storeName: string,
    op: WriteOperation,
    dbOpener: () => Promise<IDBDatabase>,
  ): Promise<void> {
    const prev = storeChains.get(storeName) ?? Promise.resolve();
    const next = prev.then(() => executeOp(op, dbOpener));
    storeChains.set(storeName, next);
    return next;
  }

  // ---- Public API ----

  function enqueue(op: WriteOperation): void {
    // The op.id IS the coalescing key. Callers construct it to get the
    // right granularity (store-level for clear-and-put, record-level for put).
    pendingOps.set(op.id, op);

    // Reset debounce timer.
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      // Fire-and-forget; errors are reported via onError callbacks.
      flush().catch(() => {});
    }, debounceMs);
  }

  async function flush(): Promise<void> {
    if (flushing) {
      // If a flush is already running, wait for it to finish and then
      // re-flush if new ops were enqueued during that time.
      return new Promise<void>((resolve) => {
        const check = () => {
          if (!flushing) {
            if (pendingOps.size > 0) {
              flush().then(resolve).catch(resolve);
            } else {
              resolve();
            }
          } else {
            setTimeout(check, 50);
          }
        };
        setTimeout(check, 50);
      });
    }

    // Nothing to do.
    if (pendingOps.size === 0) return;

    flushing = true;

    // Cancel any pending debounce — we are flushing now.
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // Snapshot current pending ops and clear the map so new enqueues during
    // flush go into a fresh batch.
    const ops = Array.from(pendingOps.values());
    pendingOps.clear();

    // Lazy-import openDB to avoid circular dependencies.
    // storage.ts exports openDB for our use; we dynamically import it.
    const { openDB } = await import('./storage');

    // Group by store so we can parallelise across stores.
    const byStore = new Map<string, WriteOperation[]>();
    for (const op of ops) {
      const list = byStore.get(op.store) ?? [];
      list.push(op);
      byStore.set(op.store, list);
    }

    // For each store, chain operations sequentially; across stores, run in parallel.
    const storePromises: Promise<void>[] = [];
    for (const [storeName, storeOps] of byStore) {
      // Sort by timestamp within a store to preserve causal order.
      storeOps.sort((a, b) => a.timestamp - b.timestamp);
      let p = Promise.resolve();
      for (const op of storeOps) {
        p = p.then(() => chainOnStore(storeName, op, openDB));
      }
      storePromises.push(p);
    }

    await Promise.all(storePromises);
    flushing = false;
  }

  function getPending(): number {
    return pendingOps.size;
  }

  function onError(cb: ErrorCallback): void {
    errorHandlers.push(cb);
  }

  return { enqueue, flush, getPending, onError };
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const transactionQueue = createTransactionQueue();

// Also export the factory for testing with custom configs.
export { createTransactionQueue };
