import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { InventoryProvider } from '../contexts/InventoryContext';
import { DiagramProvider } from '../contexts/DiagramContext';
import { LayoutProvider } from '../contexts/LayoutContext';
import { VoiceAssistantProvider } from '../contexts/VoiceAssistantContext';
import { ConversationProvider } from '../contexts/ConversationContext';
import { AssistantStateProvider } from '../contexts/AssistantStateContext';
import { ToastProvider } from '../hooks/useToast';
import { ElectronicComponent } from '../types';

interface CustomRenderOptions extends RenderOptions {
  inventory?: ElectronicComponent[];
}

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <ToastProvider>
        <LayoutProvider>
          <AssistantStateProvider>
            <InventoryProvider initialData={options?.inventory}>
              <DiagramProvider>
                <VoiceAssistantProvider>
                  <ConversationProvider>
                    {children}
                  </ConversationProvider>
                </VoiceAssistantProvider>
              </DiagramProvider>
            </InventoryProvider>
          </AssistantStateProvider>
        </LayoutProvider>
      </ToastProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };