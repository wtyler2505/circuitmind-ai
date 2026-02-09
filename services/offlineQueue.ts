const QUEUE_DB_NAME = 'CircuitMindSyncQueue';
const QUEUE_DB_VERSION = 1;
const QUEUE_STORE = 'sync_queue';

export interface QueueEntry {
  id: string;
  action: string;
  endpoint: string;
  method: string;
  body: string | null;
  createdAt: string;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

function openQueueDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB_NAME, QUEUE_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const offlineQueue = {
  async enqueue(params: {
    action: string;
    endpoint: string;
    method: string;
    body?: string | null;
  }): Promise<QueueEntry> {
    const db = await openQueueDB();
    const entry: QueueEntry = {
      id: generateId(),
      action: params.action,
      endpoint: params.endpoint,
      method: params.method,
      body: params.body ?? null,
      createdAt: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      tx.objectStore(QUEUE_STORE).add(entry);
      tx.oncomplete = () => resolve(entry);
      tx.onerror = () => reject(tx.error);
    });
  },

  async dequeue(): Promise<QueueEntry | null> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const index = tx.objectStore(QUEUE_STORE).index('createdAt');
      const request = index.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(null);
          return;
        }
        const entry = cursor.value as QueueEntry;
        if (entry.status === 'pending') {
          resolve(entry);
        } else {
          cursor.continue();
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async remove(id: string): Promise<void> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      tx.objectStore(QUEUE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async update(id: string, updates: Partial<QueueEntry>): Promise<void> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const entry = getReq.result as QueueEntry | undefined;
        if (!entry) {
          reject(new Error(`Queue entry ${id} not found`));
          return;
        }
        store.put({ ...entry, ...updates });
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async listPending(): Promise<QueueEntry[]> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const index = tx.objectStore(QUEUE_STORE).index('status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async listFailed(): Promise<QueueEntry[]> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const index = tx.objectStore(QUEUE_STORE).index('status');
      const request = index.getAll('failed');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async count(): Promise<{ pending: number; failed: number }> {
    const [pending, failed] = await Promise.all([
      this.listPending(),
      this.listFailed(),
    ]);
    return { pending: pending.length, failed: failed.length };
  },

  async clear(): Promise<void> {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      tx.objectStore(QUEUE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};
