import React, { useState } from 'react';
import { useMacros } from '../../contexts/MacroContext';
import { useAIActions } from '../../hooks/useAIActions';

export const MacroPanel: React.FC = () => {
  const { 
    isRecording, setIsRecording, recordedSteps, clearRecordedSteps, 
    savedMacros, saveMacro, runMacro 
  } = useMacros();
  
  const { execute } = useAIActions({ 
    canvasRef: { current: null }, // Dummy for execution
    setSelectedComponent: () => {} 
  });

  const [macroName, setMacroName] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#020203] p-3 space-y-4">
      {/* Recording Header */}
      <div className="bg-slate-900/80 border border-white/5 p-3 cut-corner-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-slate-600'}`} />
            Macro Recorder
          </h3>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest cut-corner-sm transition-all ${
              isRecording ? 'bg-red-500 text-white' : 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20'
            }`}
          >
            {isRecording ? 'STOP' : 'RECORD'}
          </button>
        </div>

        {recordedSteps.length > 0 && (
          <div className="space-y-2">
            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 bg-black/40 p-2 space-y-1">
              {recordedSteps.map((step, idx) => (
                <div key={step.id} className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-slate-600 w-3">{idx + 1}.</span>
                  <span className="truncate">{step.description}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="Macro Name..."
                className="flex-1 bg-black border border-slate-700 cut-corner-sm px-2 py-1.5 text-[10px] text-white focus:border-neon-cyan focus:outline-none"
              />
              <button
                onClick={() => {
                  if (macroName) {
                    saveMacro(macroName);
                    setMacroName('');
                  }
                }}
                disabled={!macroName}
                className="bg-neon-green text-black font-bold px-3 py-1.5 cut-corner-sm text-[9px] tracking-[0.2em] hover:bg-white disabled:opacity-50"
              >
                SAVE
              </button>
              <button
                onClick={clearRecordedSteps}
                className="bg-slate-800 text-slate-400 px-3 py-1.5 cut-corner-sm text-[9px] font-bold"
              >
                CLEAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Macros */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-1">
          Saved Workflows
        </h3>
        
        {savedMacros.length === 0 ? (
          <div className="text-center py-8 opacity-20">
            <div className="loading-tech scale-75 mb-2 mx-auto grayscale"></div>
            <p className="text-[9px] uppercase tracking-widest">No Macros Saved</p>
          </div>
        ) : (
          savedMacros.map((macro) => (
            <div 
              key={macro.id}
              className="bg-white/5 border border-white/10 p-3 cut-corner-sm group hover:border-neon-cyan/30 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-neon-cyan transition-colors">
                  {macro.name}
                </h4>
                <span className="text-[8px] text-slate-600 font-mono uppercase">
                  {macro.steps.length} Steps
                </span>
              </div>
              <button
                onClick={() => runMacro(macro, execute)}
                className="w-full py-1.5 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[9px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all"
              >
                RUN WORKFLOW
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
