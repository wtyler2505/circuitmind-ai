import { ElectronicComponent, WiringDiagram } from '../types';

const DB_NAME = 'CircuitMindDB';
const DB_VERSION = 1;
const STORES = {
  INVENTORY: 'inventory',
  STATE: 'app_state' // For diagrams, history, settings
};

// Open (or create) the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store for Inventory Items (key: id)
      if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
        db.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
      }
      
      // Store for General App State (key: key string)
      if (!db.objectStoreNames.contains(STORES.STATE)) {
        db.createObjectStore(STORES.STATE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
        console.error("IndexedDB Error:", request.error);
        reject(request.error);
    };
  });
};

// --- Inventory Operations ---

export const saveInventoryToDB = async (items: ElectronicComponent[]) => {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.INVENTORY, 'readwrite');
      const store = tx.objectStore(STORES.INVENTORY);
      
      // Clear existing to handle deletions, then add all
      // For personal use (<1000 items), this is fast enough and ensures consistency
      const clearReq = store.clear();
      
      clearReq.onsuccess = () => {
          if (items.length === 0) {
              resolve();
              return;
          }
          let completed = 0;
          items.forEach(item => {
              const req = store.put(item);
              req.onsuccess = () => {
                  completed++;
                  if (completed === items.length) resolve();
              };
              req.onerror = () => {
                  console.error("Failed to save item:", item.name);
                  // We continue trying to save others even if one fails
                  completed++;
                  if (completed === items.length) resolve();
              };
          });
      };
      
      clearReq.onerror = () => reject(clearReq.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
      console.error("DB Save Error:", e);
  }
};

export const loadInventoryFromDB = async (): Promise<ElectronicComponent[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.INVENTORY, 'readonly');
        const store = tx.objectStore(STORES.INVENTORY);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
  } catch (e) {
      console.error("DB Load Error:", e);
      return [];
  }
};

// --- App State (Diagrams/History) Operations ---

export const saveAppState = async (key: string, data: any) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORES.STATE, 'readwrite');
            const store = tx.objectStore(STORES.STATE);
            store.put({ key, data, timestamp: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("State Save Error:", e);
    }
};

export const loadAppState = async (key: string): Promise<any | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORES.STATE, 'readonly');
            const store = tx.objectStore(STORES.STATE);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("State Load Error:", e);
        return null;
    }
};
