import React from 'react';
import type { ElectronicComponent } from '../../../types';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT } from '../index';

interface DiagramBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

interface CanvasMinimapProps {
  filteredComponents: ElectronicComponent[];
  nodePositions: Map<string, { x: number; y: number }>;
  diagramBounds: DiagramBounds;
  pan: { x: number; y: number };
  zoom: number;
  containerRect: { width: number; height: number } | null;
  showMinimap: boolean;
  onMinimapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onToggleMinimap: (show: boolean) => void;
}

const COMPONENT_COLORS: Record<string, string> = {
  microcontroller: '#00979D',
  sensor: '#6D28D9',
  actuator: '#E62C2E',
  power: '#22C55E',
};

const CanvasMinimap = React.memo(({
  filteredComponents,
  nodePositions,
  diagramBounds,
  pan,
  zoom,
  containerRect,
  showMinimap,
  onMinimapClick,
  onToggleMinimap,
}: CanvasMinimapProps) => {
  if (filteredComponents.length === 0) return null;

  if (!showMinimap) {
    return (
      <button
        type="button"
        onClick={() => onToggleMinimap(true)}
        className="absolute bottom-4 right-4 z-10 pointer-events-auto w-10 h-10 cut-corner-sm bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg flex items-center justify-center"
        title="Show minimap"
        aria-label="Show minimap"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" />
          <rect x="14" y="14" width="6" height="6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
      <button
        type="button"
        onClick={() => onToggleMinimap(false)}
        className="absolute -top-3 -right-3 h-8 w-8 cut-corner-sm bg-slate-900/90 border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 z-10 flex items-center justify-center"
        title="Hide minimap"
        aria-label="Hide minimap"
      >
        x
      </button>
      <div
        className="w-40 h-24 bg-slate-900/95 border border-slate-600 cut-corner-md overflow-hidden cursor-pointer shadow-xl"
        onClick={onMinimapClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMinimapClick(e as unknown as React.MouseEvent<HTMLDivElement>); } }}
        role="button"
        tabIndex={0}
        aria-label="Navigate diagram via minimap"
      >
        <svg
          className="w-full h-full"
          viewBox={`${diagramBounds.minX} ${diagramBounds.minY} ${diagramBounds.width} ${diagramBounds.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x={diagramBounds.minX} y={diagramBounds.minY} width={diagramBounds.width} height={diagramBounds.height} fill="#0f172a" />
          {filteredComponents.map((comp) => {
            const pos = nodePositions.get(comp.id);
            if (!pos) return null;
            const color = COMPONENT_COLORS[comp.type] || '#475569';
            return <rect key={comp.id} x={pos.x} y={pos.y} width={COMPONENT_WIDTH} height={COMPONENT_HEIGHT} fill={color} opacity="0.8" />;
          })}
          {containerRect && (
            <rect
              x={-pan.x / zoom}
              y={-pan.y / zoom}
              width={containerRect.width / zoom}
              height={containerRect.height / zoom}
              fill="none"
              stroke="#00F3FF"
              strokeWidth={Math.max(2, 4 / zoom)}
              opacity="0.8"
            />
          )}
        </svg>
      </div>
    </div>
  );
});

CanvasMinimap.displayName = 'CanvasMinimap';

export default CanvasMinimap;
