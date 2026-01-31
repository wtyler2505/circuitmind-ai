import React, { useState, useEffect } from 'react';
import { auditService, AuditLog, LogLevel } from '../../services/logging/auditService';

export const SystemLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  useEffect(() => {
    setLogs(auditService.getLogs());
    // In a real app we'd subscribe to new logs
  }, []);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-neon-amber';
      case 'info': return 'text-neon-cyan';
      default: return 'text-slate-500';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuitmind-audit-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-frame border-l border-white/5">
      <div className="px-3 py-4 border-b border-white/5 bg-cyber-black panel-header shrink-0">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-cyan">BLACK_BOX</span>_AUDIT
        </h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono">System Telemetry</p>
          <button 
            onClick={handleDownload}
            className="text-[8px] font-bold text-neon-cyan hover:text-white uppercase tracking-widest flex items-center gap-1.5 group transition-colors"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download_Bundle
          </button>
        </div>
      </div>

      <div className="flex bg-cyber-black panel-rail border-b border-white/5 shrink-0 px-1">
        {(['all', 'info', 'warn', 'error'] as const).map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-all border-b-2 ${
              filter === l 
                ? 'bg-neon-cyan/5 border-neon-cyan text-white shadow-[0_0_8px_rgba(0,243,255,0.1)]' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-black/40 font-mono text-[9px] space-y-0.5 backdrop-blur-sm">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 italic p-12 text-center">
            <div className="w-8 h-8 border border-white/5 bg-white/5 mb-3 flex items-center justify-center cut-corner-sm">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="uppercase tracking-[0.3em] font-bold">No Data Captured</p>
          </div>
        ) : (
          logs
            .filter(l => filter === 'all' || l.level === filter)
            .map((l) => (
              <div key={l.id} className="flex gap-3 hover:bg-white/5 px-2 py-1 group border-l-2 border-transparent hover:border-white/10 transition-all">
                <span className="text-slate-600 shrink-0 font-bold opacity-60">[{new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                <span className={`font-bold shrink-0 w-10 tracking-tighter ${getLevelColor(l.level)}`}>{l.level.toUpperCase()}</span>
                <span className="text-slate-500 shrink-0 w-24 truncate opacity-80">[{l.source}]</span>
                <span className="text-slate-300 flex-1 leading-normal group-hover:text-white transition-colors">{l.message}</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
