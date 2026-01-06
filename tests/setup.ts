import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Manual mock for IndexedDB
if (!global.indexedDB) {
  const mockIDB = {
    open: () => ({
      result: {
        objectStoreNames: { contains: () => false },
        createObjectStore: () => {},
        transaction: () => ({
          objectStore: () => ({
            get: () => ({ onsuccess: () => {} }),
            put: () => ({ onsuccess: () => {} }),
            delete: () => ({ onsuccess: () => {} }),
            getAll: () => ({ onsuccess: () => {} }),
            openCursor: () => ({ onsuccess: () => {} }),
            createIndex: () => {},
          }),
        }),
      },
      onupgradeneeded: () => {},
      onsuccess: () => {},
      onerror: () => {},
    }),
  };
  global.indexedDB = mockIDB as any;
}

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock scrollTo
window.HTMLElement.prototype.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
