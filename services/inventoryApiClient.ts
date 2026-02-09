// ============ Types ============

export interface CatalogItem {
  id: string;
  name: string;
  type: string;
  description: string;
  manufacturer: string;
  mpn: string;
  packageType: string;
  datasheetUrl: string;
  imageUrl: string;
  pins: string[];
  specs: Record<string, string>;
  aiConfidence: number;
  aiProvider: string;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLot {
  id: string;
  catalogId: string;
  locationId: string | null;
  quantity: number;
  lowStockThreshold: number;
  notes: string;
  voiceNoteUrl: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  catalogItem?: CatalogItem;
  location?: Location;
}

export interface Location {
  id: string;
  parentId: string | null;
  name: string;
  description: string;
  qrCode: string;
  path: string;
  createdAt: string;
  children?: Location[];
}

export interface StockMove {
  id: string;
  lotId: string;
  delta: number;
  reason: string;
  note: string;
  createdAt: string;
}

export interface IdentificationResult {
  catalogItem: CatalogItem;
  inventoryLot: InventoryLot;
  stockMove: StockMove;
  confidence: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ API Client ============

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }
  return res.json();
}

export const inventoryApi = {
  // Health
  health: () => request<{ status: string }>('/health'),

  // Catalog
  listCatalog: (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    needsReview?: boolean;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.type) search.set('type', params.type);
    if (params?.needsReview !== undefined)
      search.set('needsReview', String(params.needsReview));
    return request<PaginatedResponse<CatalogItem>>(`/catalog?${search}`);
  },
  getCatalog: (id: string) => request<CatalogItem>(`/catalog/${id}`),
  createCatalog: (data: Partial<CatalogItem>) =>
    request<CatalogItem>('/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCatalog: (id: string, data: Partial<CatalogItem>) =>
    request<CatalogItem>(`/catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCatalog: (id: string) =>
    request<void>(`/catalog/${id}`, { method: 'DELETE' }),

  // Inventory Lots
  listInventory: (params?: {
    page?: number;
    pageSize?: number;
    catalogId?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.catalogId) search.set('catalogId', params.catalogId);
    return request<PaginatedResponse<InventoryLot>>(`/inventory?${search}`);
  },
  createInventory: (data: Partial<InventoryLot>) =>
    request<InventoryLot>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateInventory: (id: string, data: Partial<InventoryLot>) =>
    request<InventoryLot>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteInventory: (id: string) =>
    request<void>(`/inventory/${id}`, { method: 'DELETE' }),

  // Locations
  listLocations: () => request<Location[]>('/locations'),
  createLocation: (data: Partial<Location>) =>
    request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLocation: (id: string, data: Partial<Location>) =>
    request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLocation: (id: string) =>
    request<void>(`/locations/${id}`, { method: 'DELETE' }),

  // Stock Moves
  listStockMoves: (lotId: string) =>
    request<StockMove[]>(`/stock-moves?lot_id=${lotId}`),
  createStockMove: (data: {
    lotId: string;
    delta: number;
    reason: string;
    note?: string;
  }) =>
    request<StockMove>('/stock-moves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Search
  search: (q: string) =>
    request<CatalogItem[]>(`/search?q=${encodeURIComponent(q)}`),

  // AI Identification
  identify: async (
    images: File[],
    provider?: string,
    voiceNote?: Blob
  ): Promise<IdentificationResult> => {
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    if (provider) formData.append('provider', provider);
    if (voiceNote) formData.append('voiceNote', voiceNote, 'voice.webm');
    const res = await fetch(`${API_BASE}/identify`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok)
      throw new Error(
        (await res.json()).message || 'Identification failed'
      );
    return res.json();
  },

  // STT
  transcribe: async (audio: Blob): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('audio', audio, 'audio.webm');
    const res = await fetch(`${API_BASE}/stt`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Transcription failed');
    return res.json();
  },

  // Export
  exportJson: () => request<unknown>('/export/json'),
  exportCsv: async (): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/export/csv`);
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  // Migration
  migrate: (components: unknown[]) =>
    request<{ imported: number }>('/migrate', {
      method: 'POST',
      body: JSON.stringify({ components }),
    }),
};
