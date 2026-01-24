import React, { useMemo } from 'react';
import { WiringDiagram } from '../../types';
import { diagramDiffService, DiffSet } from '../../services/diagramDiff';
import DiagramNode from './DiagramNode';
import { Wire } from './Wire';

interface DiffOverlayProps {
  baseDiagram: WiringDiagram;
  compareDiagram: WiringDiagram;
}

export const DiffOverlay: React.FC<DiffOverlayProps> = ({ baseDiagram, compareDiagram }) => {
  const diffSet = useMemo(() => 
    diagramDiffService.diff(baseDiagram, compareDiagram),
    [baseDiagram, compareDiagram]
  );

  return (
    <g className="diff-overlay">
      {/* 1. Removed Components (Ghost Red) */}
      {baseDiagram.components
        .filter(c => diffSet.removed.components.includes(c.id))
        .map(comp => (
          <g key={`removed-${comp.id}`} opacity={0.4} style={{ filter: 'grayscale(1) brightness(0.5)' }}>
            <DiagramNode
              component={comp}
              position={(comp as any).position || { x: 0, y: 0 }}
              isHovered={false}
              highlight={{ color: '#ef4444', pulse: false }}
              onPointerDown={() => {}}
              onPinPointerDown={() => {}}
              onPinPointerUp={() => {}}
            />
            {/* Red X Overlay */}
            <line 
              x1={(comp as any).position?.x || 0} 
              y1={(comp as any).position?.y || 0} 
              x2={((comp as any).position?.x || 0) + 100} 
              y2={((comp as any).position?.y || 0) + 100} 
              stroke="#ef4444" 
              strokeWidth="2"
            />
          </g>
        ))}

      {/* 2. Added Components (Glow Green) */}
      {compareDiagram.components
        .filter(c => diffSet.added.components.includes(c.id))
        .map(comp => (
          <g key={`added-${comp.id}`}>
            <DiagramNode
              component={comp}
              position={(comp as any).position || { x: 0, y: 0 }}
              isHovered={false}
              highlight={{ color: '#00ff9d', pulse: true }}
              onPointerDown={() => {}}
              onPinPointerDown={() => {}}
              onPinPointerUp={() => {}}
            />
          </g>
        ))}

      {/* 3. Modified Components (Glow Amber) */}
      {compareDiagram.components
        .filter(c => diffSet.modified.components.includes(c.id))
        .map(comp => (
          <g key={`modified-${comp.id}`}>
            <DiagramNode
              component={comp}
              position={(comp as any).position || { x: 0, y: 0 }}
              isHovered={false}
              highlight={{ color: '#ffaa00', pulse: true }}
              onPointerDown={() => {}}
              onPinPointerDown={() => {}}
              onPinPointerUp={() => {}}
            />
          </g>
        ))}
    </g>
  );
};
