import React from 'react';

export const DropZoneOverlay = React.memo(() => (
  <div className="absolute inset-0 bg-neon-cyan/10 border-4 border-dashed border-neon-cyan/50 z-50 flex items-center justify-center pointer-events-none">
    <div className="bg-black/80 p-4 cut-corner-md border border-neon-cyan text-neon-cyan font-bold text-xl animate-pulse">
      DROP COMPONENT HERE
    </div>
  </div>
));

DropZoneOverlay.displayName = 'DropZoneOverlay';

export const EmptyDiagramOverlay = React.memo(() => (
  <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center text-slate-300 pointer-events-none px-4">
    <div className="w-16 h-16 cut-corner-md border border-neon-cyan/40 flex items-center justify-center text-neon-cyan/80">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-slate-100">Drop parts to start wiring.</h3>
      <p className="text-[11px] text-slate-300 max-w-xs">Build manually or let chat generate a full diagram.</p>
    </div>
    <ol className="text-[11px] text-slate-300 space-y-1">
      <li>1. Open the Asset Manager and pick a component.</li>
      <li>2. Drag it onto the canvas to place a node.</li>
      <li>3. Use chat to auto-route wiring.</li>
    </ol>
    <div className="text-[11px] text-slate-300">Tip: Hold space to pan, scroll to zoom.</div>
  </div>
));

EmptyDiagramOverlay.displayName = 'EmptyDiagramOverlay';

interface NoDiagramPlaceholderProps {
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

export const NoDiagramPlaceholder = React.forwardRef<HTMLDivElement, NoDiagramPlaceholderProps>(({
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
}, ref) => (
  <div
    ref={ref}
    className="w-full h-full flex items-center justify-center text-slate-300 font-mono flex-col relative"
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    {isDragOver && <DropZoneOverlay />}
    <svg className="w-24 h-24 mb-6 opacity-30 animate-pulse text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    <h3 className="text-xl font-bold text-slate-100 mb-2">No diagram yet.</h3>
    <p className="max-w-md text-center text-sm text-slate-300">Ask chat to generate a wiring diagram, or drag parts from the inventory to start manually.</p>
    <div className="text-[11px] text-slate-300 mt-3">Tip: Once parts are placed, you can search and filter by type.</div>
  </div>
));

NoDiagramPlaceholder.displayName = 'NoDiagramPlaceholder';
