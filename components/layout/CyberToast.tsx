import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from '../../contexts/NotificationContext';

export const CyberToast: React.FC = () => {
  const { notifications, dismissNotification } = useNotify();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'info': return 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.15)]';
      case 'success': return 'border-neon-green text-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.15)]';
      case 'warning': return 'border-neon-amber text-neon-amber bg-neon-amber/5 shadow-[0_0_15px_rgba(255,170,0,0.15)]';
      case 'critical': return 'border-red-500 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      default: return 'border-white/10 text-slate-300 bg-cyber-black/80';
    }
  };

  return (
    <div className="fixed bottom-10 left-6 z-[300] flex flex-col gap-3 pointer-events-none w-80">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ x: -100, opacity: 0, scale: 0.9, rotateX: -20 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ x: -100, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto panel-surface border-l-4 cut-corner-sm p-4 relative overflow-hidden group panel-frame ${getSeverityStyle(n.severity)}`}
          >
            {/* Glitch Overlay (Ephemeral) */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" />
            
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 panel-title">
                {n.severity === 'critical' && <div className="w-1.5 h-1.5 bg-red-500 animate-ping rounded-full shadow-[0_0_8px_#ef4444]" />}
                {n.title}
              </h4>
              <button 
                onClick={() => dismissNotification(n.id)}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-mono opacity-90 group-hover:opacity-100 transition-opacity">
              {n.message}
            </p>

            {n.action && (
              <button
                onClick={n.action.onClick}
                className={`mt-3 w-full py-1.5 text-[9px] font-bold uppercase tracking-widest cut-corner-sm transition-all border ${
                  n.severity === 'critical' 
                    ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-white hover:text-red-600' 
                    : 'bg-white/5 text-inherit border-white/10 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                {n.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
