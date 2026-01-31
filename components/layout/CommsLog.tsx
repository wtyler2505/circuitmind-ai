import React, { useState } from 'react';
import { useNotify } from '../../contexts/NotificationContext';

export const CommsLog: React.FC = () => {
  const { history, clearAll } = useNotify();
  const [filter, setFilter] = useState<'all' | 'warning' | 'critical'>('all');

  return (
    <div className="flex flex-col h-full bg-[#020203] border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-cyan">COMMS</span>_LOG
        </h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">System Traffic</p>
          <button 
            onClick={clearAll}
            className="text-[8px] font-bold text-slate-600 hover:text-white uppercase tracking-widest"
          >
            Clear_Session
          </button>
        </div>
      </div>

      <div className="flex bg-slate-900 border-b border-white/5">
        {(['all', 'warning', 'critical'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white/5 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 opacity-20">
            <div className="loading-tech scale-75 mb-4 mx-auto grayscale"></div>
            <p className="text-[9px] uppercase tracking-widest">No Incoming Traffic</p>
          </div>
        ) : (
          history
            .filter(n => filter === 'all' || n.severity === filter)
            .map((n) => (
              <div key={n.id} className="space-y-1 border-b border-white/5 pb-3 last:border-0">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] font-bold uppercase ${
                    n.severity === 'critical' ? 'text-red-500' : n.severity === 'warning' ? 'text-neon-amber' : 'text-neon-cyan'
                  }`}>
                    {n.severity}
                  </span>
                  <span className="text-[8px] font-mono text-slate-600">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-[10px] font-bold text-slate-200">{n.title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">{n.message}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
