import React from 'react';
import { useDiagram } from '../../contexts/DiagramContext';
import { useVoiceAssistant } from '../../contexts/VoiceAssistantContext';
import { useLayout } from '../../contexts/LayoutContext';
import IconButton from '../IconButton';

export const AppHeader = React.memo(() => {
  const { undo, redo, canUndo, canRedo, saveToQuickSlot, loadFromQuickSlot } = useDiagram();
  const { isLiveActive, liveStatus, toggleLiveMode } = useVoiceAssistant();
  const { setSettingsOpen } = useLayout();

  return (
    <div className="h-10 panel-header flex items-center justify-between px-3 shrink-0 z-20 gap-4">
      {/* Brand Plate */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 select-none group">
          <img 
            src="/assets/ui/logo.png" 
            alt="CircuitMind AI" 
            className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(0,243,255,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] transition-all duration-300" 
          />
          <h1 className="text-[10px] font-bold tracking-[0.3em] text-white panel-title leading-none">
            CIRCUIT<span className="text-neon-cyan">MIND</span>
          </h1>
        </div>
        
        <div className="h-5 w-px bg-white/10 border-r border-black/50" />

        {/* Edit History Group */}
        <div className="flex gap-1">
          <IconButton
            label="Undo"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            }
            onClick={undo}
            disabled={!canUndo}
            size="sm"
            variant="ghost"
            className="bg-black/20 border border-white/5 cut-corner-sm hover:text-white"
          />
          <IconButton
            label="Redo"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            }
            onClick={redo}
            disabled={!canRedo}
            size="sm"
            variant="ghost"
            className="bg-black/20 border border-white/5 cut-corner-sm hover:text-white"
          />
        </div>

        <div className="h-5 w-px bg-white/10 border-r border-black/50" />

        {/* Persistence Group */}
        <div className="flex items-center gap-1">
          <button
            onClick={saveToQuickSlot}
            className="h-7 px-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[9px] font-bold tracking-[0.2em] hover:bg-neon-cyan hover:text-black transition-all cut-corner-sm leading-none focus-visible-ring rounded-none"
            title="Save to Quick Slot"
          >
            SAVE
          </button>
          <button
            onClick={loadFromQuickSlot}
            className="h-7 px-3 bg-black/20 border border-white/10 text-slate-300 text-[9px] font-bold tracking-[0.2em] hover:text-white hover:border-white/30 transition-all cut-corner-sm leading-none focus-visible-ring rounded-none"
            title="Load from Quick Slot"
          >
            LOAD
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {isLiveActive && (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-950/30 border border-red-500/30 cut-corner-sm">
            <div className="w-1.5 h-1.5 bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest leading-none">{liveStatus}</span>
          </div>
        )}
        
        <IconButton
          label={isLiveActive ? "Disable Voice Mode" : "Enable Voice Mode"}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
          onClick={toggleLiveMode}
          size="sm"
          className={`cut-corner-sm ${
            isLiveActive 
              ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
              : 'bg-black/20 text-slate-400 border-white/5 hover:text-neon-cyan hover:border-neon-cyan/30'
          }`}
        />
        
        <IconButton
          label="Settings"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543-.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          onClick={() => setSettingsOpen(true)}
          size="sm"
          className="bg-black/20 text-slate-400 border-white/5 hover:text-white hover:border-white/30 cut-corner-sm"
        />
      </div>
    </div>
  );
});
