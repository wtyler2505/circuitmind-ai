import React, { useState } from 'react';
import { TUTORIALS } from '../../data/tutorials';
import { useTutorial } from '../../contexts/TutorialContext';

export const BootcampPanel: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<'all' | 'level-1' | 'level-2' | 'level-3'>('all');
  const { startQuest, activeQuest } = useTutorial();

  // Map TUTORIALS to the structure expected by the template
  const modules = TUTORIALS.map(t => ({
    id: t.id,
    title: t.title,
    description: t.steps[0]?.instructions || 'No description available.',
    level: t.difficulty === 'beginner' ? 'level-1' : t.difficulty === 'intermediate' ? 'level-2' : 'level-3',
    duration: `${t.steps.length} Steps`,
    tags: ['Interactive', t.difficulty.toUpperCase()],
    quest: t
  }));

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-frame border-l border-white/5">
      {/* Header */}
      <div className="px-3 py-4 border-b border-white/5 bg-cyber-black panel-header shrink-0">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] panel-title">
          <div className="w-1.5 h-1.5 bg-neon-purple shadow-[0_0_8px_#bd00ff]" />
          Skill Forge
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Knowledge Acquisition Modules
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-cyber-black panel-rail border-b border-white/5 shrink-0 px-2">
        {(['all', 'level-1', 'level-2', 'level-3'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setActiveLevel(lvl)}
            className={`px-3 py-2 text-[8px] font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeLevel === lvl 
                ? 'border-neon-purple text-white bg-neon-purple/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {lvl.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {modules.filter(m => activeLevel === 'all' || m.level === activeLevel).map((module, i) => (
          <div key={i} className="group relative">
            <div className={`bg-cyber-black/40 panel-surface border p-4 cut-corner-md transition-all panel-frame ${activeQuest?.id === module.id ? 'border-neon-purple/50 bg-neon-purple/5' : 'border-white/5 group-hover:border-neon-purple/30'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-mono text-neon-purple uppercase tracking-[0.2em] bg-neon-purple/10 px-1.5 py-0.5 cut-corner-sm border border-neon-purple/20">
                  {module.id}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">
                  {module.duration}
                </span>
              </div>
              
              <h3 className="text-xs font-bold text-slate-100 mb-1.5 uppercase tracking-wide group-hover:text-neon-purple transition-colors">
                {module.title}
              </h3>
              
              <p className="text-[10px] text-slate-400 mb-4 line-clamp-2 leading-relaxed italic">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1.5">
                  {module.tags.map((tag, j) => (
                    <span key={j} className="text-[7px] text-slate-500 font-mono uppercase tracking-tighter border border-white/5 px-1 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => startQuest(module.quest)}
                  className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-all px-3 py-1.5 cut-corner-sm border ${
                    activeQuest?.id === module.id
                      ? 'bg-neon-purple/20 text-white border-neon-purple/50'
                      : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-neon-purple/10 group-hover:text-white group-hover:border-neon-purple/40'
                  }`}
                >
                  {activeQuest?.id === module.id ? 'Active' : 'Initialize'}
                  <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
