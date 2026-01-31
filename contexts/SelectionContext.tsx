import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SelectionContextType {
  selectedComponentId: string | null;
  activeSelectionPath: string | undefined;
  setSelectedComponentId: (id: string | null) => void;
  setActiveSelectionPath: (path: string | undefined) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeSelectionPath, setActiveSelectionPath] = useState<string | undefined>(undefined);

  const clearSelection = useCallback(() => {
    setSelectedComponentId(null);
    setActiveSelectionPath(undefined);
  }, []);

  return (
    <SelectionContext.Provider value={{
      selectedComponentId,
      activeSelectionPath,
      setSelectedComponentId,
      setActiveSelectionPath,
      clearSelection
    }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
