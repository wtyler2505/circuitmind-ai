import React, { useState } from 'react';
import { ElectronicComponent } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useInventory } from '../../contexts/InventoryContext';
import { INITIAL_INVENTORY } from '../../data/initialInventory';
import { HardwareTerminal } from '../layout/HardwareTerminal';
import { BOMModal } from './BOMModal';
import { suggestProjectsFromInventory } from '../../services/geminiService';

interface InventoryToolsPanelProps {
  items: ElectronicComponent[];
}

const InventoryToolsPanel: React.FC<InventoryToolsPanelProps> = ({ items }) => {
  const { setInventory, addItem } = useInventory();
  const toast = useToast();

  const [suggestions, setSuggestions] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isBOMOpen, setIsBOMOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset inventory to default tier 5 kit? This will replace your current inventory.')) {
      setInventory(INITIAL_INVENTORY);
      toast.success('Inventory reset to defaults.');
    }
  };

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'inventory_backup.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported)) {
          imported.forEach((item) => {
            if (item.name && item.id) addItem(item);
          });
          toast.success(`Imported ${imported.length} items.`);
        }
      } catch (_err) {
        toast.error('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSuggestProjects = async () => {
    setIsSuggesting(true);
    const text = await suggestProjectsFromInventory(items);
    setSuggestions(text);
    setIsSuggesting(false);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {/* Hardware Terminal */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 mb-2 border-b border-white/10 pb-1 uppercase tracking-[0.25em]">
            PHYSICAL LINK
          </h3>
          <div className="h-64 mb-4">
            <HardwareTerminal />
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 mb-2 border-b border-white/10 pb-1 uppercase tracking-[0.25em]">
            DATA MANAGEMENT
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="bg-white/5 hover:bg-white/10 text-slate-300 py-2 cut-corner-sm border border-white/10 flex flex-col items-center gap-1 transition-all group"
            >
              <img src="/assets/ui/action-save.webp" alt="" className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <span className="text-[9px] font-bold tracking-[0.2em]">EXPORT JSON</span>
            </button>
            <label className="bg-white/5 hover:bg-white/10 text-slate-300 py-2 cut-corner-sm border border-white/10 flex flex-col items-center gap-1 cursor-pointer transition-all group">
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              <img src="/assets/ui/action-load.webp" alt="" className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <span className="text-[9px] font-bold tracking-[0.2em]">IMPORT JSON</span>
            </label>
            <button
              onClick={() => setIsBOMOpen(true)}
              className="col-span-2 bg-neon-purple/5 hover:bg-neon-purple/10 text-neon-purple py-2 cut-corner-sm border border-neon-purple/20 flex items-center justify-center gap-2 transition-all mt-1 hover:border-neon-purple/50"
            >
              <span className="text-[9px] font-bold tracking-[0.2em]">GENERATE PROJECT BOM</span>
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={handleReset}
              className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-400 py-2 cut-corner-sm border border-red-500/20 flex items-center justify-center gap-2 transition-all hover:border-red-500/50"
            >
              <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-[10px] font-bold">RESET TO DEFAULTS</span>
            </button>
          </div>
        </div>

        {/* AI Analysis */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 mb-2 border-b border-white/10 pb-1 uppercase tracking-[0.25em]">
            AI ANALYSIS
          </h3>
          <button
            onClick={handleSuggestProjects}
            disabled={isSuggesting}
            className="w-full bg-white/5 hover:bg-white/10 text-left p-2.5 cut-corner-sm border border-white/10 group transition-all"
          >
            <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-[11px]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {isSuggesting ? 'THINKING...' : 'WHAT CAN I BUILD?'}
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">
              Ask Gemini to suggest projects based on your current inventory.
            </div>
          </button>
          {suggestions && (
            <div className="mt-3 p-2.5 bg-cyber-black panel-surface border border-white/10 cut-corner-sm text-[11px] text-slate-300 markdown prose prose-invert max-w-none">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-neon-purple font-mono uppercase tracking-widest">Ideas</span>
                <button onClick={() => setSuggestions('')} className="text-slate-500 hover:text-white">&times;</button>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{suggestions}</div>
            </div>
          )}
        </div>
      </div>

      {isBOMOpen && <BOMModal onClose={() => setIsBOMOpen(false)} />}
    </>
  );
};

export default React.memo(InventoryToolsPanel);
