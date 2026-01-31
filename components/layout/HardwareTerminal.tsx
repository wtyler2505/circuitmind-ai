import React, { useRef, useEffect, useState } from 'react';

/**
 * HardwareTerminal component displays raw serial logs from physical microcontrollers.
 * It provides connection controls and log management features.
 */
export const HardwareTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) return;
      const newLog = `[${new Date().toLocaleTimeString()}] VOLT_CHECK: ${ (Math.random() * 5).toFixed(2) }V @ PIN_A0`;
      setLogs(prev => [...prev.slice(-99), newLog]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-surface border border-white/10 cut-corner-md overflow-hidden panel-frame group/terminal shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-cyber-black panel-header border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isConnected ? 'bg-neon-green animate-pulse shadow-[0_0_8px_#00ff9d]' : 'bg-slate-700'}`} />
          <span className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase panel-title">SERIAL_PORT_01</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLogs([])}
            className="text-[9px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors font-bold"
          >
            Clear
          </button>
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[9px] uppercase tracking-widest transition-all font-bold ${autoScroll ? 'text-neon-cyan shadow-glow' : 'text-slate-600'}`}
          >
            {autoScroll ? 'AUTO_SCROLL' : 'MANUAL'}
          </button>
        </div>
      </div>

      {/* Log View */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black/40 backdrop-blur-sm"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2 opacity-40">
            <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Waiting for input...</span>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="text-slate-400 border-l border-white/10 pl-2 mb-1 group hover:bg-white/5 transition-colors border-transparent hover:border-neon-cyan/30">
              <span className="text-slate-600 mr-2 opacity-50 group-hover:opacity-100 font-bold">[{log.substring(1, 9)}]</span>
              <span className="text-slate-300 group-hover:text-neon-cyan transition-colors">{log.substring(11)}</span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer / Controls */}
      <div className="p-3 border-t border-white/5 bg-cyber-black panel-rail flex justify-center shrink-0">
        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`px-6 py-1.5 cut-corner-sm text-[10px] font-bold uppercase tracking-[0.25em] transition-all border ${
            isConnected 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-neon-cyan text-black border-neon-cyan hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'
          }`}
        >
          {isConnected ? 'DISCONNECT_STATION' : 'ESTABLISH_LINK'}
        </button>
      </div>
    </div>
  );
};
