import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type FragmentType = 'info' | 'warning' | 'tip';

export interface HUDFragment {
  id: string;
  targetId: string; // Component or Pin ID
  type: FragmentType;
  content: string;
  position: { x: number; y: number };
  priority: number;
}

interface HUDContextType {
  fragments: HUDFragment[];
  addFragment: (fragment: Omit<HUDFragment, 'id'> & { id?: string }) => string;
  removeFragment: (id: string) => void;
  clearHUD: () => void;
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

const HUDContext = createContext<HUDContextType | undefined>(undefined);

export const HUDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fragments, setFragments] = useState<HUDFragment[]>([]);
  const [isVisible, setVisible] = useState(true);

  const addFragment = useCallback((fragment: Omit<HUDFragment, 'id'> & { id?: string }) => {
    const id = fragment.id || Math.random().toString(36).substring(2, 9);
    
    setFragments((prev) => {
      const existingIdx = prev.findIndex(f => f.id === id);
      const newFragment = { ...fragment, id } as HUDFragment;
      
      if (existingIdx !== -1) {
        // Update existing fragment
        const next = [...prev];
        next[existingIdx] = newFragment;
        return next;
      }
      return [...prev, newFragment];
    });

    // Priority-based auto-dismissal (Decay)
    // Priority 1: Persistent (High)
    // Priority 2+: Ephemeral (Low)
    if (fragment.priority >= 2) {
      setTimeout(() => {
        setFragments((prev) => prev.filter((f) => f.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const removeFragment = useCallback((id: string) => {
    setFragments((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearHUD = useCallback(() => {
    setFragments([]);
  }, []);

  const contextValue = React.useMemo(() => ({
    fragments,
    addFragment,
    removeFragment,
    clearHUD,
    isVisible,
    setVisible
  }), [fragments, addFragment, removeFragment, clearHUD, isVisible]);

  return (
    <HUDContext.Provider value={contextValue}>
      {children}
    </HUDContext.Provider>
  );
};

export const useHUD = () => {
  const context = useContext(HUDContext);
  if (context === undefined) {
    throw new Error('useHUD must be used within a HUDProvider');
  }
  return context;
};
