import React, { ReactNode } from 'react';
import { useLayout } from '../../contexts/LayoutContext';

interface AppLayoutProps {
  inventory: ReactNode;
  assistant: ReactNode;
  header: ReactNode;
  statusRail: ReactNode;
  children: ReactNode; // Main Canvas
  modals: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  inventory, 
  assistant, 
  header, 
  statusRail, 
  children,
  modals 
}) => {
  const { 
    isInventoryOpen, inventoryPinned, inventoryWidth,
    isAssistantOpen, assistantPinned, assistantWidth
  } = useLayout();

  const dockedInventoryWidth = isInventoryOpen && inventoryPinned ? inventoryWidth : 0;
  const dockedAssistantWidth = isAssistantOpen && assistantPinned ? assistantWidth : 0;

  return (
    <div className="flex h-screen w-screen bg-cyber-dark text-slate-200 overflow-hidden font-sans">
      {/* Left Sidebar Slot */}
      {inventory}

      {/* Main Area */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 ml-0 mr-0 md:ml-[var(--inventory-width)] md:mr-[var(--assistant-width)]"
        style={
          {
            '--inventory-width': `${dockedInventoryWidth}px`,
            '--assistant-width': `${dockedAssistantWidth}px`,
          } as React.CSSProperties
        }
      >
        {header}
        
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-cyber-black canvas-grid border-y border-white/5">
          {children}
        </div>

        {statusRail}
      </div>

      {/* Right Sidebar Slot */}
      {assistant}

      {/* Modals Layer */}
      {modals}
    </div>
  );
};
