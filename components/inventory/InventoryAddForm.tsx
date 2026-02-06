import React, { useState, useRef } from 'react';
import { ElectronicComponent } from '../../types';
import { useToast } from '../../hooks/useToast';
import { resizeImage } from './inventoryUtils';
import {
  identifyComponentFromImage,
  findComponentSpecs,
  generateComponentThumbnail,
} from '../../services/geminiService';

type ComponentType = ElectronicComponent['type'];

const CATEGORIES = ['microcontroller', 'sensor', 'actuator', 'power', 'other'] as const;

interface InventoryAddFormProps {
  onItemAdded: (item: ElectronicComponent) => void;
  onSwitchToList: () => void;
}

const InventoryAddForm: React.FC<InventoryAddFormProps> = ({ onItemAdded, onSwitchToList }) => {
  const toast = useToast();

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<ComponentType>('other');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPins, setNewItemPins] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Part Finder State
  const [finderQuery, setFinderQuery] = useState('');
  const [finderResults, setFinderResults] = useState<Partial<ElectronicComponent>[]>([]);
  const [isFinderLoading, setIsFinderLoading] = useState(false);

  const handleFinderSearch = async () => {
    if (!finderQuery) return;
    setIsFinderLoading(true);
    try {
      const results = await findComponentSpecs(finderQuery);
      setFinderResults(results);
    } catch (e) {
      console.error(e);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsFinderLoading(false);
    }
  };

  const handleSelectFinderResult = (result: Partial<ElectronicComponent>) => {
    if (result.name) setNewItemName(result.name);
    if (result.type) setNewItemType(result.type as ComponentType);
    if (result.description) setNewItemDesc(result.description);
    if (result.pins) setNewItemPins(result.pins.join(', '));
    setFinderResults([]);
    setFinderQuery('');
  };

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const compressedBase64 = await resizeImage(base64);
        setNewItemImage(compressedBase64);
        const data = await identifyComponentFromImage(compressedBase64);
        if (data.name) setNewItemName(data.name);
        if (data.type) setNewItemType(data.type);
        if (data.description) setNewItemDesc(data.description);
        if (data.pins) setNewItemPins(data.pins.join(', '));
      } catch (_e) {
        toast.warning('Could not identify component from image.');
      } finally {
        setIsAiLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAutoGenerateImage = async () => {
    if (!newItemName) return;
    setIsGeneratingImage(true);
    try {
      const base64 = await generateComponentThumbnail(newItemName);
      setNewItemImage(`data:image/png;base64,${base64}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    const pins = newItemPins
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p);

    const newItem: ElectronicComponent = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      description: newItemDesc || 'User added component',
      pins: pins.length > 0 ? pins : undefined,
      quantity: newItemQty,
      imageUrl: newItemImage,
    };
    onItemAdded(newItem);

    setNewItemName('');
    setNewItemDesc('');
    setNewItemPins('');
    setNewItemQty(1);
    setNewItemImage('');
    onSwitchToList();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
      {/* Part Finder */}
      <div className="bg-cyber-black/80 panel-surface border border-neon-cyan/20 p-3 cut-corner-md space-y-2 panel-frame">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-neon-cyan flex items-center gap-2 uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            PART FINDER
          </label>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Optional</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={finderQuery}
            onChange={(e) => setFinderQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFinderSearch()}
            placeholder="Describe part..."
            className="flex-1 bg-black border border-white/10 cut-corner-sm px-3 py-1.5 text-[11px] text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none transition-colors"
          />
          <button
            onClick={handleFinderSearch}
            disabled={isFinderLoading || !finderQuery}
            className="bg-neon-cyan text-black font-bold px-3 py-1.5 cut-corner-sm text-[11px] tracking-[0.2em] hover:bg-white disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]"
          >
            {isFinderLoading ? '...' : 'FIND'}
          </button>
        </div>
        {finderResults.length > 0 && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar border-t border-white/10 pt-2">
            {finderResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectFinderResult(result)}
                className="w-full text-left p-1.5 cut-corner-sm bg-white/5 hover:bg-neon-cyan/20 border border-transparent hover:border-neon-cyan/50 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[11px] text-white group-hover:text-neon-cyan">
                    {result.name}
                  </span>
                  <span className="text-[9px] uppercase text-slate-400 bg-black/50 px-1 cut-corner-sm border border-white/5">
                    {result.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Scan */}
      <div className="bg-cyber-black/50 p-3 cut-corner-md border border-dashed border-white/20 text-center relative overflow-hidden group hover:border-neon-cyan/50 transition-colors">
        {newItemImage && (
          <div className="absolute inset-0 bg-black z-0">
            <img src={newItemImage} alt="Preview" className="w-full h-full object-cover opacity-50" />
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageScan} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAiLoading}
          className="w-full py-3 flex flex-col items-center gap-2 text-slate-400 hover:text-neon-cyan transition-all relative z-10"
        >
          {isAiLoading ? (
            <div className="loading-tech scale-75"></div>
          ) : (
            <svg className="w-6 h-6 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-shadow-glow">
            {isAiLoading ? 'ANALYZING...' : newItemImage ? 'RETAKE PHOTO' : 'SCAN COMPONENT PHOTO'}
          </span>
        </button>
      </div>

      {/* Basic Fields */}
      <div className="cut-corner-md border border-white/10 bg-cyber-black/40 p-3 space-y-3 panel-surface">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Basics</h4>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Required</span>
        </div>
        <div>
          <label htmlFor="newItemName" className="block text-[11px] font-mono text-slate-400 mb-1">COMPONENT NAME</label>
          <div className="flex gap-2">
            <input
              id="newItemName"
              name="newItemName"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g., NE555 Timer"
              className="flex-1 bg-black border border-white/10 cut-corner-sm px-3 py-1.5 text-[11px] text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAutoGenerateImage}
              disabled={!newItemName || isGeneratingImage}
              className="h-9 w-9 inline-flex items-center justify-center bg-white/5 border border-white/10 text-neon-purple cut-corner-sm hover:bg-white/10 transition-all hover:border-neon-purple/50"
            >
              {isGeneratingImage ? (
                <div className="loading-tech scale-50" style={{ filter: 'drop-shadow(0 0 4px #bd00ff)' }}></div>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="newItemType" className="block text-[11px] font-mono text-slate-400 mb-1">TYPE</label>
            <select
              id="newItemType"
              name="newItemType"
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as ComponentType)}
              className="w-full bg-black border border-white/10 cut-corner-sm px-2 py-1.5 text-[11px] text-white focus:border-neon-cyan focus:outline-none transition-colors appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <label htmlFor="newItemQty" className="block text-[11px] font-mono text-slate-400 mb-1">QTY</label>
            <input
              id="newItemQty"
              name="newItemQty"
              type="number"
              min="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(parseInt(e.target.value))}
              className="w-full bg-black border border-white/10 cut-corner-sm px-2 py-1.5 text-[11px] text-white focus:border-neon-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Extended Fields */}
      <div className="cut-corner-md border border-white/10 bg-cyber-black/40 p-3 space-y-3 panel-surface">
        <div>
          <label htmlFor="newItemDesc" className="block text-[11px] font-mono text-slate-400 mb-1">DESCRIPTION</label>
          <textarea
            id="newItemDesc"
            name="newItemDesc"
            value={newItemDesc}
            onChange={(e) => setNewItemDesc(e.target.value)}
            rows={2}
            placeholder="Short summary..."
            className="w-full bg-black border border-white/10 cut-corner-sm px-3 py-1.5 text-[11px] text-white resize-none focus:border-neon-cyan focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="newItemPins" className="block text-[11px] font-mono text-slate-400 mb-1">PINS</label>
          <input
            id="newItemPins"
            name="newItemPins"
            type="text"
            value={newItemPins}
            onChange={(e) => setNewItemPins(e.target.value)}
            placeholder="VCC, GND, OUT..."
            className="w-full bg-black border border-white/10 cut-corner-sm px-3 py-1.5 text-[11px] text-white font-mono focus:border-neon-cyan focus:outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={!newItemName}
        className="w-full bg-neon-cyan text-black font-bold py-2.5 cut-corner-sm hover:bg-white transition-all uppercase tracking-[0.25em] text-[11px] shadow-[0_0_20px_rgba(0,243,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ADD TO INVENTORY
      </button>
    </div>
  );
};

export default React.memo(InventoryAddForm);
