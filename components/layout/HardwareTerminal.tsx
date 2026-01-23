import React, { useRef, useEffect, useState } from 'react';
import { useTelemetry } from '../../contexts/TelemetryContext';

/**
 * HardwareTerminal component displays raw serial logs from physical microcontrollers.
 * It provides connection controls and log management features.
 */
export const HardwareTerminal: React.FC = () => {
  const { isConnected, connect, disconnect, rawLogs, clearLogs } = useTelemetry();
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Handle auto-scroll to the bottom of the log
  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [rawLogs, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-[#020305] border border-slate-800/50 cut-corner-md overflow-hidden panel-frame">
      {/* Header Section */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-neon-green animate-pulse shadow-[0_0_8px_#00ff9d]' : 'bg-slate-700'}`} />
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Serial_Output</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearLogs}
            className="text-[9px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
            title="Clear all logs"
          >
            Clear
          </button>
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[9px] uppercase tracking-widest transition-colors ${autoScroll ? 'text-neon-cyan font-bold' : 'text-slate-600'}`}
            title="Toggle automatic scrolling"
          >
            {autoScroll ? 'Lock_Scroll' : 'Unbound'}
          </button>
        </div>
      </div>

      {/* Logs Viewport */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black/20">
        {rawLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2 opacity-50">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="italic tracking-widest uppercase text-[9px]">Awaiting Uplink...</span>
          </div>
        ) : (
          rawLogs.map((log, i) => (
            <div key={i} className="text-slate-400 border-l border-white/5 pl-2 mb-1 group hover:bg-white/5 transition-colors">
              <span className="text-slate-600 mr-2 opacity-50 group-hover:opacity-100">{log.substring(0, 10)}</span>
              <span className="text-slate-300">{log.substring(11)}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Control Footer */}
      <div className="p-3 border-t border-white/5 bg-slate-950/50 flex justify-center shrink-0">
        {!isConnected ? (
          <button
            onClick={() => connect()}
            className="w-full py-2 bg-neon-cyan/5 border border-neon-cyan/30 text-neon-cyan text-[10px] font-bold uppercase tracking-[0.25em] cut-corner-sm hover:bg-neon-cyan/15 hover:border-neon-cyan/60 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
          >
            Establish Physical Link
          </button>
        ) : (
          <button
            onClick={() => disconnect()}
            className="w-full py-2 bg-red-500/5 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-[0.25em] cut-corner-sm hover:bg-red-500/15 hover:border-red-500/60 transition-all"
          >
            Sever Connection
          </button>
        )}
      </div>
    </div>
  );
};
