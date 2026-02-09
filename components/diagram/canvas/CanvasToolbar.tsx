import React from 'react';
import type { DiagramAction } from '../diagramState';

type ViewMode = '2d' | '3d';

interface CanvasToolbarProps {
  dispatch: React.Dispatch<DiagramAction>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  snapToGrid: boolean;
  onSnapToggle: () => void;
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  onOpenExport: () => void;
  zoom: number;
}

const CanvasToolbar = React.memo(({
  dispatch,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  snapToGrid,
  onSnapToggle,
  viewMode,
  onViewModeToggle,
  onOpenExport,
  zoom,
}: CanvasToolbarProps) => {
  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute top-16 right-4 md:top-4 md:right-4 flex flex-col gap-2 z-10 pointer-events-auto panel-flourish">
        <button
          type="button"
          onClick={() => dispatch({ type: 'ZOOM_IN', payload: 0.2 })}
          className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <img src="/assets/ui/action-zoom-in.webp" alt="" className="w-5 h-5 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:block leading-none">Zoom In</span>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ZOOM_OUT', payload: 0.2 })}
          className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <img src="/assets/ui/action-zoom-out.webp" alt="" className="w-5 h-5 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:block leading-none">Zoom Out</span>
        </button>
        <div
          className="control-tile cut-corner-sm h-8 min-w-[44px] px-2 inline-flex items-center justify-center text-[10px] font-mono font-bold text-neon-cyan border border-slate-700/70 shadow-lg select-none"
          title={`Zoom: ${Math.round(zoom * 100)}%`}
          aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
        >
          {Math.round(zoom * 100)}%
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET_VIEW' })}
          className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
          title="Reset View"
          aria-label="Reset view"
        >
          <img src="/assets/ui/action-load.webp" alt="" className="w-5 h-5 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:block leading-none">Reset</span>
        </button>
      </div>

      {/* Left Toolbar */}
      <div className="absolute top-16 left-4 md:top-4 md:left-4 z-10 flex flex-col gap-1.5 max-w-[170px] md:max-w-[220px] pointer-events-auto">
        <div className="text-[8px] uppercase tracking-[0.24em] text-slate-500">Canvas tools</div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Search</span>
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-slate-950/85 backdrop-blur border border-slate-700/80 cut-corner-sm px-2.5 py-1.5 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-neon-cyan shadow-lg"
            aria-label="Search components"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Type</span>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-slate-950/85 backdrop-blur border border-slate-700/80 cut-corner-sm px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-neon-cyan shadow-lg cursor-pointer"
            aria-label="Filter by component type"
            title="Filter by component type"
          >
            <option value="all">All Types</option>
            <option value="microcontroller">Microcontrollers</option>
            <option value="sensor">Sensors</option>
            <option value="actuator">Actuators</option>
            <option value="power">Power</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onSnapToggle}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg transition-colors ${
            snapToGrid
              ? 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan'
              : 'bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
          }`}
          title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
          aria-pressed={snapToGrid}
        >
          <img src="/assets/ui/action-grid.webp" alt="" className={`w-4 h-4 ${snapToGrid ? '' : 'opacity-70'}`} onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:inline">{snapToGrid ? 'Grid ON' : 'Grid OFF'}</span>
        </button>
        <button
          type="button"
          onClick={onViewModeToggle}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg transition-colors ${
            viewMode === '3d'
              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
              : 'bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-purple-500'
          }`}
          title={viewMode === '3d' ? 'Switch to 2D View' : 'Switch to 3D View'}
          aria-pressed={viewMode === '3d'}
        >
          <img src={`/assets/ui/${viewMode === '3d' ? 'action-2d' : 'action-3d'}.webp`} alt="" className={`w-4 h-4 ${viewMode === '3d' ? 'opacity-90' : 'opacity-70'}`} onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:inline">{viewMode === '3d' ? '2D' : '3D'}</span>
        </button>
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg transition-colors bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-neon-cyan"
          title="Export diagram"
        >
          <img src="/assets/ui/action-save.webp" alt="" className="w-4 h-4 opacity-80 invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="hidden md:inline">Export</span>
        </button>
      </div>
    </>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';

export default CanvasToolbar;
