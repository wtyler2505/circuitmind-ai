import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { useDiagram } from '../../contexts/DiagramContext';
import { useAssistantState } from '../../contexts/AssistantStateContext';
import { useConversationContext } from '../../contexts/ConversationContext';
import { SystemVitals } from './SystemVitals';

export const StatusRail = React.memo(() => {
  const { inventory } = useInventory();
  const { diagram } = useDiagram();
  const { generationMode } = useAssistantState();
  const { activeConversation } = useConversationContext();

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
      </div>
    </div>
  );
});
