import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export type AssistantTabType = 'chat' | 'bootcamp' | 'history' | 'diagnostic' | 'analytics' | 'audit' | 'logs';

interface TabConfig {
  id: AssistantTabType;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { 
    id: 'chat', 
    label: 'ASSISTANT', 
    color: 'var(--color-neon-cyan)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  { 
    id: 'bootcamp', 
    label: 'BOOTCAMP', 
    color: 'var(--color-neon-purple)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
      </svg>
    )
  },
  { 
    id: 'history', 
    label: 'HISTORY', 
    color: 'var(--color-neon-amber)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    id: 'diagnostic', 
    label: 'DIAGNOSTIC', 
    color: '#ef4444',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    id: 'analytics', 
    label: 'ANALYTICS', 
    color: 'var(--color-neon-cyan)',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    id: 'audit', 
    label: 'AUDIT', 
    color: '#94a3b8',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  { 
    id: 'logs', 
    label: 'LOGS', 
    color: '#64748b',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
];

interface AssistantTabsProps {
  activeTab: AssistantTabType;
  onTabChange: (tab: AssistantTabType) => void;
}

export const AssistantTabs: React.FC<AssistantTabsProps> = ({ activeTab, onTabChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tabWidths, setTabWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('cm_assistant_tab_widths');
    // Default width for icon tabs is smaller
    return saved ? JSON.parse(saved) : {};
  });

  const [isResizing, setIsResizing] = useState<string | null>(null);

  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(id);
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    setTabWidths(prev => {
      const currentWidth = prev[isResizing] || 54;
      const newWidth = Math.max(40, Math.min(120, currentWidth + e.movementX));
      return { ...prev, [isResizing]: newWidth };
    });
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      localStorage.setItem('cm_assistant_tab_widths', JSON.stringify(tabWidths));
      setIsResizing(null);
    }
  }, [isResizing, tabWidths]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  return (
    <div className="flex bg-cyber-black panel-rail border-b border-white/5 shrink-0 select-none group/tabbar relative pr-10">
      <div 
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto custom-scrollbar scrollbar-hide no-scrollbar"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const width = tabWidths[tab.id] || 54; // Default narrower for icons

          return (
            <div 
              key={tab.id}
              className="relative flex shrink-0 border-r border-white/5 last:border-r-0"
              style={{ width: `${width}px` }}
            >
              <button
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 h-11 flex items-center justify-center transition-all relative z-10 ${
                  isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                aria-selected={isActive}
                role="tab"
                title={tab.label}
              >
                <div 
                  className="transition-transform duration-200 group-hover:scale-110"
                  style={{ color: isActive ? tab.color : undefined }}
                >
                  {tab.icon}
                </div>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 z-20"
                    style={{ backgroundColor: tab.color, boxShadow: `0 0 10px ${tab.color}` }}
                  />
                )}
              </button>

              {/* Resize Handle */}
              <div
                onMouseDown={(e) => handleResizeStart(e, tab.id)}
                className={`absolute right-[-4px] top-0 bottom-0 w-2 cursor-col-resize hover:bg-neon-cyan/20 transition-colors z-30 ${isResizing === tab.id ? 'bg-neon-cyan shadow-[0_0_8px_#00f3ff]' : ''}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};


