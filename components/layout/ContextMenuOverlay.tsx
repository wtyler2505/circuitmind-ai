import React from 'react';
import type { ElectronicComponent, WiringDiagram } from '../../types';

interface ContextMenuOverlayProps {
  contextMenu: { x: number; y: number; componentId: string };
  diagram: WiringDiagram | null;
  onEdit: (component: ElectronicComponent) => void;
  onDuplicate: (component: ElectronicComponent) => void;
  onGenerate3D: (component: ElectronicComponent) => void;
  onDelete: (componentId: string) => void;
  onClose: () => void;
}

export const ContextMenuOverlay: React.FC<ContextMenuOverlayProps> = ({
  contextMenu,
  diagram,
  onEdit,
  onDuplicate,
  onGenerate3D,
  onDelete,
  onClose,
}) => {
  const comp = diagram?.components.find((c) => c.id === contextMenu.componentId);

  return (
    <div
      className="fixed z-50 bg-cyber-black panel-surface border border-neon-cyan/20 shadow-2xl py-1 min-w-[180px] panel-frame animate-fade-in-right"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
        <div className="w-1 h-1 bg-neon-cyan animate-pulse" />
        Component Actions
      </div>
      <button
        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
        onClick={() => {
          if (comp) onEdit(comp);
        }}
      >
        <svg
          className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit
      </button>
      <button
        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
        onClick={() => {
          if (comp) {
            onDuplicate(comp);
            onClose();
          }
        }}
      >
        <svg
          className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
        Duplicate
      </button>
      <button
        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
        onClick={() => {
          if (comp) onGenerate3D(comp);
        }}
      >
        <svg
          className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
          />
        </svg>
        Generate 3D
      </button>
      <div className="h-px bg-white/5 my-1 mx-2" />
      <button
        className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 group"
        onClick={() => {
          onDelete(contextMenu.componentId);
          onClose();
        }}
      >
        <svg
          className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete
      </button>
    </div>
  );
};
