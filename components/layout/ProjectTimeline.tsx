import React, { useState, useEffect } from 'react';
import { gitService } from '../../services/gitService';
import { syncService } from '../../services/syncService';
import { useDiagram } from '../../contexts/DiagramContext';

export const ProjectTimeline: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const { updateDiagram, diagram } = useDiagram();

  useEffect(() => {
    loadHistory();
  }, [diagram]);

  const loadHistory = async () => {
    const logs = await gitService.log();
    setHistory(logs);
  };

  const handleRevert = async (sha: string) => {
    if (confirm(`Revert to commit ${sha.substring(0, 7)}?`)) {
      try {
        await gitService.checkout(sha);
        const diagramJson = await gitService.readFile('diagram.json');
        updateDiagram(JSON.parse(diagramJson));
        alert('Reverted successfully.');
      } catch (e) {
        alert('Revert failed.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020203] border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-amber">PROJECT</span>_TIMELINE
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Local Git History
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {history.length === 0 ? (
          <div className="text-center py-12 opacity-20">
            <div className="loading-tech scale-110 mb-4 mx-auto grayscale"></div>
            <p className="text-[10px] uppercase tracking-widest">No History Recorded</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-2 pl-6 space-y-8 pb-10">
            {history.map((commit) => (
              <div key={commit.oid} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-900 group-hover:border-neon-amber group-hover:scale-125 transition-all" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {new Date(commit.commit.author.timestamp * 1000).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 cut-corner-sm">
                      {commit.oid.substring(0, 7)}
                    </span>
                  </div>
                  
                  <h3 className="text-[11px] font-bold text-slate-200 group-hover:text-neon-amber transition-colors leading-relaxed">
                    {commit.commit.message}
                  </h3>
                  
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => handleRevert(commit.oid)}
                      className="px-2 py-1 bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[8px] font-bold uppercase tracking-widest hover:bg-neon-amber hover:text-black transition-all cut-corner-sm"
                    >
                      REVERT
                    </button>
                    <button 
                      className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[8px] font-bold uppercase tracking-widest hover:text-white transition-all cut-corner-sm"
                    >
                      COMPARE
                    </button>
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
