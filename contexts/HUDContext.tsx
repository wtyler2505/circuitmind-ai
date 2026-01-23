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
  addFragment: (fragment: Omit<HUDFragment, 'id'>) => string;
  removeFragment: (id: string) => void;
  clearHUD: () => void;
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

const HUDContext = createContext<HUDContextType | undefined>(undefined);

export const HUDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fragments, setFragments] = useState<HUDFragment[]>([]);
  const [isVisible, setVisible] = useState(true);

  const addFragment = useCallback((fragment: Omit<HUDFragment, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newFragment = { ...fragment, id };
    setFragments((prev) => [...prev, newFragment]);
    return id;
  }, []);

  const removeFragment = useCallback((id: string) => {
    setFragments((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearHUD = useCallback(() => {
    setFragments([]);
  }, []);

  return (
    <HUDContext.Provider value={{
      fragments,
      addFragment,
      removeFragment,
      clearHUD,
      isVisible,
      setVisible
    }}>
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
