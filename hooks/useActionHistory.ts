import { useCallback, useRef, useState } from 'react';
import { ActionRecord, WiringDiagram } from '../types';
import { recordAction, deleteAction } from '../services/storage';

export interface ActionResult {
  action: { type: string; payload?: unknown };
  success: boolean;
  timestamp: number;
  error?: string;
  auto: boolean;
}

export function useActionHistory(updateDiagram: (diagram: WiringDiagram) => void) {
  const [actionHistory, setActionHistory] = useState<ActionResult[]>([]);
  const undoStackRef = useRef<ActionRecord[]>([]);

  const addToHistory = useCallback((result: ActionResult) => {
    setActionHistory((prev) => [...prev.slice(-49), result]); // Keep last 50
  }, []);

  const recordUndo = useCallback(async (record: ActionRecord) => {
    await recordAction(record);
    undoStackRef.current.push(record);
  }, []);

  const undo = useCallback(async () => {
    const lastAction = undoStackRef.current.pop();
    if (!lastAction || !lastAction.snapshotBefore) return;

    const snapshot = lastAction.snapshotBefore as WiringDiagram;
    updateDiagram(snapshot);
    await deleteAction(lastAction.id);
  }, [updateDiagram]);

  const canUndo = undoStackRef.current.length > 0;

  return {
    actionHistory,
    addToHistory,
    recordUndo,
    undo,
    canUndo,
  };
}
