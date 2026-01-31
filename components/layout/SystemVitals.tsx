import React from 'react';
import { useHealth } from '../../contexts/HealthContext';

export const SystemVitals: React.FC = () => {
  const { metrics } = useHealth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-neon-green';
      case 'warning': return 'text-neon-amber';
      case 'critical': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-cyber-black/40 border border-white/5 cut-corner-sm group relative panel-surface shadow-inner">
      {/* FPS */}
      <div className="flex flex-col items-start min-w-[40px]">
        <span className="text-[7px] text-slate-500 uppercase font-bold tracking-[0.25em] leading-none mb-0.5">Performance</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-[10px] font-mono font-bold leading-none transition-colors duration-500 ${getStatusColor(metrics.status)}`}>
            {metrics.fps}
          </span>
          <span className="text-[7px] text-slate-600 font-mono">FPS</span>
        </div>
      </div>

      {/* Memory */}
      <div className="flex flex-col items-start min-w-[40px]">
        <span className="text-[7px] text-slate-500 uppercase font-bold tracking-[0.25em] leading-none mb-0.5">Heap</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-mono font-bold leading-none text-slate-300">
            {metrics.memoryUsed || '---'}
          </span>
          <span className="text-[7px] text-slate-600 font-mono">MB</span>
        </div>
      </div>

      {/* Latency */}
      <div className="flex flex-col items-start min-w-[40px]">
        <span className="text-[7px] text-slate-500 uppercase font-bold tracking-[0.25em] leading-none mb-0.5">AI Link</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-mono font-bold leading-none text-neon-cyan shadow-glow">
            {metrics.aiLatency || '---'}
          </span>
          <span className="text-[7px] text-slate-600 font-mono">MS</span>
        </div>
      </div>

      {/* Detail Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-cyber-card panel-surface border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 panel-frame translate-y-1 group-hover:translate-y-0">
        <h4 className="text-[9px] font-bold text-white uppercase tracking-[0.2em] mb-2 border-b border-white/10 pb-1.5 panel-title">System Diagnostics</h4>
        <div className="space-y-1.5 text-[9px] font-mono">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">STATUS:</span>
            <span className={`uppercase font-bold ${getStatusColor(metrics.status)}`}>{metrics.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">MEMORY_LIM:</span>
            <span className="text-slate-300">{metrics.memoryLimit} MB</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>UPTIME:</span>
            <span className="text-slate-400">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
