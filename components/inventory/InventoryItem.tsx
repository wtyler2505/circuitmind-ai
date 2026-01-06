import React, { memo } from 'react';
import { ElectronicComponent } from '../../types';
import { getTypeIcon } from './inventoryUtils';

interface InventoryItemProps {
  item: ElectronicComponent;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onDragStart: (e: React.DragEvent, item: ElectronicComponent) => void;
  onDoubleClick: (item: ElectronicComponent) => void;
  onAddToCanvas: (item: ElectronicComponent) => void;
  onEdit: (item: ElectronicComponent) => void;
  onRemove: (id: string) => void;
  brokenImage?: boolean;
  onImageError?: (id: string, url: string) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  isSelected,
  onToggleSelection,
  onDragStart,
  onDoubleClick,
  onAddToCanvas,
  onEdit,
  onRemove,
  brokenImage,
  onImageError
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDoubleClick={() => onDoubleClick(item)}
      className={`group relative flex items-center gap-3 p-1 border cut-corner-sm cursor-pointer transition-all ${
        isSelected
          ? 'bg-neon-cyan/5 border-neon-cyan/40'
          : 'bg-[#0a0c10] border-white/5 hover:border-white/20 hover:bg-[#0f1218]'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(item.id)}
        onClick={(e) => e.stopPropagation()}
        className="appearance-none w-3 h-3 border border-slate-600 bg-transparent checked:bg-neon-cyan checked:border-neon-cyan transition-colors cursor-pointer ml-1"
      />

      <div className="w-8 h-8 bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden cut-corner-sm shrink-0">
        {item.imageUrl && !brokenImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            onError={() => onImageError?.(item.id, item.imageUrl!)}
          />
        ) : (
          getTypeIcon(item.type)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate tracking-wide">
            {item.name}
          </span>
          {item.lowStock && (
            <span className="text-[8px] text-amber-500 font-mono ml-2">LOW</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-mono text-slate-500">
            QTY <span className="text-slate-300">{item.quantity || 0}</span>
          </span>
          {item.pins && item.pins.length > 0 && (
            <span className="text-[8px] text-slate-600 uppercase tracking-wider border border-white/5 px-1">
              {item.pins.length}P
            </span>
          )}
        </div>
      </div>

      <div className="hidden group-hover:flex items-center gap-1 pr-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCanvas(item);
          }}
          className="p-1 text-slate-400 hover:text-neon-green hover:bg-white/5 cut-corner-sm transition-colors"
          title="Add to Canvas"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1 text-slate-400 hover:text-neon-cyan hover:bg-white/5 cut-corner-sm transition-colors"
          title="Edit"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 cut-corner-sm transition-colors"
          title="Delete"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(InventoryItem);
