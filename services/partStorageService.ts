
/**
 * PartStorageService
 * 
 * Manages the persistence of binary FZPZ data and cached SVG views.
 */

const DB_NAME = 'CircuitMindDB';
const STORE_NAME = 'parts';

export interface CachedPart {
  id: string;
  binary: ArrayBuffer;
  thumbnail?: string; // Data URL
  breadboardSvg?: string;
  schematicSvg?: string;
  lastUsed: number;
}

export const partStorageService = {
  
  async savePart(part: CachedPart): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(part);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getPart(id: string): Promise<CachedPart | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async hasPart(id: string): Promise<boolean> {
    const part = await this.getPart(id);
    return !!part;
  },

  async removePart(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};
