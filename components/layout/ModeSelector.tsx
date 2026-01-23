import React from 'react';
import { useLayout, UIMode } from '../../contexts/LayoutContext';

export const ModeSelector: React.FC = () => {
  const { activeMode, setActiveMode } = useLayout();

  const modes: { id: UIMode; label: string; icon: string; color: string }[] = [
    { id: 'design', label: 'DESIGN', icon: '🎯', color: 'text-neon-green' },
    { id: 'wiring', label: 'WIRING', icon: '⚡', color: 'text-neon-cyan' },
    { id: 'debug', label: 'DEBUG', icon: '🐞', color: 'text-amber-400' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/50 border border-slate-800 cut-corner-sm shadow-inner pointer-events-auto">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setActiveMode(mode.id)}
          className={`
            px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] transition-all duration-200
            flex items-center gap-2 cut-corner-xs
            ${activeMode === mode.id 
              ? `${mode.color} bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]` 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'}
          `}
          title={`${mode.label} MODE`}
        >
          <span className="text-xs">{mode.icon}</span>
          <span className="hidden lg:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};
