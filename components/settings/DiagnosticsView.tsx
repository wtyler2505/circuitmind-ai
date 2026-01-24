import React, { useState } from 'react';
import { diagnosticsHub } from '../../services/error/diagnosticsHub';
import { auditService } from '../../services/logging/auditService';

export const DiagnosticsView: React.FC = () => {
  const [report, setReport] = useState<string | null>(null);

  const handleGenerateReport = () => {
    const data = diagnosticsHub.generateBugReport();
    setReport(JSON.stringify(data, null, 2));
  };

  const handleCopyReport = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      alert('Report copied to clipboard');
    }
  };

  return (
    <div className="space-y-6 p-4 h-full overflow-y-auto custom-scrollbar">
      <div className="bg-slate-900/80 border border-white/5 p-4 cut-corner-md space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SYSTEM_DIAGNOSTICS
        </h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          Generate a sanitized health report for troubleshooting. No personal data is included.
        </p>
        
        <button 
          onClick={handleGenerateReport}
          className="w-full bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-white/10 text-slate-200 py-3 cut-corner-sm text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          RUN_DIAGNOSTIC_SCAN
        </button>

        {report && (
          <div className="mt-4 space-y-2">
            <div className="bg-black p-3 border border-white/10 rounded-sm font-mono text-[9px] text-slate-400 h-64 overflow-auto custom-scrollbar whitespace-pre-wrap">
              {report}
            </div>
            <button 
              onClick={handleCopyReport}
              className="w-full bg-red-500 text-black py-3 cut-corner-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              COPY_REPORT_TO_CLIPBOARD
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Recent Silent Errors</h4>
        <div className="space-y-2">
          {auditService.getLogs().filter(l => l.level === 'error').slice(-5).map(log => (
            <div key={log.id} className="p-2 bg-red-950/10 border-l-2 border-red-500/50 text-[9px] font-mono text-red-300">
              <div className="flex justify-between opacity-50 mb-1">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span>{log.source}</span>
              </div>
              {log.message}
            </div>
          ))}
          {auditService.getLogs().filter(l => l.level === 'error').length === 0 && (
            <p className="text-[9px] text-slate-600 italic text-center py-4">SYSTEM_HEALTHY</p>
          )}
        </div>
      </div>
    </div>
  );
};
