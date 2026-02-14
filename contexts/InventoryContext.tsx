import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ElectronicComponent } from '../types';
import { storageService } from '../services/storage';
import { INITIAL_INVENTORY } from '../data/initialInventory';
import { FzpzLoader } from '../services/fzpzLoader';
import { partStorageService } from '../services/partStorageService';

interface InventoryContextType {
  inventory: ElectronicComponent[];
  setInventory: React.Dispatch<React.SetStateAction<ElectronicComponent[]>>;
  addItem: (item: ElectronicComponent) => void;
  updateItem: (item: ElectronicComponent) => void;
  removeItem: (id: string) => void;
  removeMany: (ids: string[]) => void;
  updateMany: (items: ElectronicComponent[]) => void;
  loadPartData: (id: string) => Promise<ElectronicComponent | null>;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode; initialData?: ElectronicComponent[] }> = ({ children, initialData }) => {
  const [inventory, setInventory] = useState<ElectronicComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize inventory
  useEffect(() => {
    if (initialData) {
      setInventory(initialData);
      setIsLoading(false);
      return;
    }
    const init = async () => {
      try {
        const saved = await storageService.getItem('cm_inventory');
        if (saved) {
          setInventory(JSON.parse(saved));
        } else {
          setInventory(INITIAL_INVENTORY);
        }
      } catch (e) {
        console.error('Failed to load inventory', e);
        setInventory(INITIAL_INVENTORY);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storageService.setItem('cm_inventory', JSON.stringify(inventory));
    }
  }, [inventory, isLoading]);

  const addItem = (item: ElectronicComponent) => {
    setInventory((prev) => [...prev, item]);
  };

  const updateItem = (item: ElectronicComponent) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const removeItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };
  
  const removeMany = (ids: string[]) => {
    setInventory((prev) => prev.filter((i) => !ids.includes(i.id)));
  };

  const updateMany = (items: ElectronicComponent[]) => {
    const updates = new Map(items.map((i) => [i.id, i]));
    setInventory((prev) => prev.map((i) => updates.get(i.id) || i));
  };

  /**
   * Lazy-loads binary FZPZ data and footprints for a component.
   * Checks cache first, then fetches and parses.
   */
  const loadPartData = useCallback(async (id: string): Promise<ElectronicComponent | null> => {
    const comp = inventory.find(i => i.id === id);
    if (!comp) return null;

    // If already loaded in memory, return it
    if (comp.fzpzSource && comp.footprint) return comp;

    try {
      // Check IndexedDB cache
      const cached = await partStorageService.getPart(id);
      if (cached) {
        const updated = { 
          ...comp, 
          fzpzSource: cached.binary,
          footprint: cached.footprint || comp.footprint,
          pins: cached.pins || comp.pins,
          internalBuses: cached.internalBuses || comp.internalBuses,
          fzpzDiagnostics: cached.diagnostics?.length ? cached.diagnostics : comp.fzpzDiagnostics,
        };
        
        // If any critical parsed metadata is missing, re-parse the binary
        if (!updated.footprint || !updated.pins) {
          const part = await FzpzLoader.load(cached.binary);
          updated.footprint = part.component.footprint;
          updated.pins = part.component.pins;
          updated.internalBuses = part.component.internalBuses;
          updated.fzpzDiagnostics = part.diagnostics.length > 0 ? part.diagnostics : undefined;
        }

        updateItem(updated);
        return updated;
      }

      // Fetch from URL
      if (!comp.fzpzUrl) return comp;

      const response = await fetch(comp.fzpzUrl);
      const buffer = await response.arrayBuffer();
      const part = await FzpzLoader.load(buffer);

      const loadedComp = {
        ...comp,
        fzpzSource: buffer,
        footprint: part.component.footprint,
        pins: part.component.pins,
        internalBuses: part.component.internalBuses,
        fzpzDiagnostics: part.diagnostics.length > 0 ? part.diagnostics : undefined,
        description: part.component.description || comp.description
      };

      // Save to cache
      await partStorageService.savePart({
        id,
        binary: buffer,
        breadboardSvg: part.svgs.breadboard,
        schematicSvg: part.svgs.schematic,
        footprint: part.component.footprint,
        pins: part.component.pins,
        internalBuses: part.component.internalBuses,
        diagnostics: part.diagnostics,
        lastUsed: Date.now()
      });

      updateItem(loadedComp);
      return loadedComp;
    } catch (e) {
      console.error(`Failed to load FZPZ for ${id}`, e);
      return comp;
    }
  }, [inventory]);

  return (
    <InventoryContext.Provider value={{ 
      inventory, 
      setInventory, 
      addItem, 
      updateItem, 
      removeItem,
      removeMany,
      updateMany,
      loadPartData,
      isLoading
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
