import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useDiagram } from '../../contexts/DiagramContext';
import { useAssistantState } from '../../contexts/AssistantStateContext';
import { useConversationContext } from '../../contexts/ConversationContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useConnectivity } from '../../hooks/useConnectivity';
import { SystemVitals } from './SystemVitals';

export const StatusRail = React.memo(() => {
  const { inventory } = useInventory();
  const { diagram } = useDiagram();
  const { generationMode } = useAssistantState();
  const { activeConversation } = useConversationContext();
  const { lock, currentUser } = useAuth();
  const { role } = usePermissions();
  const { isOnline } = useConnectivity();

  const totalInventoryUnits = inventory.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const diagramComponentCount = diagram?.components?.length ?? 0;
  const diagramConnectionCount = diagram?.connections?.length ?? 0;

  return (
    <div className="h-7 bg-[#050608] border-t border-white/10 flex items-center justify-between px-3 text-[9px] uppercase tracking-[0.1em] font-mono select-none shrink-0 z-20">
      <div className="flex items-center gap-4 text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan">SYS</span>
          <span className="text-slate-300">ONLINE</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan">INV</span>
          <span className="text-slate-300">{totalInventoryUnits}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan">NET</span>
          <span className="text-slate-300">{diagramComponentCount} / {diagramConnectionCount}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan">SYNC</span>
          <span className="text-slate-300 flex items-center gap-1.5">
            LOCAL
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_5px_#00ff9d]" />
          </span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className={isOnline ? 'text-neon-cyan' : 'text-red-500'}>SAT</span>
          <span className={`flex items-center gap-1.5 ${isOnline ? 'text-slate-300' : 'text-red-400'}`}>
            {isOnline ? 'LINK_ESTABLISHED' : 'LINK_LOST'}
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-neon-cyan' : 'bg-red-500 animate-pulse shadow-[0_0_5px_#ef4444]'}`} />
          </span>
        </div>
      </div>

      <SystemVitals />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <span>MODE</span>
          <span className="text-neon-purple bg-neon-purple/10 px-1">{generationMode}</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2 text-slate-500">
          <span>SESSION</span>
          <span 
            className="text-slate-300 max-w-[120px] truncate"
            title={activeConversation?.title || 'UNTITLED'}
          >
            {activeConversation?.title || 'UNTITLED'}
          </span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <button 
          onClick={lock}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase"
        >
          <span className="text-[8px] border border-white/10 px-1">{role}</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
