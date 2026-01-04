import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ElectronicComponent } from '../types';
import { useToast } from '../hooks/useToast';
import { useInventory } from '../contexts/InventoryContext';
import { useLayout } from '../contexts/LayoutContext';
import { useDiagram } from '../contexts/DiagramContext';
import { determineOrphanAction } from '../services/componentValidator';
import { INITIAL_INVENTORY } from '../data/initialInventory';
import InventoryList from './inventory/InventoryList';
import { resizeImage } from './inventory/inventoryUtils';

import {
  identifyComponentFromImage,
  suggestProjectsFromInventory,
  findComponentSpecs,
  generateComponentThumbnail,
} from '../services/geminiService';

// Type alias for component types
type ComponentType = ElectronicComponent['type'];

interface InventoryProps {
  onSelect: (item: ElectronicComponent) => void;
}

const CATEGORIES = ['microcontroller', 'sensor', 'actuator', 'power', 'other'] as const;

const Inventory: React.FC<InventoryProps> = ({ onSelect }) => {
  const { 
    inventory: items, 
    addItem, 
    removeItem, 
    removeMany, 
    updateMany,
    setInventory 
  } = useInventory();

  const {
    isInventoryOpen: isOpen,
    setInventoryOpen: onOpen, // We use setInventoryOpen(true) as onOpen
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

  // Tabs: 'list', 'add', 'tools'
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'tools'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ComponentType | 'all'>('all');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [brokenImages, setBrokenImages] = useState<Record<string, string>>({});

  // Add Item State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<ElectronicComponent['type']>('other');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPins, setNewItemPins] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Part Finder State
  const [finderQuery, setFinderQuery] = useState('');
  const [finderResults, setFinderResults] = useState<Partial<ElectronicComponent>[]>([]);
  const [isFinderLoading, setIsFinderLoading] = useState(false);

  // Tools State
  const [suggestions, setSuggestions] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // --- Logic Extraction from App.tsx ---

  const handleReset = () => {
    if (window.confirm('Reset inventory to default tier 5 kit? This will replace your current inventory.')) {
      setInventory(INITIAL_INVENTORY);
      toast.success('Inventory reset to defaults.');
    }
  };

  // Wrapped in useCallback to prevent re-renders of InventoryList
  const handleAddToCanvas = useCallback((item: ElectronicComponent) => {
    const newInstance: ElectronicComponent = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      sourceInventoryId: item.id,
    };

    // We can't access diagram state inside useCallback if we want it stable.
    // However, react state updaters accept a function.
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
    // We need current diagram state. Since we can't get it synchronously without dependency,
    // we might have to settle for dependency or use a ref.
    // For now, let's use the diagram from context, but understand it might cause re-renders.
    // Optimization: The effect on list is minimal if filtered list is memoized.
    
    // Actually, determineOrphanAction needs the diagram.
    // Let's defer the check? No, user interaction needs immediate feedback.
    // We'll use the diagram dependency.
    const currentDiagram = diagram || { title: '', components: [], connections: [], explanation: '' };
    const { action, reason } = determineOrphanAction(id, currentDiagram);

    if (action === 'block') {
      console.error(`❌ Cannot delete: ${reason}`);
      toast.error(reason);
      return;
    }

    if (action === 'warn') {
      const confirmed = window.confirm(
        `⚠️ ${reason}\n\nDo you want to remove it from all diagrams?`
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
      const { action, reason } = determineOrphanAction(id, currentDiagram);
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

  // --- End Logic Extraction ---

  // Hover Handlers
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onSidebarOpen();
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (
      nextTarget &&
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
      onSidebarWidthChange(clampSidebarWidth(defaultSidebarWidth));
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

  // --- AI Features ---

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
    setFinderResults([]); // Clear results after selection
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

  const handleSuggestProjects = async () => {
    setIsSuggesting(true);
    const text = await suggestProjectsFromInventory(items);
    setSuggestions(text);
    setIsSuggesting(false);
  };

  // --- CRUD ---

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
    addItem(newItem);

    setNewItemName('');
    setNewItemDesc('');
    setNewItemPins('');
    setNewItemQty(1);
    setNewItemImage('');
    setActiveTab('list');
  };

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'inventory_backup.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported)) {
          imported.forEach((item) => {
            if (item.name && item.id) addItem(item);
          });
          toast.success(`Imported ${imported.length} items.`);
        }
      } catch (_err) {
        toast.error('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

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
        {isPinned ? (
          <svg className="w-4 h-4 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="Inventory sidebar"
        className={`!fixed inset-y-0 left-0 w-[var(--inventory-width)] max-md:w-full panel-surface panel-rail panel-frame panel-circuit cut-corner-md border-r border-slate-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.8)]`}
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
        
        <div className="px-3 pt-3 pb-0 bg-[#050608] border-b border-white/5 flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] panel-title">
              <span className="text-neon-cyan">///</span>
              ASSET MANAGER
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onClose}
                className="md:hidden h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-white border border-transparent hover:border-white/20 cut-corner-sm"
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
                className={`hidden md:inline-flex h-6 w-6 items-center justify-center transition-colors cut-corner-sm border ${ isPinned 
                    ? 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5' 
                    : 'text-slate-500 border-transparent hover:text-white hover:border-white/20'
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
            <div className="bg-white/5 border border-white/5 px-2 py-1 flex items-center justify-between">
              <span className="text-slate-500">Total</span>
              <span className="text-neon-cyan">{inventoryStats.totalUnits}</span>
            </div>
            <div className="bg-white/5 border border-white/5 px-2 py-1 flex items-center justify-between">
              <span className="text-slate-500">Low Stock</span>
              <span className={inventoryStats.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}>
                {inventoryStats.lowStockCount}
              </span>
            </div>
          </div>

          <div className="flex border-b border-white/5 mt-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-colors border-b-2 ${ activeTab === 'list' 
                  ? 'border-neon-cyan text-white bg-white/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              ASSETS
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-colors border-b-2 ${ activeTab === 'add' 
                  ? 'border-neon-green text-white bg-white/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-2 text-[9px] font-bold tracking-[0.2em] transition-colors border-b-2 ${ activeTab === 'tools' 
                  ? 'border-neon-purple text-white bg-white/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              TOOLS
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#020203]">
          {/* List View */}
          {activeTab === 'list' && (
            <div className="p-2 space-y-2 pb-20 md:pb-16">
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2 py-1 text-[9px] uppercase tracking-wider border cut-corner-sm transition-all ${ activeCategory === 'all'
                      ? 'border-neon-cyan text-black bg-neon-cyan'
                      : 'border-white/10 text-slate-400 bg-black/20 hover:border-white/30'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-1 text-[9px] uppercase tracking-wider border cut-corner-sm transition-all ${ activeCategory === cat
                        ? 'border-neon-cyan text-black bg-neon-cyan'
                        : 'border-white/10 text-slate-400 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="FILTER ID / NAME..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-3 py-2 text-[10px] text-white placeholder-slate-600 focus:border-neon-cyan focus:outline-none transition-colors cut-corner-sm font-mono tracking-wide"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <InventoryList
                items={items}
                searchQuery={searchQuery}
                activeCategory={activeCategory}
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
            </div>
          )}

          {/* Add View */}
          {activeTab === 'add' && (
            <div className="p-3 space-y-4">
              <div className="bg-slate-900/80 border border-neon-cyan/20 p-3 cut-corner-md space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neon-cyan flex items-center gap-2 uppercase tracking-[0.2em]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    PART FINDER
                  </label>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Optional</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={finderQuery}
                    onChange={(e) => setFinderQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFinderSearch()}
                    placeholder="Describe part..."
                    className="flex-1 bg-black border border-slate-700 cut-corner-sm px-3 py-1.5 text-[11px] text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none"
                  />
                  <button
                    onClick={handleFinderSearch}
                    disabled={isFinderLoading || !finderQuery}
                    className="bg-neon-cyan text-black font-bold px-3 py-1.5 cut-corner-sm text-[11px] tracking-[0.2em] hover:bg-white disabled:opacity-80"
                  >
                    {isFinderLoading ? '...' : 'FIND'}
                  </button>
                </div>
                {finderResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar border-t border-slate-800 pt-2">
                    {finderResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectFinderResult(result)}
                        className="w-full text-left p-1.5 cut-corner-sm bg-slate-800/50 hover:bg-neon-cyan/20 border border-transparent hover:border-neon-cyan/50 transition-colors group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-white group-hover:text-neon-cyan">
                            {result.name}
                          </span>
                          <span className="text-[9px] uppercase text-slate-300 bg-black/30 px-1 cut-corner-sm">
                            {result.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 p-3 cut-corner-md border border-dashed border-slate-700 text-center relative overflow-hidden group">
                {newItemImage && (
                  <div className="absolute inset-0 bg-black z-0">
                    <img src={newItemImage} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageScan} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAiLoading}
                  className="w-full py-3 flex flex-col items-center gap-2 text-slate-300 hover:text-neon-cyan transition-colors relative z-10"
                >
                  {isAiLoading ? (
                    <div className="w-7 h-7 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider shadow-black drop-shadow-md">
                    {isAiLoading ? 'ANALYZING...' : newItemImage ? 'RETAKE PHOTO' : 'SCAN COMPONENT PHOTO'}
                  </span>
                </button>
              </div>

              <div className="cut-corner-md border border-slate-800/80 bg-slate-900/40 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Basics</h4>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Required</span>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">COMPONENT NAME</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., NE555 Timer"
                      className="flex-1 bg-slate-950 border border-slate-700 cut-corner-sm px-3 py-1.5 text-[11px] text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateImage}
                      disabled={!newItemName || isGeneratingImage}
                      className="h-9 w-9 inline-flex items-center justify-center bg-slate-800 border border-slate-600 text-neon-purple cut-corner-sm hover:bg-slate-700"
                    >
                      {isGeneratingImage ? (
                        <div className="w-3.5 h-3.5 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
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
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">TYPE</label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value as ComponentType)}
                      className="w-full bg-slate-950 border border-slate-700 cut-corner-sm px-2 py-1.5 text-[11px] text-white focus:border-neon-cyan focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">QTY</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 cut-corner-sm px-2 py-1.5 text-[11px] text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="cut-corner-md border border-slate-800/80 bg-slate-900/40 p-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">DESCRIPTION</label>
                  <textarea
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    rows={2}
                    placeholder="Short summary..."
                    className="w-full bg-slate-950 border border-slate-700 cut-corner-sm px-3 py-1.5 text-[11px] text-white resize-none focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">PINS</label>
                  <input
                    type="text"
                    value={newItemPins}
                    onChange={(e) => setNewItemPins(e.target.value)}
                    placeholder="VCC, GND, OUT..."
                    className="w-full bg-slate-950 border border-slate-700 cut-corner-sm px-3 py-1.5 text-[11px] text-white font-mono focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newItemName}
                className="w-full bg-neon-cyan text-black font-bold py-2.5 cut-corner-sm hover:bg-white transition-colors uppercase tracking-[0.25em] text-[11px] shadow-lg disabled:opacity-80 disabled:cursor-not-allowed"
              >
                ADD TO INVENTORY
              </button>
            </div>
          )}

          {/* Tools View */}
          {activeTab === 'tools' && (
            <div className="p-3 space-y-4">
              <div>
                <h3 className="text-[11px] font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1 uppercase tracking-[0.25em]">
                  DATA MANAGEMENT
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 cut-corner-sm border border-slate-600 flex flex-col items-center gap-1"
                  >
                    <svg className="w-4 h-4 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-[9px] font-bold tracking-[0.2em]">EXPORT JSON</span>
                  </button>
                  <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 cut-corner-sm border border-slate-600 flex flex-col items-center gap-1 cursor-pointer">
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    <svg className="w-4 h-4 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-[9px] font-bold tracking-[0.2em]">IMPORT JSON</span>
                  </label>
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleReset}
                    className="w-full bg-red-900/20 hover:bg-red-900/50 text-red-400 py-2 cut-corner-sm border border-red-900/50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-[10px] font-bold">RESET TO DEFAULTS</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1 uppercase tracking-[0.25em]">
                  AI ANALYSIS
                </h3>
                <button
                  onClick={handleSuggestProjects}
                  disabled={isSuggesting}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-left p-2.5 cut-corner-sm border border-slate-600 group"
                >
                  <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-[11px]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isSuggesting ? 'THINKING...' : 'WHAT CAN I BUILD?'}
                  </div>
                  <div className="text-[10px] text-slate-300 group-hover:text-white">
                    Ask Gemini to suggest projects based on your current inventory.
                  </div>
                </button>
                {suggestions && (
                  <div className="mt-3 p-2.5 bg-slate-900 border border-slate-700 cut-corner-sm text-[11px] text-slate-300 markdown prose prose-invert max-w-none">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-neon-purple font-mono uppercase">Ideas</span>
                      <button onClick={() => setSuggestions('')} className="text-slate-300 hover:text-white">&times;</button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{suggestions}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Inventory);
