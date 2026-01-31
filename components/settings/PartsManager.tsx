import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { FzpzLoader } from '../../services/fzpzLoader';
import { partStorageService } from '../../services/partStorageService';
import { useToast } from '../../hooks/useToast';

/**
 * PartsManager
 * 
 * Allows users to import custom .fzpz files and manage their local library.
 */
export const PartsManager: React.FC = () => {
  const { addItem, inventory } = useInventory();
  const [isImporting, setIsImporting] = useState(false);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.fzpz')) {
      toast.error('Invalid file format. Please select a .fzpz file.');
      return;
    }

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const part = await FzpzLoader.load(buffer);

      // Check if already exists
      if (inventory.find(i => i.id === part.moduleId)) {
        toast.warning(`Part ${part.component.name} already exists in inventory.`);
        setIsImporting(false);
        return;
      }

      // 1. Save binary to IndexedDB
      await partStorageService.savePart({
        id: part.moduleId,
        binary: buffer,
        breadboardSvg: part.svgs.breadboard,
        lastUsed: Date.now()
      });

      // 2. Add to Inventory Context
      addItem({
        id: part.moduleId,
        name: part.component.name || 'Custom Part',
        type: part.component.type || 'other',
        description: part.component.description || 'Imported custom part',
        fzpzSource: buffer,
        footprint: part.component.footprint,
        quantity: 1
      });

      toast.success(`Successfully imported ${part.component.name}`);
    } catch (e) {
      console.error('Import failed', e);
      toast.error('Failed to parse FZPZ file. It may be corrupted or non-standard.');
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Custom Part Importer</h3>
        <p className="text-xs text-slate-400 mb-4">
          Upload a Fritzing Part (`.fzpz`) to add it to your local library.
          The part will be stored in your browser's IndexedDB.
        </p>

        <div className="flex items-center gap-4">
          <label className={`relative cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg hover:bg-white/5 hover:border-neon-cyan transition-all ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-slate-400">
                <span className="font-semibold text-neon-cyan">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">.fzpz (Fritzing Part Package)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".fzpz"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Library Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Total Parts</div>
            <div className="text-xl font-bold text-white">{inventory.length}</div>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Custom Imports</div>
            <div className="text-xl font-bold text-neon-pink">
              {inventory.filter(i => !i.fzpzUrl && i.fzpzSource).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
