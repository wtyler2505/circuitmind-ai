import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WiringDiagram } from '../types';
import { storageService } from '../services/storage';

interface HistoryState {
  past: WiringDiagram[];
  present: WiringDiagram | null;
  future: WiringDiagram[];
}

type DiagramUpdater = WiringDiagram | null | ((current: WiringDiagram | null) => WiringDiagram | null);

interface DiagramContextType {
  diagram: WiringDiagram | null;
  history: HistoryState;
  updateDiagram: (newDiagram: DiagramUpdater) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveToQuickSlot: () => void;
  loadFromQuickSlot: () => void;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const DiagramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryState>(() => {
    let savedPresent = null;
    try {
      const saved = localStorage.getItem('cm_autosave');
      if (saved) savedPresent = JSON.parse(saved);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Failed to load diagram');
    }
    return {
      past: [],
      present: savedPresent,
      future: [],
    };
  });

  // Auto-save Diagram
  useEffect(() => {
    if (history.present) {
      storageService.setItem('cm_autosave', JSON.stringify(history.present));
    }
  }, [history.present]);

  const updateDiagram = useCallback((newDiagram: DiagramUpdater) => {
    setHistory((curr) => {
      const resolvedDiagram = typeof newDiagram === 'function'
        ? newDiagram(curr.present)
        : newDiagram;
      if (curr.present === resolvedDiagram) return curr;
      return {
        past: curr.present ? [...curr.past, curr.present] : curr.past,
        present: resolvedDiagram,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: curr.present ? [curr.present, ...curr.future] : curr.future,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: curr.present ? [...curr.past, curr.present] : curr.past,
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const saveToQuickSlot = useCallback(() => {
    if (!history.present) return;
    const data = {
      diagram: history.present,
      timestamp: Date.now(),
    };
    localStorage.setItem('savedDiagram', JSON.stringify(data));
  }, [history.present]);

  const loadFromQuickSlot = useCallback(() => {
    const saved = localStorage.getItem('savedDiagram');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.diagram) {
          updateDiagram(parsed.diagram);
        }
      } catch (e) {
        console.error('Failed to load', e);
      }
    }
  }, [updateDiagram]);

  return (
    <DiagramContext.Provider value={{
      diagram: history.present,
      history,
      updateDiagram,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      saveToQuickSlot,
      loadFromQuickSlot
    }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (context === undefined) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
};
