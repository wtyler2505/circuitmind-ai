import React, { useState, useEffect } from 'react';
import { gitService } from '../../services/gitService';
import { useDiagram } from '../../contexts/DiagramContext';

export const ProjectTimeline: React.FC = () => {
  const [history, setHistory] = useState<unknown[]>([]);
  const { updateDiagram, diagram } = useDiagram();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [diagram]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const logs = await gitService.log();
      setHistory(logs || []);
    } catch (e) {
      console.error('Failed to load history:', e);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (sha: string) => {
    if (confirm(`Revert to commit ${sha.substring(0, 7)}?`)) {
      try {
        await gitService.checkout(sha);
        const diagramJson = await gitService.readFile('diagram.json');
        updateDiagram(JSON.parse(diagramJson));
        alert('Reverted successfully.');
      } catch (_e) {
        alert('Revert failed.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-frame border-l border-white/5">
      <div className="px-3 py-4 border-b border-white/5 bg-cyber-black panel-header shrink-0">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-amber">PROJECT</span>_TIMELINE
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Local Git History
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="loading-tech scale-110"></div>
            <p className="text-[10px] text-neon-amber uppercase tracking-[0.2em] font-bold animate-pulse">
              Syncing History...
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 opacity-20">
            <div className="loading-tech scale-110 mb-4 mx-auto grayscale"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold">No History Recorded</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-2 pl-6 space-y-8 pb-10">
            {history.map((commit) => (
              <div key={commit.oid} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyber-black border-2 border-slate-700 group-hover:border-neon-amber group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,170,0,0.3)]" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                      {new Date(commit.commit.author.timestamp * 1000).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 cut-corner-sm border border-white/5">
                      {commit.oid.substring(0, 7)}
                    </span>
                  </div>
                  
                  <div className="bg-cyber-black/40 panel-surface border border-white/5 p-3 cut-corner-md group-hover:border-neon-amber/20 transition-all">
                    <h3 className="text-[11px] font-bold text-slate-200 group-hover:text-neon-amber transition-colors leading-relaxed tracking-wide">
                      {commit.commit.message}
                    </h3>
                    
                    <div className="flex gap-2 pt-3">
                      <button 
                        onClick={() => handleRevert(commit.oid)}
                        className="px-3 py-1 bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[8px] font-bold uppercase tracking-widest hover:bg-neon-amber hover:text-black transition-all cut-corner-sm shadow-[0_0_10px_rgba(255,170,0,0.1)] hover:shadow-[0_0_15px_rgba(255,170,0,0.2)]"
                      >
                        REVERT
                      </button>
                      <button 
                        className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[8px] font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all cut-corner-sm"
                      >
                        COMPARE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
