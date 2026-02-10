import { ElectronicComponent, ActionRecord, Conversation, EnhancedChatMessage } from '../types';
import { transactionQueue } from './transactionQueue';

/**
 * Storage Service
 *
 * Provides a safe wrapper for localStorage with quota protection
 * AND IndexedDB persistence for heavy/structured data.
 *
 * Write operations are routed through a transaction queue that provides:
 * - Write coalescing (rapid saves collapse to one write)
 * - Sequential per-store execution (no interleaved transactions)
 * - Cross-store parallelism (independent stores flush concurrently)
 * - Retry with exponential backoff for transient failures
 */

// ============================================================================
// INDEXED DB CONFIG
// ============================================================================

const DB_NAME = 'CircuitMindDB';
const DB_VERSION = 3;
const STORES = {
  INVENTORY: 'inventory',
  STATE: 'app_state',
  ACTION_HISTORY: 'action_history',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  PARTS: 'parts' // Store for binary FZPZ data and cached views
};

/**
 * Opens (or creates) the CircuitMind IndexedDB database.
 *
 * Exported so the transaction queue can dynamically import it at flush time
 * without circular dependency issues (transactionQueue.ts never imports
 * storage.ts at module-init; it uses `await import('./storage')` lazily).
 */
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
        db.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.STATE)) {
        db.createObjectStore(STORES.STATE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.ACTION_HISTORY)) {
        db.createObjectStore(STORES.ACTION_HISTORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messageStore.createIndex('conversationId', 'conversationId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.PARTS)) {
        db.createObjectStore(STORES.PARTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ============================================================================
// LOCAL STORAGE WRAPPER (With Quota Protection)
// ============================================================================

export const storageService = {
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e: unknown) {
      if (e instanceof DOMException && (
        e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        console.warn('LocalStorage quota exceeded. Attempting purge...');
        return storageService.handleQuotaExceeded(key, value);
      }
      return false;
    }
  },

  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },

  handleQuotaExceeded: (key: string, value: string): boolean => {
    const keys = Object.keys(localStorage);

    // 1. Purge 3D code cache
    const cacheKeys = keys.filter(k => k.startsWith('cm_3d_code_cache_'));
    cacheKeys.forEach(k => localStorage.removeItem(k));

    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      // 2. Prune inventory images if it's the inventory failing
      if (key === 'cm_inventory') {
        try {
          const inv = JSON.parse(value) as ElectronicComponent[];
          const pruned = inv.map((item) => ({
            ...item,
            imageUrl: item.imageUrl && item.imageUrl.length > 5000 ? null : item.imageUrl,
            threeCode: null
          }));
          localStorage.setItem(key, JSON.stringify(pruned));
          return true;
        } catch { return false; }
      }
      return false;
    }
  }
};

// ============================================================================
// INDEXED DB HELPERS
// ============================================================================

/**
 * Sanitizes an object to ensure it's serializable for IndexedDB.
 * Removes non-cloneable objects like Events, Functions, etc.
 * Handles circular references gracefully.
 */
const sanitizeForDB = (obj: unknown): Record<string, unknown> | null => {
  try {
    // structuredClone is native and handles circular refs + many types better than JSON
    return window.structuredClone(obj) as Record<string, unknown>;
  } catch (_e) {
    // If it fails (e.g. contains functions or complex circular refs),
    // use a robust custom stringifier that drops circularities.
    try {
      const cache = new Set();
      const stringified = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) return '[Circular]';
          cache.add(value);
        }
        return value;
      });
      return JSON.parse(stringified);
    } catch (err) {
      console.error('Failed to sanitize object for DB:', err, obj);
      return null;
    }
  }
};

// ============================================================================
// INDEXED DB WRITE OPERATIONS (Queued)
// ============================================================================

/**
 * Records an action to the action history store.
 * Routed through the transaction queue for write coalescing.
 */
export const recordAction = async (action: ActionRecord) => {
  if (!action || !action.id) {
    console.error('Cannot record action: Missing ID');
    return;
  }

  const sanitizedAction = sanitizeForDB(action);
  if (!sanitizedAction) return;

  transactionQueue.enqueue({
    id: `${STORES.ACTION_HISTORY}::put::${action.id}`,
    store: STORES.ACTION_HISTORY,
    type: 'put',
    data: sanitizedAction,
    timestamp: Date.now(),
  });
};

/**
 * Saves a conversation record.
 * Routed through the transaction queue. Rapid updates to the same
 * conversation ID coalesce (only the latest metadata is written).
 */
export const saveConversation = async (conv: Conversation) => {
  if (!conv || !conv.id) {
    console.error('Cannot save conversation: Missing ID');
    return;
  }

  const sanitizedConv = sanitizeForDB(conv);
  if (!sanitizedConv) return;

  transactionQueue.enqueue({
    id: `${STORES.CONVERSATIONS}::put::${conv.id}`,
    store: STORES.CONVERSATIONS,
    type: 'put',
    data: sanitizedConv,
    timestamp: Date.now(),
  });
};

/**
 * Saves a chat message.
 * Routed through the transaction queue. Rapid updates to the same
 * message ID coalesce (e.g. streaming updates that write the same
 * message multiple times as content grows).
 */
export const saveMessage = async (msg: EnhancedChatMessage) => {
  if (!msg || !msg.id) {
    console.error('Cannot save message: Missing ID');
    return;
  }

  const sanitizedMsg = sanitizeForDB(msg);
  if (!sanitizedMsg) return;

  transactionQueue.enqueue({
    id: `${STORES.MESSAGES}::put::${msg.id}`,
    store: STORES.MESSAGES,
    type: 'put',
    data: sanitizedMsg,
    timestamp: Date.now(),
  });
};

/**
 * Replaces the entire inventory store with the given items.
 * Uses clear-and-put to atomically replace all data within a single
 * IndexedDB transaction. Routed through the transaction queue so that
 * rapid calls (e.g. dragging components) coalesce — only the LAST
 * snapshot is actually written.
 */
export const saveInventoryToDB = async (items: ElectronicComponent[]) => {
  if (!Array.isArray(items)) return;

  // Pre-sanitize all items before enqueuing so the queue payload is clean.
  const sanitized = items
    .map(item => sanitizeForDB(item))
    .filter((s): s is Record<string, unknown> => s !== null && s.id != null);

  transactionQueue.enqueue({
    id: `${STORES.INVENTORY}::clear-and-put`,
    store: STORES.INVENTORY,
    type: 'clear-and-put',
    data: sanitized,
    timestamp: Date.now(),
  });
};

// ============================================================================
// INDEXED DB READ OPERATIONS (Direct — no queuing needed)
// ============================================================================

export const getRecentActions = async (limit: number = 10): Promise<ActionRecord[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ACTION_HISTORY, 'readonly');
    const store = tx.objectStore(STORES.ACTION_HISTORY);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as ActionRecord[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteAction = async (id: string) => {
  if (!id) return;
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.ACTION_HISTORY, 'readwrite');
    tx.objectStore(STORES.ACTION_HISTORY).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const listConversations = async (limit: number = 50): Promise<Conversation[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, 'readonly');
    const request = tx.objectStore(STORES.CONVERSATIONS).getAll();
    request.onsuccess = () => {
      const results = request.result as Conversation[];
      resolve(results.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteConversation = async (id: string) => {
  if (!id) return;
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORES.CONVERSATIONS, STORES.MESSAGES], 'readwrite');
    tx.objectStore(STORES.CONVERSATIONS).delete(id);

    // Also delete all messages for this conversation
    const msgStore = tx.objectStore(STORES.MESSAGES);
    const index = msgStore.index('conversationId');
    const request = index.openKeyCursor(IDBKeyRange.only(id));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        msgStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPrimaryConversation = async (): Promise<Conversation | null> => {
  const convs = await listConversations(100);
  return convs.find(c => c.isPrimary) || null;
};

export const loadMessages = async (conversationId: string): Promise<EnhancedChatMessage[]> => {
  if (!conversationId) {
    console.warn('loadMessages called without conversationId');
    return [];
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGES, 'readonly');
    const index = tx.objectStore(STORES.MESSAGES).index('conversationId');
    const request = index.getAll(IDBKeyRange.only(conversationId));
    request.onsuccess = () => {
      const results = request.result as EnhancedChatMessage[];
      resolve(results.sort((a, b) => a.timestamp - b.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

export const loadInventoryFromDB = async (): Promise<ElectronicComponent[]> => {
  const db = await openDB();
  const tx = db.transaction(STORES.INVENTORY, 'readonly');
  const request = tx.objectStore(STORES.INVENTORY).getAll();
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result || []);
  });
};

// ============================================================================
// FLUSH UTILITY
// ============================================================================

/**
 * Forces an immediate flush of all pending write operations.
 *
 * Call this before page unload to ensure no data is lost:
 * ```ts
 * window.addEventListener('beforeunload', () => { flushPendingWrites(); });
 * ```
 */
export const flushPendingWrites = (): Promise<void> => {
  return transactionQueue.flush();
};
