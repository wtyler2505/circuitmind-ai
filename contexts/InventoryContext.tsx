import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ElectronicComponent } from '../types';
import { storageService } from '../services/storage';

// Auto-generated from electronics_inventory_tier5.json - 63 components
// This is the same initial data as in App.tsx
// In a real app, this might be loaded from a JSON file or API
const INITIAL_INVENTORY: ElectronicComponent[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    type: 'microcontroller',
    description:
      '5V Arduino microcontroller with ATmega328P, 14 digital I/O (6 PWM), 6 analog inputs. Most widely supported, beginner-friendly.',
    pins: [
      'SDA', 'SCL', 'MOSI', 'MISO', 'SCK', 'SS', 'TX', 'RX', 'VCC', 'GND',
      'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13',
      'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
    ],
    quantity: 2,
    datasheetUrl: 'https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf',
    imageUrl: 'https://store.arduino.cc/cdn/shop/products/A000066_03.front_934x700.jpg',
  },
  // ... (I will need to copy the full list or import it if I extract it to a data file)
  // For now, I'll extract the data to a separate file to keep this clean.
];

interface InventoryContextType {
  inventory: ElectronicComponent[];
  setInventory: React.Dispatch<React.SetStateAction<ElectronicComponent[]>>;
  addItem: (item: ElectronicComponent) => void;
  updateItem: (item: ElectronicComponent) => void;
  removeItem: (id: string) => void;
  removeMany: (ids: string[]) => void;
  updateMany: (items: ElectronicComponent[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Helper to load initial state
const loadInitialInventory = (): ElectronicComponent[] => {
  try {
    const saved = localStorage.getItem('cm_inventory');
    if (saved) return JSON.parse(saved);
    
    // Fallback to importing the large initial list
    // Since I can't easily import the local variable from App.tsx, 
    // I should probably move that data to a separate file first.
    return []; 
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : 'Failed to load inventory');
    return [];
  }
};

export const InventoryProvider: React.FC<{ children: ReactNode; initialData?: ElectronicComponent[] }> = ({ children, initialData }) => {
  const [inventory, setInventory] = useState<ElectronicComponent[]>(() => {
    const saved = loadInitialInventory();
    return saved.length > 0 ? saved : (initialData || []);
  });

  useEffect(() => {
    storageService.setItem('cm_inventory', JSON.stringify(inventory));
  }, [inventory]);

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

  return (
    <InventoryContext.Provider value={{ 
      inventory, 
      setInventory, 
      addItem, 
      updateItem, 
      removeItem,
      removeMany,
      updateMany
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
