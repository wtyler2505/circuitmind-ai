import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
import { inventoryApi } from '../inventoryApiClient';

describe('inventoryApiClient — new sync endpoints', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  function mockJsonResponse(data: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      statusText: 'OK',
    });
  }

  // ── migrateSync ─────────────────────────────────────────────────────────
  describe('migrateSync', () => {
    it('sends POST to /api/migrate/sync with components', async () => {
      const responseData = {
        total: 2,
        created: 1,
        updated: 1,
        mapping: [
          { localId: 'local-1', catalogId: 'cat-1', action: 'created', name: 'Resistor' },
          { localId: 'local-2', catalogId: 'cat-2', action: 'updated', name: 'LED' },
        ],
      };
      mockJsonResponse(responseData);

      const result = await inventoryApi.migrateSync([
        { id: 'local-1', name: 'Resistor', type: 'other' },
        { id: 'local-2', name: 'LED', type: 'other' },
      ]);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/migrate/sync');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({
        components: [
          { id: 'local-1', name: 'Resistor', type: 'other' },
          { id: 'local-2', name: 'LED', type: 'other' },
        ],
      });
      expect(result.created).toBe(1);
      expect(result.updated).toBe(1);
      expect(result.mapping).toHaveLength(2);
    });
  });

  // ── batchSync ───────────────────────────────────────────────────────────
  describe('batchSync', () => {
    it('sends POST to /api/catalog/batch-sync', async () => {
      const responseData = {
        items: [{ id: 'cat-1', name: 'Resistor 10K' }],
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
        since: '2025-01-01T00:00:00Z',
      };
      mockJsonResponse(responseData);

      const result = await inventoryApi.batchSync('2025-01-01T00:00:00Z');

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/catalog/batch-sync');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({
        since: '2025-01-01T00:00:00Z',
        page: 1,
        limit: 100,
      });
      expect(result.items).toHaveLength(1);
    });

    it('passes custom page and limit', async () => {
      mockJsonResponse({ items: [], page: 2, limit: 50, total: 0, totalPages: 0, since: '' });

      await inventoryApi.batchSync('2025-06-01T00:00:00Z', 2, 50);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(50);
    });
  });

  // ── detectChanges ───────────────────────────────────────────────────────
  describe('detectChanges', () => {
    it('sends POST to /api/catalog/changes', async () => {
      const responseData = {
        changed: [{ id: 'cat-1', serverUpdatedAt: '2025-02-01', clientUpdatedAt: '2025-01-15' }],
        deleted: ['cat-99'],
        unchanged: 5,
        total: 7,
      };
      mockJsonResponse(responseData);

      const result = await inventoryApi.detectChanges([
        { id: 'cat-1', updated_at: '2025-01-15' },
        { id: 'cat-2', updated_at: '2025-01-20' },
      ]);

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/catalog/changes');
      expect(opts.method).toBe('POST');
      expect(result.changed).toHaveLength(1);
      expect(result.deleted).toEqual(['cat-99']);
      expect(result.unchanged).toBe(5);
    });
  });

  // ── deduplicateCatalog ──────────────────────────────────────────────────
  describe('deduplicateCatalog', () => {
    it('sends POST to /api/catalog/deduplicate without autoMerge', async () => {
      const responseData = {
        duplicateGroups: 2,
        totalDuplicates: 5,
        autoMerged: false,
      };
      mockJsonResponse(responseData);

      const result = await inventoryApi.deduplicateCatalog();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/catalog/deduplicate?autoMerge=false');
      expect(result.duplicateGroups).toBe(2);
      expect(result.autoMerged).toBe(false);
    });

    it('sends autoMerge=true when requested', async () => {
      mockJsonResponse({ duplicateGroups: 2, totalDuplicates: 5, merged: 3, autoMerged: true });

      await inventoryApi.deduplicateCatalog(true);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/catalog/deduplicate?autoMerge=true');
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────
  describe('error handling', () => {
    it('throws on non-OK response with message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid input' }),
      });

      await expect(inventoryApi.batchSync('bad')).rejects.toThrow('Invalid input');
    });

    it('throws statusText when JSON parse fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
      });

      await expect(inventoryApi.detectChanges([])).rejects.toThrow('Internal Server Error');
    });
  });
});
