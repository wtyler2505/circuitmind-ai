import { useState, useEffect } from 'react';
import type { ElectronicComponent, WiringDiagram, AIContext, ActionDelta } from '../types';
import { buildAIContext } from '../services/aiContextBuilder';
import { predictionEngine } from '../services/predictionEngine';
import type { DiagramCanvasRef } from '../components/DiagramCanvas';

interface UseAIContextBuilderParams {
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
  canvasSelectionId: string | null;
  selectedComponent: ElectronicComponent | null;
  isSettingsOpen: boolean;
  recentHistory: ActionDelta[];
  activeSelectionPath: string | undefined;
  canvasRef: React.RefObject<DiagramCanvasRef | null>;
  isLoading: boolean;
  aiActions: {
    stageActions: (actions: unknown[]) => void;
  };
}

export function useAIContextBuilder({
  diagram,
  inventory,
  canvasSelectionId,
  selectedComponent,
  isSettingsOpen,
  recentHistory,
  activeSelectionPath,
  canvasRef,
  isLoading,
  aiActions,
}: UseAIContextBuilderParams): AIContext | null {
  const [aiContext, setAIContext] = useState<AIContext | null>(null);

  // Build AI context from current state
  useEffect(() => {
    const updateContext = async () => {
      const zoom = canvasRef.current?.getZoom() || 1;
      const pan = canvasRef.current?.getPan() || { x: 0, y: 0 };

      const context = await buildAIContext({
        diagram,
        inventory,
        selectedComponentId: canvasSelectionId,
        activeView: selectedComponent
          ? 'component-editor'
          : isSettingsOpen
            ? 'settings'
            : 'canvas',
        viewport: { zoom, x: pan.x, y: pan.y },
        recentHistory,
        activeSelectionPath,
      });
      setAIContext(context);
    };
    updateContext();
  }, [
    diagram,
    inventory,
    canvasSelectionId,
    selectedComponent,
    isSettingsOpen,
    recentHistory,
    activeSelectionPath,
    canvasRef,
  ]);

  // Proactive Prediction Loop
  useEffect(() => {
    const runPredictions = async () => {
      if (!aiContext || isLoading) return;

      if (aiContext.componentCount > 0) {
        const predictions = await predictionEngine.predict(aiContext);
        aiActions.stageActions(predictions);
      }
    };

    const timer = setTimeout(runPredictions, 1500);
    return () => clearTimeout(timer);
  }, [aiContext, aiActions, isLoading]);

  return aiContext;
}
