import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { WiringDiagram } from '../types';
import { storageService } from '../services/storage';
import { migrateLegacyDiagram } from '../services/componentValidator';
import { useInventory } from './InventoryContext';
import { CommandHistoryManager, createSnapshotCommand } from '../services/commandHistory';

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
  const { inventory } = useInventory();
  const migrationRan = useRef(false);

  // Command history manager — single mutable instance across the provider's
  // lifetime. We use useRef so the object identity is stable and never
  // triggers re-renders on its own.
  const commandHistoryRef = useRef(new CommandHistoryManager(50));

  // The "present" diagram is the single piece of React state we track.
  // The undo/redo stacks live inside the CommandHistoryManager (outside of
  // React state) and are projected into the HistoryState shape for backward
  // compatibility whenever we need to expose `history` on the context.
  const [present, setPresent] = useState<WiringDiagram | null>(() => {
    let savedPresent = null;
    try {
      const saved = localStorage.getItem('cm_autosave');
      if (saved) savedPresent = JSON.parse(saved);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Failed to load diagram');
    }
    return savedPresent;
  });

  // We need a second state counter to force re-renders when canUndo/canRedo
  // change (since those live outside React state).  Bumping this after any
  // command mutation is the cheapest way to keep the context value fresh.
  const [, setHistoryVersion] = useState(0);
  const bumpVersion = useCallback(() => setHistoryVersion((v) => v + 1), []);

  // Run Migration on mount (once inventory is loaded)
  useEffect(() => {
    if (migrationRan.current || inventory.length === 0 || !present) return;

    const { diagram: migrated, repairedCount } = migrateLegacyDiagram(present, inventory);

    if (repairedCount > 0) {
      setPresent(migrated);
    }

    migrationRan.current = true;
  }, [inventory, present]);

  // Auto-save Diagram
  useEffect(() => {
    if (present) {
      storageService.setItem('cm_autosave', JSON.stringify(present));
    }
  }, [present]);

  const updateDiagram = useCallback((newDiagram: DiagramUpdater) => {
    setPresent((curr) => {
      const resolvedDiagram = typeof newDiagram === 'function'
        ? newDiagram(curr)
        : newDiagram;

      // No-op guard — identical reference means nothing changed.
      if (curr === resolvedDiagram) return curr;

      // Record a command that captures the before/after snapshots.
      if (curr !== null || resolvedDiagram !== null) {
        const cmd = createSnapshotCommand(
          'updateDiagram',
          'Update diagram',
          curr,
          resolvedDiagram,
        );
        commandHistoryRef.current.execute(cmd);
      }

      return resolvedDiagram;
    });
    bumpVersion();
  }, [bumpVersion]);

  const undo = useCallback(() => {
    const ch = commandHistoryRef.current;
    if (!ch.canUndo) return;
    const result = ch.undo();
    // result may be null (the diagram state before the first command).
    setPresent(result);
    bumpVersion();
  }, [bumpVersion]);

  const redo = useCallback(() => {
    const ch = commandHistoryRef.current;
    if (!ch.canRedo) return;
    const result = ch.redo();
    if (result !== null) {
      setPresent(result);
    }
    bumpVersion();
  }, [bumpVersion]);

  const saveToQuickSlot = useCallback(() => {
    if (!present) return;
    const data = {
      diagram: present,
      timestamp: Date.now(),
    };
    localStorage.setItem('savedDiagram', JSON.stringify(data));
  }, [present]);

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

  // Build the backward-compatible HistoryState projection.  The past/future
  // arrays now contain the *diagram snapshots* that each command would
  // restore, mirroring the old shape so any consumer that destructures
  // `history` still gets something sensible.
  const ch = commandHistoryRef.current;
  const history: HistoryState = {
    past: ch.getHistory().map((cmd) => cmd.undo() as WiringDiagram).filter(Boolean),
    present,
    future: ch.getFuture().map((cmd) => cmd.execute() as WiringDiagram).filter(Boolean),
  };

  return (
    <DiagramContext.Provider value={{
      diagram: present,
      history,
      updateDiagram,
      undo,
      redo,
      canUndo: ch.canUndo,
      canRedo: ch.canRedo,
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
