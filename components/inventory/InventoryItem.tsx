import React, { memo, useState, useEffect, useRef } from 'react';
import { ElectronicComponent } from '../../types';
import { getTypeIcon } from './inventoryUtils';
import { partStorageService } from '../../services/partStorageService';

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
  const [cachedThumbnail, setCachedThumbnail] = useState<string | null>(null);
  const [showDiagTooltip, setShowDiagTooltip] = useState(false);
  const diagRef = useRef<HTMLSpanElement>(null);

  const diagnostics = item.fzpzDiagnostics;
  const hasErrors = diagnostics?.some(d => d.level === 'error');
  const diagCount = diagnostics?.length || 0;

  useEffect(() => {
    const checkCache = async () => {
      const cached = await partStorageService.getPart(item.id);
      if (cached?.thumbnail) {
        setCachedThumbnail(cached.thumbnail);
      }
    };
    checkCache();
  }, [item.id]);

  const displayImage = cachedThumbnail || item.imageUrl;

  return (
    <div
      draggable
      tabIndex={0}
      aria-label={`${item.name}, quantity ${item.quantity || 0}${item.lowStock ? ', low stock' : ''}${isSelected ? ', selected' : ''}`}
      onClick={() => onToggleSelection(item.id)}
      onDragStart={(e) => onDragStart(e, item)}
      onDoubleClick={() => onDoubleClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onAddToCanvas(item);
        } else if (e.key === ' ') {
          e.preventDefault();
          onToggleSelection(item.id);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onRemove(item.id);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          onEdit(item);
        }
      }}
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
        aria-label={`Select ${item.name}`}
        className="appearance-none w-3 h-3 border border-slate-600 bg-transparent checked:bg-neon-cyan checked:border-neon-cyan transition-colors cursor-pointer ml-1"
      />

      <div className="w-8 h-8 bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden cut-corner-sm shrink-0">
        {displayImage && !brokenImage ? (
          <img
            src={displayImage}
            alt={item.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            onError={() => onImageError?.(item.id, displayImage!)}
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
          {diagCount > 0 && (
            <span
              ref={diagRef}
              className={`relative text-[8px] font-mono uppercase tracking-wider border px-1 cursor-help ${
                hasErrors
                  ? 'text-red-400 border-red-600/40'
                  : 'text-amber-400 border-amber-600/40'
              }`}
              onMouseEnter={() => setShowDiagTooltip(true)}
              onMouseLeave={() => setShowDiagTooltip(false)}
              aria-label={`${diagCount} diagnostic issue${diagCount > 1 ? 's' : ''}`}
            >
              {hasErrors ? 'ERR' : 'WARN'}
              {showDiagTooltip && diagnostics && (
                <span className="absolute z-50 left-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded p-2 shadow-lg">
                  {diagnostics.map((d, i) => (
                    <span key={i} className={`block text-[10px] leading-tight mb-1 last:mb-0 ${
                      d.level === 'error' ? 'text-red-300' : 'text-amber-300'
                    }`}>
                      {d.message}
                    </span>
                  ))}
                </span>
              )}
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
          aria-label={`Add ${item.name} to canvas`}
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
          aria-label={`Edit ${item.name}`}
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
          aria-label={`Delete ${item.name}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(InventoryItem, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.item.id === next.item.id &&
    prev.item.quantity === next.item.quantity &&
    prev.brokenImage === next.brokenImage &&
    prev.item.fzpzDiagnostics === next.item.fzpzDiagnostics
  );
});
