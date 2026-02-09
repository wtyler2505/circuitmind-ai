import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, expect } from 'vitest';

// Extend vitest expect with axe matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Manual mock for IndexedDB
if (!global.indexedDB) {
  const mockIDB = {
    open: vi.fn().mockImplementation(() => {
      const request: any = {
        result: {
          objectStoreNames: { contains: () => true },
          createObjectStore: vi.fn(),
          transaction: vi.fn().mockImplementation(() => {
            const tx: any = {
              objectStore: vi.fn().mockReturnValue({
                get: vi.fn().mockReturnValue({ onsuccess: null }),
                put: vi.fn().mockReturnValue({ onsuccess: null }),
                delete: vi.fn().mockReturnValue({ onsuccess: null }),
                getAll: vi.fn().mockReturnValue({ onsuccess: null }),
                openCursor: vi.fn().mockReturnValue({ onsuccess: null }),
                createIndex: vi.fn(),
              }),
              oncomplete: null,
              onerror: null,
            };
            setTimeout(() => {
              if (tx.oncomplete) tx.oncomplete();
            }, 0);
            return tx;
          }),
        },
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
      };
      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 0);
      return request;
    }),
  };
  global.indexedDB = mockIDB as any;
}

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock scrollTo
window.HTMLElement.prototype.scrollTo = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock virtua
vi.mock('virtua', () => ({
  VList: ({ children, className, style }: any) => (
    <div className={className} style={style}>{children}</div>
  ),
  VGrid: ({ children, className, style }: any) => (
    <div className={className} style={style}>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
