import React from 'react';
import { WiringDiagram } from '../../types';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ConflictResolverProps {
  local: WiringDiagram;
  remote: WiringDiagram;
  onResolve: (resolved: WiringDiagram) => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({ local, remote, onResolve }) => {
  const trapRef = useFocusTrap<HTMLDivElement>({});
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6" role="presentation">
      <div ref={trapRef} role="alertdialog" aria-modal="true" aria-labelledby="conflict-title" className="bg-slate-950 border border-red-500/30 w-full max-w-4xl cut-corner-md flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="p-4 border-b border-white/5 bg-red-950/20">
          <h2 id="conflict-title" className="text-sm font-bold text-red-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Git_Merge_Conflict detected
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6 p-6">
          {/* Local Version */}
          <div className="space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Local Version (Yours)</h3>
              <span className="text-[9px] text-slate-500 font-mono">LATEST SNAPSHOT</span>
            </div>
            <div className="flex-1 bg-black/40 border border-white/5 p-4 rounded-sm font-mono text-[10px] text-slate-400 overflow-auto">
              <p>Title: {local.title}</p>
              <p>Components: {local.components.length}</p>
              <p>Connections: {local.connections.length}</p>
              <div className="mt-4 pt-4 border-t border-white/5 italic">
                {local.explanation}
              </div>
            </div>
            <button 
              onClick={() => onResolve(local)}
              className="w-full py-3 bg-neon-cyan text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all"
            >
              KEEP LOCAL VERSION
            </button>
          </div>

          {/* Remote Version */}
          <div className="space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-neon-amber uppercase tracking-widest">Remote Version (Peer)</h3>
              <span className="text-[9px] text-slate-500 font-mono">INCOMING CHANGES</span>
            </div>
            <div className="flex-1 bg-black/40 border border-white/5 p-4 rounded-sm font-mono text-[10px] text-slate-400 overflow-auto">
              <p>Title: {remote.title}</p>
              <p>Components: {remote.components.length}</p>
              <p>Connections: {remote.connections.length}</p>
              <div className="mt-4 pt-4 border-t border-white/5 italic">
                {remote.explanation}
              </div>
            </div>
            <button 
              onClick={() => onResolve(remote)}
              className="w-full py-3 bg-neon-amber text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all"
            >
              ACCEPT REMOTE VERSION
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-center">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest italic">
            Note: Selecting a version will overwrite the other. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};
