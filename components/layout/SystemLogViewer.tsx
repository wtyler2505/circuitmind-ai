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
    <div className="flex flex-col h-full bg-[#020203] border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-cyan">BLACK_BOX</span>_AUDIT
        </h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">System Telemetry</p>
          <button 
            onClick={handleDownload}
            className="text-[8px] font-bold text-neon-cyan hover:text-white uppercase tracking-widest flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download_Bundle
          </button>
        </div>
      </div>

      <div className="flex bg-slate-900 border-b border-white/5">
        {(['all', 'info', 'warn', 'error'] as const).map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-all ${
              filter === l ? 'bg-white/5 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-black font-mono text-[9px] space-y-1">
        {logs.length === 0 ? (
          <p className="text-slate-700 italic p-4 text-center">NO DATA CAPTURED</p>
        ) : (
          logs
            .filter(l => filter === 'all' || l.level === filter)
            .map((l) => (
              <div key={l.id} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 group">
                <span className="text-slate-600 shrink-0">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                <span className={`font-bold shrink-0 w-10 ${getLevelColor(l.level)}`}>{l.level.toUpperCase()}</span>
                <span className="text-slate-500 shrink-0 w-24 truncate">[{l.source}]</span>
                <span className="text-slate-300 flex-1">{l.message}</span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
