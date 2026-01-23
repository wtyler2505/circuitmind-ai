import React, { useState, useCallback } from 'react';
import { useDiagram } from '../../contexts/DiagramContext';
import { useVoiceAssistant } from '../../contexts/VoiceAssistantContext';
import { useLayout } from '../../contexts/LayoutContext';
import IconButton from '../IconButton';
import { ModeSelector } from './ModeSelector';

export const AppHeader = React.memo(() => {
  const { undo, redo, canUndo, canRedo, saveToQuickSlot, loadFromQuickSlot, diagram } = useDiagram();
  const { isLiveActive, liveStatus, toggleLiveMode } = useVoiceAssistant();
  const { setSettingsOpen } = useLayout();

  // Feedback states for SAVE/LOAD buttons
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'empty'>('idle');

  const handleSave = useCallback(() => {
    if (!diagram) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 1500);
      return;
    }
    setSaveStatus('saving');
    saveToQuickSlot();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  }, [diagram, saveToQuickSlot]);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem('savedDiagram');
    if (!saved) {
      setLoadStatus('empty');
      setTimeout(() => setLoadStatus('idle'), 1500);
      return;
    }
    setLoadStatus('loading');
    loadFromQuickSlot();
    setLoadStatus('loaded');
    setTimeout(() => setLoadStatus('idle'), 1500);
  }, [loadFromQuickSlot]);

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
              <img src="/assets/ui/action-undo.png" alt="" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
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
              <img src="/assets/ui/action-redo.png" alt="" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
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
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`h-7 px-3 text-[9px] font-bold tracking-[0.2em] transition-all cut-corner-sm leading-none focus-visible-ring rounded-none flex items-center gap-1.5 ${
              saveStatus === 'saved'
                ? 'bg-green-500 border-green-400 text-white shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                : saveStatus === 'error'
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : saveStatus === 'saving'
                ? 'bg-neon-cyan/30 border-neon-cyan/50 text-neon-cyan animate-pulse'
                : 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-black group'
            }`}
            title="Save to Quick Slot"
          >
            <img src="/assets/ui/action-save.png" alt="" className={`w-3 h-3 ${saveStatus === 'idle' ? 'opacity-60 group-hover:invert' : ''}`} />
            {saveStatus === 'saved' ? '✓ SAVED' : saveStatus === 'error' ? 'NO DATA' : saveStatus === 'saving' ? '...' : 'SAVE'}
          </button>
          <button
            onClick={handleLoad}
            disabled={loadStatus !== 'idle'}
            className={`h-7 px-3 text-[9px] font-bold tracking-[0.2em] transition-all cut-corner-sm leading-none focus-visible-ring rounded-none flex items-center gap-1.5 ${
              loadStatus === 'loaded'
                ? 'bg-green-500 border-green-400 text-white shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                : loadStatus === 'empty'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : loadStatus === 'loading'
                ? 'bg-white/20 border-white/30 text-white animate-pulse'
                : 'bg-black/20 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 group'
            }`}
            title="Load from Quick Slot"
          >
            <img src="/assets/ui/action-load.png" alt="" className={`w-3 h-3 ${loadStatus === 'idle' ? 'opacity-60' : ''}`} />
            {loadStatus === 'loaded' ? '✓ LOADED' : loadStatus === 'empty' ? 'EMPTY' : loadStatus === 'loading' ? '...' : 'LOAD'}
          </button>
        </div>
      </div>

      <ModeSelector />

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
            <img src="/assets/ui/action-voice.png" alt="" className={`w-3.5 h-3.5 ${isLiveActive ? '' : 'opacity-60'}`} />
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
            <img src="/assets/ui/action-settings.png" alt="" className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          }
          onClick={() => setSettingsOpen(true)}
          size="sm"
          className="bg-black/20 text-slate-400 border-white/5 hover:text-white hover:border-white/30 cut-corner-sm"
        />
      </div>
    </div>
  );
});
