import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { InventoryProvider } from '../contexts/InventoryContext';
import { DiagramProvider } from '../contexts/DiagramContext';
import { LayoutProvider } from '../contexts/LayoutContext';
import { VoiceAssistantProvider } from '../contexts/VoiceAssistantContext';
import { ConversationProvider } from '../contexts/ConversationContext';
import { AssistantStateProvider } from '../contexts/AssistantStateContext';
import { HUDProvider } from '../contexts/HUDContext';
import { TelemetryProvider } from '../contexts/TelemetryContext';
import { SimulationProvider } from '../contexts/SimulationContext';
import { TutorialProvider } from '../contexts/TutorialContext';
import { HealthProvider } from '../contexts/HealthContext';
import { MacroProvider } from '../contexts/MacroContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import { SelectionProvider } from '../contexts/SelectionContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ToastProvider } from '../hooks/useToast';
import { ElectronicComponent } from '../types';

interface CustomRenderOptions extends RenderOptions {
  inventory?: ElectronicComponent[];
}

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const AllTheProviders = ({ children }: { children: ReactNode }) => {
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
                        <InventoryProvider initialData={options?.inventory}>
                          <ConversationProvider>
                            <DiagramProvider>
                              <SelectionProvider>
                                <TelemetryProvider>
                                  <HUDProvider>
                                    <SimulationProvider>
                                      <VoiceAssistantProvider>
                                        <TutorialProvider>
                                          {children}
                                        </TutorialProvider>
                                      </VoiceAssistantProvider>
                                    </SimulationProvider>
                                  </HUDProvider>
                                </TelemetryProvider>
                              </SelectionProvider>
                            </DiagramProvider>
                          </ConversationProvider>
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
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };