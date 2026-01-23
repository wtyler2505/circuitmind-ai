import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ActionDelta } from '../types';

type GenerationMode = 'chat' | 'image' | 'video';
type ImageSize = '1K' | '2K' | '4K';

interface AssistantStateContextType {
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  useDeepThinking: boolean;
  setUseDeepThinking: (enabled: boolean) => void;
  
  // History Buffer
  recentHistory: ActionDelta[];
  pushActionDelta: (delta: Omit<ActionDelta, 'timestamp'>) => void;

  // Selection Path Awareness
  activeSelectionPath: string | undefined;
  setActiveSelectionPath: (path: string | undefined) => void;
}

const AssistantStateContext = createContext<AssistantStateContextType | undefined>(undefined);

export const AssistantStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('chat');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [recentHistory, setRecentHistory] = useState<ActionDelta[]>([]);
  const [activeSelectionPath, setActiveSelectionPath] = useState<string | undefined>(undefined);

  const pushActionDelta = useCallback((delta: Omit<ActionDelta, 'timestamp'>) => {
    const newDelta = { ...delta, timestamp: Date.now() };
    setRecentHistory((prev) => {
      const next = [newDelta, ...prev];
      return next.slice(0, 10); // Keep last 10 actions
    });
  }, []);

  return (
    <AssistantStateContext.Provider value={{
      generationMode, setGenerationMode,
      imageSize, setImageSize,
      aspectRatio, setAspectRatio,
      useDeepThinking, setUseDeepThinking,
      recentHistory, pushActionDelta,
      activeSelectionPath, setActiveSelectionPath
    }}>
      {children}
    </AssistantStateContext.Provider>
  );
};

export const useAssistantState = () => {
  const context = useContext(AssistantStateContext);
  if (context === undefined) {
    throw new Error('useAssistantState must be used within an AssistantStateProvider');
  }
  return context;
};
