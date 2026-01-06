import React, { memo, useMemo } from 'react';
import { ElectronicComponent } from '../../types';
import InventoryItem from './InventoryItem';

type ComponentType = ElectronicComponent['type'];
const CATEGORIES = ['microcontroller', 'sensor', 'actuator', 'power', 'other'] as const;

interface InventoryListProps {
  items: ElectronicComponent[];
  searchQuery: string;
  activeCategory: ComponentType | 'all';
  selectedIds: Set<string>;
  brokenImages: Record<string, string>;
  onToggleSelection: (id: string) => void;
  onDragStart: (e: React.DragEvent, item: ElectronicComponent) => void;
  onDoubleClick: (item: ElectronicComponent) => void;
  onAddToCanvas: (item: ElectronicComponent) => void;
  onEdit: (item: ElectronicComponent) => void;
  onRemove: (id: string) => void;
  onImageError: (id: string, url: string) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  items,
  searchQuery,
  activeCategory,
  selectedIds,
  brokenImages,
  onToggleSelection,
  onDragStart,
  onDoubleClick,
  onAddToCanvas,
  onEdit,
  onRemove,
  onImageError,
  onClearSelection,
  onBulkDelete,
}) => {
  const categorizedItems = useMemo(() => {
    const groups: Record<string, ElectronicComponent[]> = {};
    CATEGORIES.forEach((c) => (groups[c] = []));

    items.forEach((item) => {
      if (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeCategory === 'all' || item.type === activeCategory)
      ) {
        if (groups[item.type]) {
          groups[item.type].push(item);
        } else {
          groups['other'].push(item);
        }
      }
    });
    return groups;
  }, [items, searchQuery, activeCategory]);

  return (
    <div className="p-2 space-y-2 pb-20 md:pb-16">
      {selectedIds.size > 0 && (
        <div className="bg-neon-cyan/5 border border-neon-cyan/20 cut-corner-sm p-2 mb-3 flex items-center justify-between">
          <span className="text-[9px] font-mono text-neon-cyan uppercase tracking-widest">
            {selectedIds.size} SELECTED
          </span>
          <div className="flex gap-1">
            <button
              onClick={onClearSelection}
              className="px-2 py-1 text-[9px] text-slate-400 hover:text-white uppercase tracking-wider"
            >
              Clear
            </button>
            <button
              onClick={onBulkDelete}
              className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[9px] uppercase tracking-wider cut-corner-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {CATEGORIES.map((cat) => {
        const catItems = categorizedItems[cat] || [];
        if (catItems.length === 0) return null;

        return (
          <div key={cat} className="mb-4">
            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1 border-l-2 border-slate-700">
              {cat}
            </h3>
            <div className="space-y-1">
              {catItems.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  brokenImage={!!item.imageUrl && brokenImages[item.id] === item.imageUrl}
                  onToggleSelection={onToggleSelection}
                  onDragStart={onDragStart}
                  onDoubleClick={onDoubleClick}
                  onAddToCanvas={onAddToCanvas}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  onImageError={onImageError}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(InventoryList);
