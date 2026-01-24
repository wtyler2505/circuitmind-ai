import React, { useRef } from 'react';
import { configManager } from '../../services/config/configManager';
import { useLayout } from '../../contexts/LayoutContext';
import { useAssistantState } from '../../contexts/AssistantStateContext';

export const ConfigPortal: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layout = useLayout();
  const assistant = useAssistantState();

  const handleExport = () => {
    const fullState = {
      version: '1.0',
      metadata: { name: 'Local Config', environment: 'lab' },
      ui: {
        activeMode: layout.activeMode,
        inventoryWidth: layout.inventoryWidth,
        assistantWidth: layout.assistantWidth
      },
      ai: {
        generationMode: assistant.generationMode,
        useDeepThinking: assistant.useDeepThinking
      }
    };

    const yamlStr = configManager.serialize(fullState);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'circuitmind.config.yaml';
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const config = configManager.deserialize(content);
      if (config) {
        alert('Configuration loaded successfully. System restart required.');
        window.location.reload();
      } else {
        alert('Invalid configuration file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-slate-900/80 border border-white/5 p-4 cut-corner-md space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-2">
          <svg className="w-4 h-4 text-neon-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          WORKSPACE_DOTFILES
        </h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          Manage your environment as code. Export settings to move between machines.
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex-1 bg-white/5 border border-white/10 hover:border-neon-amber/30 hover:bg-white/10 text-slate-200 py-3 cut-corner-sm text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            EXPORT YAML
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-neon-amber text-black py-3 cut-corner-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(255,170,0,0.3)]"
          >
            IMPORT YAML
          </button>
          <input 
            type="file" 
            accept=".yaml,.yml" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Environment Profiles</h4>
        <div className="space-y-2">
          <button className="w-full text-left p-2 bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[9px] font-bold uppercase tracking-widest">
            ● DEFAULT_WORKSPACE
          </button>
          <button className="w-full text-left p-2 bg-white/5 border border-white/10 text-slate-500 text-[9px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors">
            ○ ADD_NEW_PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};
