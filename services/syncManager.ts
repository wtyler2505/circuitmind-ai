import { offlineQueue, QueueEntry } from './offlineQueue';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 16000;
const API_BASE = '/api';

function getBackoffDelay(retries: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, retries), MAX_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processEntry(entry: QueueEntry): Promise<boolean> {
  try {
    await offlineQueue.update(entry.id, { status: 'processing' });

    const options: RequestInit = {
      method: entry.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (entry.body) {
      options.body = entry.body;
    }

    const res = await fetch(`${API_BASE}${entry.endpoint}`, options);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    await offlineQueue.remove(entry.id);
    return true;
  } catch {
    const newRetries = entry.retries + 1;
    if (newRetries >= MAX_RETRIES) {
      await offlineQueue.update(entry.id, {
        status: 'failed',
        retries: newRetries,
      });
      return false;
    }
    await offlineQueue.update(entry.id, {
      status: 'pending',
      retries: newRetries,
    });
    return false;
  }
}

export interface SyncManagerCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (processed: number, failed: number) => void;
  onOnlineChange?: (isOnline: boolean) => void;
  onQueueChange?: (pending: number, failed: number) => void;
}

export class SyncManager {
  private syncing = false;
  private callbacks: SyncManagerCallbacks;
  private onlineHandler: () => void;
  private offlineHandler: () => void;

  constructor(callbacks: SyncManagerCallbacks = {}) {
    this.callbacks = callbacks;

    this.onlineHandler = () => {
      this.callbacks.onOnlineChange?.(true);
      this.sync();
    };
    this.offlineHandler = () => {
      this.callbacks.onOnlineChange?.(false);
    };
  }

  start(): void {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);

    if (navigator.onLine) {
      this.sync();
    }
  }

  stop(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  get isSyncing(): boolean {
    return this.syncing;
  }

  async sync(): Promise<{ processed: number; failed: number }> {
    if (this.syncing || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    this.syncing = true;
    this.callbacks.onSyncStart?.();

    let processed = 0;
    let failed = 0;

    try {
      let entry = await offlineQueue.dequeue();
      while (entry) {
        const success = await processEntry(entry);
        if (success) {
          processed++;
        } else {
          failed++;
          // Apply backoff before trying next item
          const delay = getBackoffDelay(entry.retries);
          await sleep(delay);
        }

        const counts = await offlineQueue.count();
        this.callbacks.onQueueChange?.(counts.pending, counts.failed);

        entry = await offlineQueue.dequeue();
      }
    } finally {
      this.syncing = false;
      this.callbacks.onSyncComplete?.(processed, failed);
    }

    return { processed, failed };
  }
}
