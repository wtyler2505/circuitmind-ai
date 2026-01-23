import React from 'react';
import { MainLayout } from './components/MainLayout';
import { InventoryProvider } from './contexts/InventoryContext';
import { DiagramProvider } from './contexts/DiagramContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { VoiceAssistantProvider } from './contexts/VoiceAssistantContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { AssistantStateProvider } from './contexts/AssistantStateContext';
import { HUDProvider } from './contexts/HUDContext';
import { TelemetryProvider } from './contexts/TelemetryContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { INITIAL_INVENTORY } from './data/initialInventory';

export default function App() {
  return (
    <LayoutProvider>
      <AssistantStateProvider>
        <InventoryProvider initialData={INITIAL_INVENTORY}>
          <ConversationProvider>
            <DiagramProvider>
              <TelemetryProvider>
                <HUDProvider>
                  <SimulationProvider>
                    <VoiceAssistantProvider>
                      <TutorialProvider>
                        <MainLayout />
                      </TutorialProvider>
                    </VoiceAssistantProvider>
                  </SimulationProvider>
                </HUDProvider>
              </TelemetryProvider>
            </DiagramProvider>
          </ConversationProvider>
        </InventoryProvider>
      </AssistantStateProvider>
    </LayoutProvider>
  );
}
