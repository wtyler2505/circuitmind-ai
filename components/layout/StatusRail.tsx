import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useDiagram } from '../../contexts/DiagramContext';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useLayout } from '../../contexts/LayoutContext';
import { SystemVitals } from './SystemVitals';

export const StatusRail: React.FC = () => {
  const { inventory } = useInventory();
  const { diagram } = useDiagram();
  const { isOnline } = useConnectivity();
  const { neuralLinkEnabled } = useLayout();

  const totalInventoryUnits = inventory.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const diagramComponentCount = diagram?.components.length || 0;
  const diagramConnectionCount = diagram?.connections.length || 0;

  return (
    <div className="h-7 bg-cyber-black panel-rail border-t border-white/10 flex items-center justify-between px-3 text-[9px] uppercase tracking-[0.15em] font-mono select-none shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4 text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="text-neon-cyan font-bold">SYSTEM</span>
          <span className="text-slate-300">ONLINE</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">ASSETS</span>
          <span className="text-slate-300 font-bold">{totalInventoryUnits}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">DIAG</span>
          <span className="text-slate-300 font-bold">{diagramComponentCount} / {diagramConnectionCount}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 flex items-center gap-1.5 font-bold">
            <span className="text-slate-500 font-normal">PWR</span>
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#00ff9d] animate-pulse" />
          </span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-1.5 font-bold ${isOnline ? 'text-slate-300' : 'text-red-400 animate-pulse'}`}>
            <span className="text-slate-500 font-normal text-[8px]">LINK</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-neon-cyan shadow-[0_0_8px_#00f3ff]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
          </span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-1.5 font-bold ${neuralLinkEnabled ? 'text-neon-purple' : 'text-slate-500 opacity-50'}`}>
            <span className="font-normal text-[8px]">NEURAL</span>
            <div className={`w-1.5 h-1.5 rounded-full ${neuralLinkEnabled ? 'bg-neon-purple shadow-[0_0_8px_#bd00ff] animate-pulse' : 'bg-slate-700'}`} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <SystemVitals />
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="text-[8px] font-normal opacity-50">NODE</span>
          <span className="text-slate-300 max-w-[120px] truncate tracking-widest">CM_STATION_ALPHA</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <button 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all uppercase group"
          onClick={() => {}}
        >
          <span className="group-hover:text-neon-cyan transition-colors">v1.4.2</span>
          <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.754 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};