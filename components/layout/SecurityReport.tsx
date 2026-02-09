import React, { useMemo } from 'react';
import { securityAuditor } from '../../services/securityAuditor';
import { useDiagram } from '../../contexts/DiagramContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface SecurityReportProps {
  onClose: () => void;
}

export const SecurityReport: React.FC<SecurityReportProps> = ({ onClose }) => {
  const { diagram } = useDiagram();
  const trapRef = useFocusTrap<HTMLDivElement>({ onClose });
  
  const violations = useMemo(() => {
    return securityAuditor.auditCircuitSafety(diagram);
  }, [diagram]);

  const score = Math.max(0, 100 - violations.length * 20);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6" role="presentation">
      <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="security-report-title" className="bg-slate-950 border border-neon-cyan/30 w-full max-w-2xl cut-corner-md flex flex-col shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900 flex justify-between items-center">
          <h2 id="security-report-title" className="text-sm font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Hardware_Guard_Audit
          </h2>
          <button onClick={onClose} aria-label="Close security report" className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 flex flex-col items-center border-b border-white/5 bg-black/40">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="60" fill="transparent" stroke="#1e293b" strokeWidth="8" />
              <circle 
                cx="64" cy="64" r="60" fill="transparent" 
                stroke={score > 80 ? '#00ff9d' : score > 50 ? '#ffaa00' : '#ef4444'} 
                strokeWidth="8" 
                strokeDasharray="377" 
                strokeDashoffset={377 - (377 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-3xl font-mono font-bold text-white">{score}</div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Safety Integrity Score</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Violations</h3>
          
          {violations.length === 0 ? (
            <div className="py-12 text-center text-neon-green">
              <p className="text-sm font-bold uppercase tracking-widest">System Secure</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">No electrical or code risks identified.</p>
            </div>
          ) : (
            violations.map((v) => (
              <div key={v.id} className="bg-red-950/10 border border-red-500/20 p-4 cut-corner-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] px-1.5 py-0.5 bg-red-500 text-white font-bold uppercase">
                    {v.severity} Severity
                  </span>
                  <span className="text-[9px] font-mono text-red-400 uppercase">{v.type}</span>
                </div>
                <p className="text-[11px] text-slate-200 font-bold">{v.message}</p>
                <div className="p-2 bg-black/40 border-l-2 border-red-500 text-[10px] text-slate-400 italic">
                  REMEDY: {v.remedy}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">CircuitMind AI Safety Protocol v1.0</p>
        </div>
      </div>
    </div>
  );
};
