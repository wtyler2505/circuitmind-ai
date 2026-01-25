import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storageService } from '../services/storage';

export type UIMode = 'design' | 'wiring' | 'debug';

interface LayoutSnapshot {
  isInventoryOpen: boolean;
  isAssistantOpen: boolean;
  inventoryPinned: boolean;
  assistantPinned: boolean;
  inventoryWidth: number;
  assistantWidth: number;
}

interface LayoutContextType {
  // Mode
  activeMode: UIMode;
  setActiveMode: (mode: UIMode) => void;

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
  settingsInitialTab: 'api' | 'profile' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale';
  setSettingsInitialTab: (tab: 'api' | 'profile' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale') => void;

  // Focus Mode
  isFocusMode: boolean;
  setFocusMode: (focus: boolean) => void;

  // Performance
  lowPerformanceMode: boolean;
  setLowPerformanceMode: (enabled: boolean) => void;

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
  // Mode State
  const [activeMode, setActiveModeState] = useState<UIMode>(() => {
    try {
      return (localStorage.getItem('cm_active_mode') as UIMode) || 'design';
    } catch {
      return 'design';
    }
  });

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
  const [settingsInitialTab, setSettingsInitialTab] = useState<'api' | 'profile' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale'>('api');

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Performance State
  const [lowPerformanceMode, setLowPerformanceMode] = useState(() => {
    try {
      return localStorage.getItem('cm_low_performance_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Snapshot Logic
  const setActiveMode = useCallback((mode: UIMode) => {
    // 1. Snapshot current layout
    const snapshot: LayoutSnapshot = {
      isInventoryOpen,
      isAssistantOpen,
      inventoryPinned,
      assistantPinned,
      inventoryWidth,
      assistantWidth
    };
    storageService.setItem(`cm_layout_snapshot_${activeMode}`, JSON.stringify(snapshot));

    // 2. Change mode
    setActiveModeState(mode);
    storageService.setItem('cm_active_mode', mode);

    // 3. Load next snapshot or apply defaults
    const saved = localStorage.getItem(`cm_layout_snapshot_${mode}`);
    if (saved) {
      try {
        const next: LayoutSnapshot = JSON.parse(saved);
        setIsInventoryOpen(next.isInventoryOpen);
        setIsAssistantOpen(next.isAssistantOpen);
        setInventoryPinned(next.inventoryPinned);
        setAssistantPinned(next.assistantPinned);
        setInventoryWidth(next.inventoryWidth);
        setAssistantWidth(next.assistantWidth);
      } catch (e) {
        console.error('Failed to parse layout snapshot', e);
      }
    } else {
      // Default configurations for new modes (Auto-transitions)
      if (mode === 'design') {
        setIsInventoryOpen(true);
        setIsAssistantOpen(false);
        setInventoryPinned(true);
      } else if (mode === 'wiring') {
        setIsInventoryOpen(false);
        setIsAssistantOpen(true);
        setAssistantPinned(true);
      } else if (mode === 'debug') {
        setIsInventoryOpen(false);
        setIsAssistantOpen(true);
        setAssistantPinned(true);
      }
    }
  }, [activeMode, isInventoryOpen, isAssistantOpen, inventoryPinned, assistantPinned, inventoryWidth, assistantWidth]);

  // Persistence Effects
  useEffect(() => {
    // Update body class for mode-specific styling
    document.body.classList.remove('mode-design', 'mode-wiring', 'mode-debug');
    document.body.classList.add(`mode-${activeMode}`);
  }, [activeMode]);

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

  useEffect(() => {
    storageService.setItem('cm_low_performance_mode', String(lowPerformanceMode));
    if (lowPerformanceMode) {
      document.body.classList.add('low-performance');
    } else {
      document.body.classList.remove('low-performance');
    }
  }, [lowPerformanceMode]);

  return (
    <LayoutContext.Provider value={{
      activeMode, setActiveMode,
      isInventoryOpen, setInventoryOpen: setIsInventoryOpen,
      inventoryPinned, setInventoryPinned,
      inventoryWidth, setInventoryWidth,
      isAssistantOpen, setAssistantOpen: setIsAssistantOpen,
      assistantPinned, setAssistantPinned,
      assistantWidth, setAssistantWidth,
      isSettingsOpen, setSettingsOpen: setIsSettingsOpen,
      settingsInitialTab, setSettingsInitialTab,
      isFocusMode, setFocusMode: setIsFocusMode,
      lowPerformanceMode, setLowPerformanceMode,
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
