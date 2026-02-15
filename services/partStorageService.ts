
/**
 * PartStorageService
 * 
 * Manages the persistence of binary FZPZ data and cached SVG views.
 */

import type { ComponentFootprint } from '../types';
import { PART_CACHE_VERSION } from '../types';

const DB_NAME = 'CircuitMindPartsDB';
const STORE_NAME = 'parts';
const DB_VERSION = 1;

export interface CachedPart {
  id: string;
  binary: ArrayBuffer;
  thumbnail?: string; // Data URL
  breadboardSvg?: string;
  schematicSvg?: string;
  pcbSvg?: string;
  footprint?: ComponentFootprint;
  pins?: string[];
  internalBuses?: string[][];
  diagnostics?: { level: 'warning' | 'error'; code: string; message: string }[];
  lastUsed: number;
  cacheVersion?: number;
  terminalMeta?: Record<string, { svgId: string; x: number; y: number }>;
  busDefinitions?: Array<{name: string, connectorIds: string[]}>;
  terminalPositions?: Record<string, Record<string, {x: number, y: number}>>;
}

export const partStorageService = {
  async withStore<T>(
    mode: 'readonly' | 'readwrite' | 'versionchange',
    runner: (store: IDBObjectStore, tx: IDBTransaction) => void,
    fallbackValue: T
  ): Promise<T> {
    try {
      const db = await this.openDB();
      return await new Promise<T>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, mode);
          const store = tx.objectStore(STORE_NAME);
          runner(store, tx);
          tx.oncomplete = () => resolve(fallbackValue);
          tx.onerror = () => reject(tx.error);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'VersionError')) {
        // Graceful fallback for old DB schemas in user browsers
        return fallbackValue;
      }
      throw error;
    }
  },
  
  async savePart(part: CachedPart): Promise<void> {
    return this.withStore<void>('readwrite', (store) => {
      store.put({ ...part, cacheVersion: PART_CACHE_VERSION });
    }, undefined);
  },

  async getPart(id: string): Promise<CachedPart | null> {
    try {
      const db = await this.openDB();
      return await new Promise<CachedPart | null>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const request = tx.objectStore(STORE_NAME).get(id);
          request.onsuccess = () => {
            const cached = request.result as CachedPart | undefined;
            if (cached && cached.cacheVersion !== PART_CACHE_VERSION) {
              // Stale cache version — force re-parse
              resolve(null);
              return;
            }
            resolve(cached || null);
          };
          request.onerror = () => reject(request.error);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'VersionError')) {
        return null;
      }
      throw error;
    }
  },

  async hasPart(id: string): Promise<boolean> {
    const part = await this.getPart(id);
    return !!part;
  },

  async removePart(id: string): Promise<void> {
    return this.withStore<void>('readwrite', (store) => {
      store.delete(id);
    }, undefined);
  },

  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};
