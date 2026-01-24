import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const AVAILABLE_WIDGETS = [
  { type: 'vitals', label: 'System Vitals', description: 'Monitor FPS and Memory.' },
  { type: 'terminal', label: 'Hardware Terminal', description: 'Web Serial output logs.' },
  { type: 'bom', label: 'BOM Preview', description: 'Bill of Materials list.' },
  { type: 'timeline', label: 'Project Timeline', description: 'Git commit history.' },
];

export const WidgetLibrary: React.FC = () => {
  const { addWidget } = useDashboard();

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Widget Library</h3>
      <div className="grid grid-cols-1 gap-2">
        {AVAILABLE_WIDGETS.map(w => (
          <button
            key={w.type}
            onClick={() => addWidget(w.type)}
            className="text-left p-3 bg-white/5 border border-white/10 hover:border-neon-cyan/30 hover:bg-white/10 transition-all cut-corner-sm group"
          >
            <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-neon-cyan transition-colors">{w.label}</h4>
            <p className="text-[9px] text-slate-500 mt-1">{w.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
