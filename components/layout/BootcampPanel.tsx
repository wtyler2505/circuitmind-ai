import React from 'react';
import { TUTORIALS } from '../../data/tutorials';
import { useTutorial, TutorialQuest } from '../../contexts/TutorialContext';

export const BootcampPanel: React.FC = () => {
  const { startQuest, activeQuest } = useTutorial();

  return (
    <div className="flex flex-col h-full bg-[#020203] panel-frame border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-purple">ENGINEERING</span>_BOOTCAMP
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Interactive Quests & Tutorials
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {TUTORIALS.map((quest) => (
          <div 
            key={quest.id}
            className={`group p-4 cut-corner-md border transition-all cursor-pointer ${
              activeQuest?.id === quest.id 
                ? 'bg-neon-purple/10 border-neon-purple/50' 
                : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
            onClick={() => startQuest(quest)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-white group-hover:text-neon-purple transition-colors">
                {quest.title}
              </h3>
              <span className={`text-[8px] px-1.5 py-0.5 cut-corner-sm uppercase font-bold tracking-widest border ${
                quest.difficulty === 'beginner' ? 'text-neon-green border-neon-green/30 bg-neon-green/5' :
                quest.difficulty === 'intermediate' ? 'text-neon-amber border-neon-amber/30 bg-neon-amber/5' :
                'text-red-500 border-red-500/30 bg-red-500/5'
              }`}>
                {quest.difficulty}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-4 line-clamp-2">
              {quest.steps[0].instructions}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-600 font-mono uppercase">
                {quest.steps.length} STEPS
              </span>
              <button 
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest cut-corner-sm transition-all ${
                  activeQuest?.id === quest.id
                    ? 'bg-neon-purple text-black'
                    : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                }`}
              >
                {activeQuest?.id === quest.id ? 'ACTIVE' : 'START QUEST'}
              </button>
            </div>
          </div>
        ))}

        <div className="p-8 text-center opacity-30">
          <div className="loading-tech scale-75 mb-4"></div>
          <p className="text-[10px] uppercase tracking-[0.2em]">More Quests Incoming...</p>
        </div>
      </div>
    </div>
  );
};
