import React, { memo, useMemo } from 'react';
import { VList } from 'virtua';
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

type FlatItem = 
  | { type: 'header'; label: string; id: string }
  | { type: 'item'; data: ElectronicComponent; id: string };

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
  const flatItems = useMemo(() => {
    const flat: FlatItem[] = [];
    
    // Group items
    const groups: Record<string, ElectronicComponent[]> = {};
    CATEGORIES.forEach((c) => (groups[c] = []));

    items.forEach((item) => {
      if (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeCategory === 'all' || item.type === activeCategory)
      ) {
        const cat = CATEGORIES.includes(item.type as typeof CATEGORIES[number]) ? item.type : 'other';
        groups[cat].push(item);
      }
    });

    // Flatten with headers
    CATEGORIES.forEach(cat => {
      const catItems = groups[cat];
      if (catItems.length > 0) {
        flat.push({ type: 'header', label: cat, id: `header-${cat}` });
        catItems.forEach(item => {
          flat.push({ type: 'item', data: item, id: item.id });
        });
      }
    });

    return flat;
  }, [items, searchQuery, activeCategory]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {selectedIds.size > 0 && (
        <div className="bg-neon-cyan/5 border border-neon-cyan/20 cut-corner-sm p-2 mb-3 flex items-center justify-between shrink-0 mx-2">
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

      <div className="flex-1 overflow-hidden">
        <VList className="h-full custom-scrollbar" style={{ height: '100%' }}>
          {flatItems.map((item) => {
            if (item.type === 'header') {
              return (
                <div key={item.id} className="mb-1 mt-2 px-2">
                  <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 pl-1 border-l-2 border-slate-700">
                    {item.label}
                  </h3>
                </div>
              );
            }

            const comp = item.data;
            return (
              <div key={item.id} className="px-2 mb-1">
                <InventoryItem
                  item={comp}
                  isSelected={selectedIds.has(comp.id)}
                  brokenImage={!!comp.imageUrl && brokenImages[comp.id] === comp.imageUrl}
                  onToggleSelection={onToggleSelection}
                  onDragStart={onDragStart}
                  onDoubleClick={onDoubleClick}
                  onAddToCanvas={onAddToCanvas}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  onImageError={onImageError}
                />
              </div>
            );
          })}
        </VList>
      </div>
    </div>
  );
};

export default memo(InventoryList);
