import React, { useState, useRef, useMemo, useEffect, useCallback, useDeferredValue } from 'react';
import { ElectronicComponent } from '../types';
import { useToast } from '../hooks/useToast';
import { useInventory } from '../contexts/InventoryContext';
import { useLayout } from '../contexts/LayoutContext';
import { useDiagram } from '../contexts/DiagramContext';
import { determineOrphanAction } from '../services/componentValidator';
import InventoryList from './inventory/InventoryList';
import InventoryAddForm from './inventory/InventoryAddForm';
import InventoryToolsPanel from './inventory/InventoryToolsPanel';
import { MacroPanel } from './inventory/MacroPanel';

// Type alias for component types
type ComponentType = ElectronicComponent['type'];

interface InventoryProps {
  onSelect: (item: ElectronicComponent) => void;
}

const Inventory: React.FC<InventoryProps> = ({ onSelect }) => {
  const { 
    inventory: items, 
    addItem, 
    removeItem, 
    removeMany, 
    setInventory 
  } = useInventory();

  const {
    isInventoryOpen: isOpen,
    setInventoryOpen: onOpen,
    inventoryPinned: isPinned,
    setInventoryPinned: updatePinned,
    inventoryWidth: sidebarWidth,
    setInventoryWidth: onSidebarWidthChange,
    inventoryDefaultWidth: defaultSidebarWidth,
  } = useLayout();

  const { diagram, updateDiagram } = useDiagram();

  // Derived onClose
  const onClose = useCallback(() => onOpen(false), [onOpen]);
  const onSidebarOpen = useCallback(() => onOpen(true), [onOpen]);

  const minSidebarWidth = 280;
  const maxSidebarWidth = 520;

  // Refs for click outside detection
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);
  const toast = useToast();

  // Tabs: 'list', 'add', 'tools', 'macros'
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'tools' | 'macros'>('list');
  const [searchQuery, updateSearchQuery] = useState(''); // eslint-disable-line @typescript-eslint/no-unused-vars
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [brokenImages, setBrokenImages] = useState<Record<string, string>>({});

  // Wrapped in useCallback to prevent re-renders of InventoryList
  const handleAddToCanvas = useCallback((item: ElectronicComponent) => {
    const newInstance: ElectronicComponent = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      sourceInventoryId: item.id,
    };

    updateDiagram((currentDiagram) => {
        const base = currentDiagram || {
            title: 'Untitled Circuit',
            components: [],
            connections: [],
            explanation: 'Start connecting components!',
        };
        return {
            ...base,
            components: [...base.components, newInstance],
        };
    });
    toast.success(`Added ${item.name} to canvas`);
  }, [updateDiagram, toast]);

  // Guarded removal
  const handleRemoveItem = useCallback((id: string) => {
    const currentDiagram = diagram || { title: '', components: [], connections: [], explanation: '' };
    const { action, reason: _reason } = determineOrphanAction(id, currentDiagram);

    if (action === 'block') {
      console.error(`❌ Cannot delete: ${_reason}`);
      toast.error(_reason);
      return;
    }

    if (action === 'warn') {
      const confirmed = window.confirm(
        `⚠️ ${_reason}\n\nDo you want to remove it from all diagrams?`
      );
      if (!confirmed) return;
    }

    removeItem(id);

    // Also remove from current diagram if present
    if (currentDiagram.components.some(c => c.sourceInventoryId === id || c.id.startsWith(`${id}-`))) {
        updateDiagram((prev) => {
            if (!prev) return prev;
            const updatedComponents = prev.components.filter(
                c => c.sourceInventoryId !== id && !c.id.startsWith(`${id}-`)
            );
            const removedIds = new Set(
                prev.components
                .filter(c => c.sourceInventoryId === id || c.id.startsWith(`${id}-`))
                .map(c => c.id)
            );
            const updatedConnections = prev.connections.filter(
                c => !removedIds.has(c.fromComponentId) && !removedIds.has(c.toComponentId)
            );
            return {
                ...prev,
                components: updatedComponents,
                connections: updatedConnections,
            };
        });
    }
  }, [diagram, removeItem, updateDiagram, toast]);

  // Guarded bulk delete
  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${ids.length} items?`)) return;

    const currentDiagram = diagram || { title: '', components: [], connections: [], explanation: '' };
    const blockedIds: string[] = [];
    const warnIds: string[] = [];
    const okIds: string[] = [];

    for (const id of ids) {
      const { action, reason: _reason } = determineOrphanAction(id, currentDiagram);
      if (action === 'block') {
        blockedIds.push(id);
      } else if (action === 'warn') {
        warnIds.push(id);
      } else {
        okIds.push(id);
      }
    }

    if (blockedIds.length > 0) {
      toast.error(
        `Cannot delete ${blockedIds.length} component(s) with active wire connections. Remove wires first.`
      );
    }

    if (warnIds.length > 0) {
      const confirmed = window.confirm(
        `⚠️ ${warnIds.length} component(s) are used in the current diagram.\n\n` +
        `Do you want to remove them from the diagram as well?`
      );
      if (confirmed) {
        okIds.push(...warnIds);
      }
    }

    if (okIds.length > 0) {
      removeMany(okIds);

      // Remove from diagram
      const idsToRemove = new Set(okIds);
      updateDiagram((prev) => {
          if (!prev) return prev;
          const componentsToRemove = prev.components.filter(
            c => (c.sourceInventoryId && idsToRemove.has(c.sourceInventoryId)) ||
                okIds.some(id => c.id.startsWith(`${id}-`))
          );

          if (componentsToRemove.length > 0) {
            const removedCompIds = new Set(componentsToRemove.map(c => c.id));
            const updatedComponents = prev.components.filter(c => !removedCompIds.has(c.id));
            const updatedConnections = prev.connections.filter(
              c => !removedCompIds.has(c.fromComponentId) && !removedCompIds.has(c.toComponentId)
            );
            return {
              ...prev,
              components: updatedComponents,
              connections: updatedConnections,
            };
          }
          return prev;
      });
      
      setSelectedIds(new Set());
    }
  }, [selectedIds, diagram, removeMany, updateDiagram, toast]);

  // Hover Handlers
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onSidebarOpen();
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      (sidebarRef.current?.contains(nextTarget) || buttonRef.current?.contains(nextTarget))
    ) {
      return;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      updatePinned(false);
      onClose();
    } else {
      updatePinned(true);
      onSidebarOpen();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPinned) return;
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen, onClose, isPinned]);

  const clampSidebarWidth = (value: number) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value));

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStartRef.current = { x: event.clientX, width: sidebarWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const nextWidth = clampSidebarWidth(
        resizeStartRef.current.width + (moveEvent.clientX - resizeStartRef.current.x)
      );
      onSidebarWidthChange(nextWidth);
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 40 : 16;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth + step));
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth - step));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onSidebarWidthChange?.(clampSidebarWidth(defaultSidebarWidth));
    }
  };

  // Drag State
  const handleDragStart = useCallback((e: React.DragEvent, item: ElectronicComponent) => {
    e.dataTransfer.setData('application/react-component-id', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const markBrokenImage = useCallback((id: string, url?: string) => {
    if (!url) return;
    setBrokenImages((prev) => (prev[id] === url ? prev : { ...prev, [id]: url }));
  }, []);

  // Add item handler for InventoryAddForm
  const handleItemAdded = useCallback((item: ElectronicComponent) => {
    addItem(item);
  }, [addItem]);

  const inventoryStats = useMemo(() => {
    const categoryCounts: Record<ComponentType, number> = {
      microcontroller: 0,
      sensor: 0,
      actuator: 0,
      power: 0,
      other: 0,
    };
    let totalUnits = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      totalUnits += item.quantity || 1;
      if (item.lowStock) lowStockCount += 1;
      if (categoryCounts[item.type] !== undefined) {
        categoryCounts[item.type] += 1;
      } else {
        categoryCounts.other += 1;
      }
    });

    return {
      totalUnits,
      uniqueCount: items.length,
      lowStockCount,
      categoryCounts,
    };
  }, [items]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex flex-col items-center justify-center fixed left-0 top-1/2 z-50 panel-toggle cut-corner-sm border-r border-y border-neon-cyan/30 h-12 w-10 text-neon-cyan transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
        style={{ transform: `translate(${isOpen ? sidebarWidth : 0}px, -50%)` }}
        title={isPinned ? 'Unlock Inventory' : 'Inventory'}
        aria-label={isPinned ? 'Unlock inventory' : 'Open inventory'}
      >
        <img 
          src={`/assets/ui/${isPinned ? 'action-settings' : 'icon-microcontroller'}.webp`} 
          alt="" 
          className={`w-5 h-5 transition-all ${isPinned ? 'animate-pulse-slow' : 'group-hover:scale-110'}`}
          onError={(e) => (e.currentTarget.style.opacity = '0')}
        />
      </button>

      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="Inventory sidebar"
        className={`!fixed inset-y-0 left-0 w-[var(--inventory-width)] max-md:w-full panel-surface panel-rail panel-frame panel-brushed panel-flourish cut-corner-md border-r border-slate-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.8)]`}
        style={{ '--inventory-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div
          className="group absolute right-0 top-0 hidden h-full w-1 cursor-ew-resize md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
          onMouseDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
          onDoubleClick={() => onSidebarWidthChange?.(clampSidebarWidth(defaultSidebarWidth))}
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Resize inventory sidebar"
          aria-valuemin={minSidebarWidth}
          aria-valuemax={maxSidebarWidth}
          aria-valuenow={sidebarWidth}
          aria-valuetext={`${sidebarWidth}px`}
          title="Drag or use arrow keys to resize. Double-click to reset."
        >
          <div className="h-full w-full bg-neon-cyan/0 hover:bg-neon-cyan/50 transition-colors duration-200" />
        </div>
        
        <div className="px-3 pt-3 pb-0 bg-cyber-black panel-rail border-b border-white/5 flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] panel-title">
              <img src="/assets/ui/logo.webp" alt="" className="w-4 h-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ASSET MANAGER
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onClose}
                className="md:hidden h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-white border border-transparent hover:border-white/20 cut-corner-sm transition-colors"
                title="Close inventory"
                aria-label="Close inventory"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => updatePinned(!isPinned)}
                className={`hidden md:inline-flex h-6 w-6 items-center justify-center transition-all cut-corner-sm border ${ isPinned 
                    ? 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                    : 'text-slate-500 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5'
                }`}
                title={isPinned ? 'Unlock sidebar' : 'Lock sidebar open'}
                aria-label={isPinned ? 'Unlock sidebar' : 'Lock sidebar open'}
              >
                {isPinned ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9px] uppercase tracking-[0.15em] font-mono">
            <div className="bg-white/5 border border-white/5 px-2 py-1 flex items-center justify-between panel-surface">
              <span className="text-slate-500">Total</span>
              <span className="text-neon-cyan">{inventoryStats.totalUnits}</span>
            </div>
            <div className="bg-white/5 border border-white/5 px-2 py-1 flex items-center justify-between panel-surface">
              <span className="text-slate-500">Low Stock</span>
              <span className={inventoryStats.lowStockCount > 0 ? 'text-neon-amber drop-shadow-[0_0_5px_rgba(255,170,0,0.5)]' : 'text-slate-400'}>
                {inventoryStats.lowStockCount}
              </span>
            </div>
          </div>

          <div className="flex border-b border-white/5 mt-1" role="tablist" aria-label="Inventory sections">
            <button
              role="tab"
              aria-selected={activeTab === 'list'}
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-all border-b-2 ${ activeTab === 'list'
                  ? 'border-neon-cyan text-white bg-neon-cyan/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              ASSETS
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'add'}
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-all border-b-2 ${ activeTab === 'add'
                  ? 'border-neon-green text-white bg-neon-green/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              NEW
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-all border-b-2 ${ activeTab === 'tools'
                  ? 'border-neon-purple text-white bg-neon-purple/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              TOOLS
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'macros'}
              onClick={() => setActiveTab('macros')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-all border-b-2 ${ activeTab === 'macros'
                  ? 'border-neon-amber text-white bg-neon-amber/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              MACROS
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-cyber-dark min-h-0 overflow-hidden">
          {/* List View */}
          {activeTab === 'list' && (
            <InventoryList
              items={items}
              searchQuery={deferredSearchQuery}
              activeCategory="all"
              selectedIds={selectedIds}
              brokenImages={brokenImages}
              onToggleSelection={toggleSelection}
              onDragStart={handleDragStart}
              onDoubleClick={onSelect}
              onAddToCanvas={handleAddToCanvas}
              onEdit={onSelect}
              onRemove={handleRemoveItem}
              onImageError={markBrokenImage}
              onClearSelection={clearSelection}
              onBulkDelete={handleBulkDelete}
            />
          )}

          {/* Add View — extracted subcomponent */}
          {activeTab === 'add' && (
            <InventoryAddForm
              onItemAdded={handleItemAdded}
              onSwitchToList={() => setActiveTab('list')}
            />
          )}

          {/* Tools View — extracted subcomponent */}
          {activeTab === 'tools' && (
            <InventoryToolsPanel items={items} />
          )}

          {/* Macros View */}
          {activeTab === 'macros' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <MacroPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Inventory);
