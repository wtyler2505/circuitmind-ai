import React, { useMemo } from 'react';
import { WiringDiagram, ElectronicComponent } from '../../types';
import { diagramDiffService } from '../../services/diagramDiff';
import DiagramNode from './DiagramNode';

interface DiffOverlayProps {
  baseDiagram: WiringDiagram;
  compareDiagram: WiringDiagram;
  positions?: Map<string, { x: number; y: number }>;
}

export const DiffOverlay: React.FC<DiffOverlayProps> = ({ baseDiagram, compareDiagram, positions }) => {
  const diffSet = useMemo(() => 
    diagramDiffService.diff(baseDiagram, compareDiagram),
    [baseDiagram, compareDiagram]
  );

  const getPos = (comp: ElectronicComponent) => {
    if (positions && positions.has(comp.id)) {
      return positions.get(comp.id)!;
    }
    // Fallback if position is augmented on component (legacy/draft)
    return (comp as any).position || { x: 0, y: 0 };
  };

  return (
    <g className="diff-overlay">
      {/* 1. Removed Components (Ghost Red) */}
      {baseDiagram.components
        .filter(c => diffSet.removed.components.includes(c.id))
        .map(comp => {
          const pos = getPos(comp);
          return (
            <g key={`removed-${comp.id}`} opacity={0.4} style={{ filter: 'grayscale(1) brightness(0.5)' }}>
              <DiagramNode
                component={comp}
                position={pos}
                isHovered={false}
                highlight={{ color: '#ef4444', pulse: false }}
                onPointerDown={() => {}}
                onPinPointerDown={() => {}}
                onPinPointerUp={() => {}}
              />
              {/* Red X Overlay */}
              <line 
                x1={pos.x} 
                y1={pos.y} 
                x2={pos.x + 100} 
                y2={pos.y + 100} 
                stroke="#ef4444" 
                strokeWidth="2"
              />
            </g>
          );
        })}

      {/* 2. Added Components (Glow Green) */}
      {compareDiagram.components
        .filter(c => diffSet.added.components.includes(c.id))
        .map(comp => (
          <g key={`added-${comp.id}`}>
            <DiagramNode
              component={comp}
              position={getPos(comp)}
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
              position={getPos(comp)}
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
