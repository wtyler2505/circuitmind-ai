import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  inventoryApi,
  CatalogItem,
  Location,
} from '../services/inventoryApiClient';
import type { ElectronicComponent } from '../types';

interface AdvancedInventoryState {
  // Data
  catalogItems: CatalogItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  selectedItem: CatalogItem | null;
  locations: Location[];

  // Status
  backendAvailable: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loadCatalog: (page?: number, pageSize?: number) => Promise<void>;
  searchCatalog: (query: string) => Promise<void>;
  selectItem: (item: CatalogItem | null) => void;
  createItem: (data: Partial<CatalogItem>) => Promise<CatalogItem | null>;
  updateItem: (
    id: string,
    data: Partial<CatalogItem>
  ) => Promise<CatalogItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  loadLocations: () => Promise<void>;

  // Bridge
  toElectronicComponent: (item: CatalogItem) => ElectronicComponent;
}

const AdvancedInventoryContext = createContext<
  AdvancedInventoryState | undefined
>(undefined);

export function catalogItemToElectronicComponent(
  item: CatalogItem
): ElectronicComponent {
  const typeMap: Record<string, ElectronicComponent['type']> = {
    microcontroller: 'microcontroller',
    sensor: 'sensor',
    actuator: 'actuator',
    power: 'power',
  };
  return {
    id: item.id,
    name: item.name,
    type: typeMap[item.type] || 'other',
    description: item.description,
    pins: item.pins,
    quantity: 0,
    datasheetUrl: item.datasheetUrl,
    imageUrl: item.imageUrl,
  };
}

export const AdvancedInventoryProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check backend availability on mount
  useEffect(() => {
    let cancelled = false;
    const checkBackend = async () => {
      try {
        await inventoryApi.health();
        if (!cancelled) {
          setBackendAvailable(true);
        }
      } catch {
        if (!cancelled) {
          setBackendAvailable(false);
          setLoading(false);
        }
      }
    };
    checkBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load initial data when backend becomes available
  useEffect(() => {
    if (!backendAvailable) return;
    let cancelled = false;

    const loadInitial = async () => {
      setLoading(true);
      try {
        const [catalogRes, locs] = await Promise.all([
          inventoryApi.listCatalog({ page: 1, pageSize }),
          inventoryApi.listLocations(),
        ]);
        if (!cancelled) {
          setCatalogItems(catalogRes.data);
          setTotalItems(catalogRes.total);
          setCurrentPage(catalogRes.page);
          setLocations(locs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load data'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [backendAvailable, pageSize]);

  const loadCatalog = useCallback(
    async (page = 1, size?: number) => {
      setLoading(true);
      setError(null);
      try {
        const effectiveSize = size ?? pageSize;
        const res = await inventoryApi.listCatalog({
          page,
          pageSize: effectiveSize,
        });
        setCatalogItems(res.data);
        setTotalItems(res.total);
        setCurrentPage(res.page);
        if (size) setPageSize(size);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load catalog'
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const searchCatalog = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await inventoryApi.search(query);
      setCatalogItems(results);
      setTotalItems(results.length);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Search failed'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const selectItem = useCallback((item: CatalogItem | null) => {
    setSelectedItem(item);
  }, []);

  const createItem = useCallback(
    async (data: Partial<CatalogItem>): Promise<CatalogItem | null> => {
      setError(null);
      try {
        const created = await inventoryApi.createCatalog(data);
        setCatalogItems((prev) => [...prev, created]);
        setTotalItems((prev) => prev + 1);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create item'
        );
        return null;
      }
    },
    []
  );

  const updateItem = useCallback(
    async (
      id: string,
      data: Partial<CatalogItem>
    ): Promise<CatalogItem | null> => {
      setError(null);
      try {
        const updated = await inventoryApi.updateCatalog(id, data);
        setCatalogItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        if (selectedItem?.id === id) setSelectedItem(updated);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update item'
        );
        return null;
      }
    },
    [selectedItem]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      try {
        await inventoryApi.deleteCatalog(id);
        setCatalogItems((prev) => prev.filter((item) => item.id !== id));
        setTotalItems((prev) => prev - 1);
        if (selectedItem?.id === id) setSelectedItem(null);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete item'
        );
        return false;
      }
    },
    [selectedItem]
  );

  const loadLocations = useCallback(async () => {
    setError(null);
    try {
      const locs = await inventoryApi.listLocations();
      setLocations(locs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load locations'
      );
    }
  }, []);

  return (
    <AdvancedInventoryContext.Provider
      value={{
        catalogItems,
        totalItems,
        currentPage,
        pageSize,
        selectedItem,
        locations,
        backendAvailable,
        loading,
        error,
        loadCatalog,
        searchCatalog,
        selectItem,
        createItem,
        updateItem,
        deleteItem,
        loadLocations,
        toElectronicComponent: catalogItemToElectronicComponent,
      }}
    >
      {children}
    </AdvancedInventoryContext.Provider>
  );
};

export const useAdvancedInventory = () => {
  const context = useContext(AdvancedInventoryContext);
  if (context === undefined) {
    throw new Error(
      'useAdvancedInventory must be used within an AdvancedInventoryProvider'
    );
  }
  return context;
};
