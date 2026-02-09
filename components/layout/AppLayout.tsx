import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    activeMode,
    isInventoryOpen, inventoryPinned, inventoryWidth,
    isAssistantOpen, assistantPinned, assistantWidth,
    isFocusMode
  } = useLayout();

  const dockedInventoryWidth = isInventoryOpen && inventoryPinned && !isFocusMode ? inventoryWidth : 0;
  const dockedAssistantWidth = isAssistantOpen && assistantPinned && !isFocusMode ? assistantWidth : 0;

  return (
    <div className="flex h-screen w-screen bg-cyber-dark text-slate-200 overflow-hidden font-sans">
      {/* Left Sidebar Slot */}
      {!isFocusMode && inventory}

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 mr-0 ${!isFocusMode ? 'sm:ml-[var(--inventory-width)] sm:mr-[var(--assistant-width)]' : ''}`}
        style={
          {
            '--inventory-width': `${dockedInventoryWidth}px`,
            '--assistant-width': `${dockedAssistantWidth}px`,
          } as React.CSSProperties
        }
      >
        {!isFocusMode && header}
        
        {/* Canvas Area */}
        <main id="main-content" className={`flex-1 relative overflow-hidden bg-cyber-black canvas-grid ${!isFocusMode ? 'border-y border-white/5' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {!isFocusMode && statusRail}
      </div>

      {/* Right Sidebar Slot */}
      {!isFocusMode && assistant}

      {/* Modals Layer */}
      {modals}
    </div>
  );
};
