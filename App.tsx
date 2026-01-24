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
import { HealthProvider } from './contexts/HealthContext';
import { MacroProvider } from './contexts/MacroContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { INITIAL_INVENTORY } from './data/initialInventory';

export default function App() {
  return (
    <LayoutProvider>
      <AssistantStateProvider>
        <HealthProvider>
          <AuthProvider>
            <NotificationProvider>
              <DashboardProvider>
                <MacroProvider>
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
                </MacroProvider>
              </DashboardProvider>
            </NotificationProvider>
          </AuthProvider>
        </HealthProvider>
      </AssistantStateProvider>
    </LayoutProvider>
  );
}
