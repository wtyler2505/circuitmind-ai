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
import { QuestProvider } from './contexts/QuestContext';
import { HealthProvider } from './contexts/HealthContext';
import { MacroProvider } from './contexts/MacroContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdvancedInventoryProvider } from './contexts/AdvancedInventoryContext';
import { SyncProvider } from './contexts/SyncContext';
import { ToastProvider } from './hooks/useToast';
import { INITIAL_INVENTORY } from './data/initialInventory';
import { diagnosticsHub } from './services/error/diagnosticsHub';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    diagnosticsHub.init();
  }, []);

  return (
    <LayoutProvider>
      <AssistantStateProvider>
        <HealthProvider>
          <AuthProvider>
            <UserProvider>
              <ToastProvider>
                <NotificationProvider>
                  <DashboardProvider>
                    <MacroProvider>
                      <InventoryProvider initialData={INITIAL_INVENTORY}>
                        <AdvancedInventoryProvider>
                          <SyncProvider>
                            <ConversationProvider>
                              <DiagramProvider>
                                <SelectionProvider>
                                  <TelemetryProvider>
                                    <HUDProvider>
                                      <SimulationProvider>
                                        <VoiceAssistantProvider>
                                          <TutorialProvider>
                                            <QuestProvider>
                                              <MainLayout />
                                            </QuestProvider>
                                          </TutorialProvider>
                                        </VoiceAssistantProvider>
                                      </SimulationProvider>
                                    </HUDProvider>
                                  </TelemetryProvider>
                                </SelectionProvider>
                              </DiagramProvider>
                            </ConversationProvider>
                          </SyncProvider>
                        </AdvancedInventoryProvider>
                      </InventoryProvider>
                    </MacroProvider>
                  </DashboardProvider>
                </NotificationProvider>
              </ToastProvider>
            </UserProvider>
          </AuthProvider>
        </HealthProvider>
      </AssistantStateProvider>
    </LayoutProvider>
  );
}