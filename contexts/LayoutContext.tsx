import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage';

interface LayoutContextType {
  // Inventory
  isInventoryOpen: boolean;
  setInventoryOpen: (open: boolean) => void;
  inventoryPinned: boolean;
  setInventoryPinned: (pinned: boolean) => void;
  inventoryWidth: number;
  setInventoryWidth: (width: number) => void;
  
  // Assistant
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  assistantPinned: boolean;
  setAssistantPinned: (pinned: boolean) => void;
  assistantWidth: number;
  setAssistantWidth: (width: number) => void;
  
  // Settings
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Constants
  inventoryDefaultWidth: number;
  assistantDefaultWidth: number;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const inventoryDefaultWidth = 360;
const assistantDefaultWidth = 380;
const inventoryWidthRange = { min: 280, max: 520 };
const assistantWidthRange = { min: 300, max: 560 };
const clampWidth = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inventory State
  const [isInventoryOpen, setIsInventoryOpen] = useState(() => {
    try {
      return localStorage.getItem('cm_inventory_open_default') === 'true';
    } catch {
      return false;
    }
  });
  const [inventoryPinned, setInventoryPinned] = useState(() => {
    try {
      return localStorage.getItem('cm_inventory_pinned_default') === 'true';
    } catch {
      return false;
    }
  });
  const [inventoryWidth, setInventoryWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_inventory_width');
      const parsed = saved ? Number.parseInt(saved, 10) : inventoryDefaultWidth;
      if (!Number.isFinite(parsed)) return inventoryDefaultWidth;
      return clampWidth(parsed, inventoryWidthRange.min, inventoryWidthRange.max);
    } catch {
      return inventoryDefaultWidth;
    }
  });

  // Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('cm_assistant_open_default');
      return stored ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [assistantPinned, setAssistantPinned] = useState(() => {
    try {
      const stored = localStorage.getItem('cm_assistant_pinned_default');
      return stored ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [assistantWidth, setAssistantWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_assistant_width');
      const parsed = saved ? Number.parseInt(saved, 10) : assistantDefaultWidth;
      if (!Number.isFinite(parsed)) return assistantDefaultWidth;
      return clampWidth(parsed, assistantWidthRange.min, assistantWidthRange.max);
    } catch {
      return assistantDefaultWidth;
    }
  });

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    storageService.setItem('cm_inventory_open_default', String(isInventoryOpen));
  }, [isInventoryOpen]);

  useEffect(() => {
    storageService.setItem('cm_inventory_pinned_default', String(inventoryPinned));
  }, [inventoryPinned]);

  useEffect(() => {
    storageService.setItem('cm_inventory_width', String(inventoryWidth));
  }, [inventoryWidth]);

  useEffect(() => {
    storageService.setItem('cm_assistant_open_default', String(isAssistantOpen));
  }, [isAssistantOpen]);

  useEffect(() => {
    storageService.setItem('cm_assistant_pinned_default', String(assistantPinned));
  }, [assistantPinned]);

  useEffect(() => {
    storageService.setItem('cm_assistant_width', String(assistantWidth));
  }, [assistantWidth]);

  return (
    <LayoutContext.Provider value={{
      isInventoryOpen, setInventoryOpen: setIsInventoryOpen,
      inventoryPinned, setInventoryPinned,
      inventoryWidth, setInventoryWidth,
      isAssistantOpen, setAssistantOpen: setIsAssistantOpen,
      assistantPinned, setAssistantPinned,
      assistantWidth, setAssistantWidth,
      isSettingsOpen, setSettingsOpen: setIsSettingsOpen,
      inventoryDefaultWidth,
      assistantDefaultWidth
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
