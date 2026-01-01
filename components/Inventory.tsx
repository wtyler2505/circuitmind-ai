import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ElectronicComponent } from '../types';

// Type alias for component types
type ComponentType = ElectronicComponent['type'];

import {
  identifyComponentFromImage,
  suggestProjectsFromInventory,
  findComponentSpecs,
  generateComponentThumbnail,
} from '../services/geminiService';

interface InventoryProps {
  items: ElectronicComponent[];
  onAddItem: (item: ElectronicComponent) => void;
  onRemoveItem: (id: string) => void;
  onSelect: (item: ElectronicComponent) => void;
  onUpdateItem: (item: ElectronicComponent) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  onOpen: () => void;
  onClose: () => void;
  onDeleteMany?: (ids: string[]) => void;
  onUpdateMany?: (items: ElectronicComponent[]) => void;
  onReset?: () => void;
  onAddToCanvas?: (item: ElectronicComponent) => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  defaultPinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
}

const CATEGORIES = ['microcontroller', 'sensor', 'actuator', 'power', 'other'] as const;

// Helper to resize images to avoid LocalStorage Quota Exceeded
const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; // Prevent transparency issues
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG 70%
      } else {
        resolve(base64Str); // Fallback
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// Helper for type icons
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'microcontroller':
      return 'M';
    case 'sensor':
      return 'S';
    case 'actuator':
      return 'A';
    case 'power':
      return 'P';
    default:
      return 'O';
  }
};

const Inventory: React.FC<InventoryProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onSelect,
  onUpdateItem,
  isOpen,
  toggleOpen: _toggleOpen, // Currently unused - panel controlled via onOpen/onClose
  onOpen,
  onClose,
  onDeleteMany,
  onUpdateMany,
  onReset,
  onAddToCanvas,
  sidebarWidth = 360,
  onSidebarWidthChange,
  minSidebarWidth = 280,
  maxSidebarWidth = 520,
  defaultPinned = false,
  onPinnedChange,
}) => {
  // Refs for click outside detection
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Timer for hover delay
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // Pin State for "Locking" the sidebar
  const [isPinned, setIsPinned] = useState(defaultPinned);

  // Tabs: 'list', 'add', 'tools'
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'tools'>('list');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [newItemImage, setNewItemImage] = useState<string>(''); // Base64
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Part Finder State
  const [finderQuery, setFinderQuery] = useState('');
  const [finderResults, setFinderResults] = useState<Partial<ElectronicComponent>[]>([]);
  const [isFinderLoading, setIsFinderLoading] = useState(false);

  // Tools State
  const [suggestions, setSuggestions] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Hover Handlers
  const handleMouseEnter = () => {
    // If pinned, we are already open, just clear any close timer if it exists (e.g. from a quick unpin-hover sequence)
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // Only trigger open if not already open (though onOpen usually handles idempotency)
    // Note: If pinned, isOpen is likely true.
    onOpen();
  };

  const handleMouseLeave = () => {
    // Only auto-close if NOT pinned
    if (!isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const updatePinned = (pinned: boolean) => {
    setIsPinned(pinned);
    onPinnedChange?.(pinned);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      // If locked open -> Unlock and Close
      updatePinned(false);
      onClose();
    } else {
      // If not locked -> Lock and Open
      updatePinned(true);
      onOpen();
    }
  };

  // Handle Click Outside to Auto-Close (Fallback for clicks)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If pinned, do NOT close on click outside (unless we want to unpin? Standard "modal" behavior vs "sidebar" behavior)
      // Requirement: "auto hide when mouseclick anywhere outside... when visible"
      // BUT also "toggle lock... when clicked".
      // Interpreted: "Lock" prevents auto-hide from *hover* leave. Click outside might still close it?
      // Usually "Lock" means persistent. Let's assume Pinned = Persistent.
      // If NOT pinned, click outside closes.
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
      // Cleanup timer on unmount
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen, onClose, isPinned]);

  useEffect(() => {
    setIsPinned(defaultPinned);
    if (defaultPinned) {
      onOpen();
    }
  }, [defaultPinned, onOpen]);

  const clampSidebarWidth = (value: number) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value));

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSidebarWidthChange) return;
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

  // Drag State
  const handleDragStart = (e: React.DragEvent, item: ElectronicComponent) => {
    e.dataTransfer.setData('application/react-component-id', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const markBrokenImage = (id: string, url?: string) => {
    if (!url) return;
    setBrokenImages((prev) => (prev[id] === url ? prev : { ...prev, [id]: url }));
  };

  // --- Bulk Actions ---

  const handleBulkDelete = () => {
    if (!onDeleteMany) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
      onDeleteMany(Array.from(selectedIds));
      clearSelection();
    }
  };

  const handleBulkLowStock = () => {
    if (!onUpdateMany) return;
    const updates: ElectronicComponent[] = [];
    selectedIds.forEach((id) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        updates.push({ ...item, lowStock: true });
      }
    });
    onUpdateMany(updates);
    clearSelection();
  };

  const handleBulkExport = () => {
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedItems, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'selected_inventory.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    clearSelection();
  };

  // --- AI Features ---

  const handleFinderSearch = async () => {
    if (!finderQuery) return;
    setIsFinderLoading(true);
    try {
      const results = await findComponentSpecs(finderQuery);
      setFinderResults(results);
    } catch (e) {
      console.error(e);
      alert('Search failed. Please try again.');
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
        // Compress image before storing or processing to save bandwidth/storage
        const compressedBase64 = await resizeImage(base64);

        setNewItemImage(compressedBase64);

        const data = await identifyComponentFromImage(compressedBase64);
        if (data.name) setNewItemName(data.name);
        if (data.type) setNewItemType(data.type);
        if (data.description) setNewItemDesc(data.description);
        if (data.pins) setNewItemPins(data.pins.join(', '));
      } catch (_e) {
        alert('Could not identify component from image.');
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
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleQuickThumbnail = async (item: ElectronicComponent) => {
    if (confirm(`Generate AI thumbnail for ${item.name}? This may take a few seconds.`)) {
      try {
        const base64 = await generateComponentThumbnail(item.name);
        const updated = { ...item, imageUrl: `data:image/png;base64,${base64}` };
        onUpdateItem(updated);
      } catch (e) {
        console.error(e);
        alert('Failed to generate thumbnail.');
      }
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
      imageUrl: newItemImage, // Persist the image
    };
    onAddItem(newItem);

    // Reset form
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
            if (item.name && item.id) onAddItem(item);
          });
          alert(`Imported ${imported.length} items.`);
        }
      } catch (_err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // --- Categorization Logic ---
  const categorizedItems = useMemo(() => {
    const groups: Record<string, ElectronicComponent[]> = {};
    CATEGORIES.forEach((c) => (groups[c] = []));

    items.forEach((item) => {
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        if (groups[item.type]) {
          groups[item.type].push(item);
        } else {
          groups['other'].push(item);
        }
      }
    });
    return groups;
  }, [items, searchQuery]);

  return (
    <>
      {/* Desktop Toggle Button - Hidden on mobile */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex flex-col items-center justify-center fixed left-0 top-1/2 z-50 bg-cyber-card border-r border-y border-neon-cyan/30 h-16 w-11 rounded-r-lg text-neon-cyan transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
        style={{ transform: `translate(${isOpen ? sidebarWidth : 0}px, -50%)` }}
        title={isPinned ? 'Unlock Inventory' : 'Inventory'}
        aria-label={isPinned ? 'Unlock inventory' : 'Open inventory'}
      >
        {isPinned ? (
          <svg
            className="w-5 h-5 text-neon-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Main Drawer Container - Full width on mobile, Fixed width on desktop */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 w-full md:w-[var(--inventory-width)] bg-cyber-dark/95 backdrop-blur-xl border-r border-slate-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]`}
        style={{ '--inventory-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div
          className="group absolute right-0 top-0 hidden h-full w-2 cursor-ew-resize md:block"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize inventory sidebar"
        >
          <div className="h-full w-[3px] bg-neon-cyan/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-transparent flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-sans text-white mb-1 flex items-center gap-2 uppercase tracking-[0.3em]">
              <svg
                className="w-5 h-5 text-neon-cyan"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              ASSET MANAGER
            </h2>
            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden h-11 w-11 inline-flex items-center justify-center text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
              title="Close inventory"
              aria-label="Close inventory"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {/* Desktop Pin Button inside header */}
            <button
              type="button"
              onClick={() => updatePinned(!isPinned)}
              className="hidden md:inline-flex h-11 w-11 items-center justify-center text-slate-500 hover:text-neon-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
              title={isPinned ? 'Unlock sidebar' : 'Lock sidebar open'}
              aria-label={isPinned ? 'Unlock sidebar' : 'Lock sidebar open'}
            >
              {isPinned ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-mono tracking-[0.3em] uppercase mb-2">
            Total Assets: {items.reduce((acc, curr) => acc + (curr.quantity || 1), 0)} Units
          </p>

          {/* Tabs */}
          <div className="flex bg-slate-950/70 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all tracking-[0.2em] ${activeTab === 'list' ? 'bg-neon-cyan text-black shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              LIST
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all tracking-[0.2em] ${activeTab === 'add' ? 'bg-neon-cyan text-black shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              ADD NEW
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all tracking-[0.2em] ${activeTab === 'tools' ? 'bg-neon-cyan text-black shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              TOOLS
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-grid-white/[0.02] relative">
          {/* --- LIST VIEW --- */}
          {activeTab === 'list' && (
            <div className="p-4 space-y-4 pb-24 md:pb-20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan transition-colors"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {selectedIds.size > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase tracking-widest text-slate-300">
                      {selectedIds.size} selected
                    </span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-[10px] text-slate-300 hover:text-white transition-colors"
                      aria-label="Clear selection"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleBulkExport}
                      className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-neon-cyan/60 transition-colors"
                      aria-label="Export selected"
                    >
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkLowStock}
                      disabled={!onUpdateMany}
                      className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-amber-400/60 transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
                      aria-label="Mark selected low stock"
                    >
                      Mark Low Stock
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={!onDeleteMany}
                      className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-red-400/60 transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
                      aria-label="Delete selected"
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
                  <div key={cat} className="animate-fade-in">
                    <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1 sticky top-0 bg-cyber-dark/95 backdrop-blur z-10 flex justify-between">
                      {cat} <span className="text-neon-cyan">{catItems.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {catItems.map((item) => {
                        const isThumbnailBroken =
                          !!item.imageUrl && brokenImages[item.id] === item.imageUrl;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDoubleClick={() => onSelect(item)}
                            className={`group relative border p-2 rounded cursor-grab active:cursor-grabbing transition-all flex justify-between items-start ${selectedIds.has(item.id) ? 'bg-neon-cyan/10 border-neon-cyan' : 'bg-slate-800/40 border-slate-700/50 hover:border-neon-cyan/50 hover:bg-slate-800'}`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelection(item.id)}
                                className="mt-1 w-4 h-4 rounded border-slate-600 text-neon-cyan focus:ring-neon-cyan bg-slate-900 cursor-pointer shrink-0"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select ${item.name}`}
                              />

                              {/* Component Image/Thumbnail */}
                              <div className="w-10 h-10 rounded bg-black/50 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.imageUrl && !isThumbnailBroken ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => markBrokenImage(item.id, item.imageUrl)}
                                  />
                                ) : (
                                  <span className="text-slate-400 font-mono font-bold">
                                    {getTypeIcon(item.type)}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-200 text-sm group-hover:text-neon-cyan transition-colors flex items-center gap-2">
                                  <span className="truncate" title={item.name}>
                                    {item.name}
                                  </span>
                                  {item.lowStock && (
                                    <span
                                      className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded border border-red-500/50 shrink-0"
                                      title="Low Stock"
                                    >
                                      LOW
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="text-[10px] text-slate-300 mt-0.5 truncate"
                                  title={item.description}
                                >
                                  {item.description}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {item.pins && item.pins.length > 0 && (
                                    <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                                      {item.pins.length} PINS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
                              <div
                                className="flex items-center gap-0.5 bg-slate-950 border border-slate-700 rounded overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-1.5 py-0.5 text-[10px] transition-colors"
                                  onClick={() => {
                                    const newQty = (item.quantity || 0) - 1;
                                    if (newQty >= 0) onUpdateItem({ ...item, quantity: newQty });
                                  }}
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-mono text-neon-cyan w-6 text-center bg-slate-900 py-0.5 border-x border-slate-800">
                                  {item.quantity || 0}
                                </span>
                                <button
                                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-1.5 py-0.5 text-[10px] transition-colors"
                                  onClick={() =>
                                    onUpdateItem({ ...item, quantity: (item.quantity || 0) + 1 })
                                  }
                                >
                                  +
                                </button>
                              </div>
                              {/* Action Buttons - Always visible on mobile, hover on desktop */}
                              <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCanvas?.(item);
                                  }}
                                  className="h-11 w-11 inline-flex items-center justify-center text-neon-green hover:text-white bg-neon-green/10 hover:bg-neon-green/20 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50"
                                  title="Add to diagram"
                                  aria-label="Add to diagram"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickThumbnail(item);
                                  }}
                                  className="h-11 w-11 inline-flex items-center justify-center text-slate-500 hover:text-neon-amber rounded hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-amber/50"
                                  title="Generate Thumbnail"
                                  aria-label="Generate thumbnail"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(item);
                                  }}
                                  className="h-11 w-11 inline-flex items-center justify-center text-slate-500 hover:text-neon-cyan rounded hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50"
                                  title="Edit details"
                                  aria-label="Edit details"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      window.confirm('Are you sure you want to delete this item?')
                                    ) {
                                      onRemoveItem(item.id);
                                    }
                                  }}
                                  className="h-11 w-11 inline-flex items-center justify-center text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                                  title="Delete item"
                                  aria-label="Delete item"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                </button>
                              </div>
                            </div>
                            {/* Drag Handle Indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan/0 group-hover:bg-neon-cyan/50 rounded-l transition-colors"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- ADD NEW VIEW --- */}
          {activeTab === 'add' && (
            <div className="p-4 space-y-4">
              {/* Part Finder Section */}
              <div className="bg-slate-900/80 border border-neon-cyan/20 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neon-cyan flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
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
                    placeholder="Describe part (e.g., 'wemos d1' or 'temp sensor')"
                    className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none"
                  />
                  <button
                    onClick={handleFinderSearch}
                    disabled={isFinderLoading || !finderQuery}
                    className="bg-neon-cyan text-black font-bold px-3 py-2 rounded text-xs hover:bg-white disabled:opacity-80"
                  >
                    {isFinderLoading ? '...' : 'FIND'}
                  </button>
                </div>

                {/* Finder Results */}
                {finderResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar border-t border-slate-800 pt-2">
                    <p className="text-[10px] text-slate-300 mb-1">Select a match to auto-fill:</p>
                    {finderResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectFinderResult(result)}
                        className="w-full text-left p-2 rounded bg-slate-800/50 hover:bg-neon-cyan/20 border border-transparent hover:border-neon-cyan/50 transition-colors group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-white group-hover:text-neon-cyan">
                            {result.name}
                          </span>
                          <span className="text-[9px] uppercase text-slate-300 bg-black/30 px-1 rounded">
                            {result.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          {result.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-700 text-center relative overflow-hidden group">
                <div className="flex items-center justify-between text-left mb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Photo Scan</span>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Optional</span>
                </div>
                {newItemImage && (
                  <div className="absolute inset-0 bg-black z-0">
                    <img
                      src={newItemImage}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageScan}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAiLoading}
                  className="w-full py-4 flex flex-col items-center gap-2 text-slate-300 hover:text-neon-cyan transition-colors relative z-10"
                >
                  {isAiLoading ? (
                    <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-8 h-8 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider shadow-black drop-shadow-md">
                    {isAiLoading
                      ? 'ANALYZING...'
                      : newItemImage
                        ? 'RETAKE PHOTO'
                        : 'SCAN COMPONENT PHOTO'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-300 mt-2 relative z-10">
                  Tip: A clear top-down photo helps auto-fill name, type, and pins.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                    Basics
                  </h4>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                    Required
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    COMPONENT NAME
                    <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                      Required
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., NE555 Timer"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateImage}
                      disabled={!newItemName || isGeneratingImage}
                      title="Auto-generate product image"
                      aria-label="Auto-generate product image"
                      className="h-11 w-11 inline-flex items-center justify-center bg-slate-800 border border-slate-600 text-neon-purple rounded hover:bg-slate-700 hover:border-neon-purple disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50"
                    >
                      {isGeneratingImage ? (
                        <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      TYPE
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Required
                      </span>
                    </label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value as ComponentType)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      QTY
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Required
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                    Details
                  </h4>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                    Optional
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    DESCRIPTION
                    <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                      Optional
                    </span>
                  </label>
                  <textarea
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    rows={2}
                    placeholder="Short summary for inventory and AI suggestions..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                    Pins
                  </h4>
                  <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                    Optional
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    PINS
                    <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                      Optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newItemPins}
                    onChange={(e) => setNewItemPins(e.target.value)}
                    placeholder="Comma separated: VCC, GND, OUT..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-300 focus:border-neon-cyan focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-300 mt-2">
                    Pin labels surface on the wiring canvas and AI suggestions.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newItemName}
                className="w-full bg-neon-cyan text-black font-bold py-3 rounded hover:bg-white transition-colors uppercase tracking-widest text-xs shadow-lg disabled:opacity-80 disabled:cursor-not-allowed"
              >
                ADD TO INVENTORY
              </button>
            </div>
          )}

          {/* --- TOOLS VIEW --- */}
          {activeTab === 'tools' && (
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-3 border-b border-slate-800 pb-1">
                  DATA MANAGEMENT
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded border border-slate-600 flex flex-col items-center gap-1"
                  >
                    <svg
                      className="w-5 h-5 text-neon-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="text-[10px] font-bold">EXPORT JSON</span>
                  </button>
                  <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded border border-slate-600 flex flex-col items-center gap-1 cursor-pointer">
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    <svg
                      className="w-5 h-5 text-neon-purple"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <span className="text-[10px] font-bold">IMPORT JSON</span>
                  </label>
                </div>

                {onReset && (
                  <div className="mt-2">
                    <button
                      onClick={onReset}
                      className="w-full bg-red-900/20 hover:bg-red-900/50 text-red-400 py-2 rounded border border-red-900/50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                      <span className="text-[10px] font-bold">RESET TO DEFAULTS</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-3 border-b border-slate-800 pb-1">
                  AI ANALYSIS
                </h3>
                <button
                  onClick={handleSuggestProjects}
                  disabled={isSuggesting}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-left p-3 rounded border border-slate-600 group"
                >
                  <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    {isSuggesting ? 'THINKING...' : 'WHAT CAN I BUILD?'}
                  </div>
                  <div className="text-[10px] text-slate-300 group-hover:text-white">
                    Ask Gemini to suggest projects based on your current inventory.
                  </div>
                </button>

                {suggestions && (
                  <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 markdown prose prose-invert max-w-none">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-neon-purple font-mono uppercase">
                        Ideas
                      </span>
                      <button
                        onClick={() => setSuggestions('')}
                        className="text-slate-300 hover:text-white"
                      >
                        &times;
                      </button>
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

export default Inventory;
