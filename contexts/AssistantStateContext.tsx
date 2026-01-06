import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AssistantStateContext = createContext<AssistantStateContextType | undefined>(undefined);

export const AssistantStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('chat');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [useDeepThinking, setUseDeepThinking] = useState(false);

  return (
    <AssistantStateContext.Provider value={{
      generationMode, setGenerationMode,
      imageSize, setImageSize,
      aspectRatio, setAspectRatio,
      useDeepThinking, setUseDeepThinking
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
