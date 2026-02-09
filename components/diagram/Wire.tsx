import React, { memo } from 'react';
import { WireConnection, ElectronicComponent } from '../../types';
import { BezierWire } from './wiring/BezierWire';

export interface WireHighlightState {
  color: string;
  pulse: boolean;
}

interface WireProps {
  connection: WireConnection;
  index: number;
  startComponent?: ElectronicComponent;
  endComponent?: ElectronicComponent;
  startPos?: { x: number; y: number };
  endPos?: { x: number; y: number };
  highlight?: { color: string; pulse: boolean };
  onEditClick?: (index: number) => void;
  onDelete?: (index: number) => void;
}

const COMPONENT_WIDTH = 120;
const COMPONENT_HEIGHT = 80;

export const Wire: React.FC<WireProps> = memo(({
  connection,
  index,
  startComponent,
  endComponent,
  startPos,
  endPos,
  highlight,
  onEditClick,
  onDelete
}) => {
  if (!startComponent || !endComponent || !startPos || !endPos) return null;

  // Calculate start point
  const startPinIdx = (startComponent.pins || []).indexOf(connection.fromPin);
  let x1 = startPos.x;
  let y1 = startPos.y;
  
  if (startPinIdx !== -1) {
    x1 += endPos.x < startPos.x ? 0 : COMPONENT_WIDTH;
    y1 += 40 + startPinIdx * 15;
  } else {
    x1 += COMPONENT_WIDTH / 2;
    y1 += COMPONENT_HEIGHT / 2;
  }

  // Calculate end point
  const endPinIdx = (endComponent.pins || []).indexOf(connection.toPin);
  let x2 = endPos.x;
  let y2 = endPos.y;
  
  if (endPinIdx !== -1) {
    x2 += endPos.x < startPos.x ? COMPONENT_WIDTH : 0;
    y2 += 40 + endPinIdx * 15;
  } else {
    x2 += COMPONENT_WIDTH / 2;
    y2 += COMPONENT_HEIGHT / 2;
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete?.(index);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick?.(index);
  };

  return (
    <g 
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      <BezierWire 
        start={{ x: x1, y: y1 }}
        end={{ x: x2, y: y2 }}
        points={connection.path}
        color={highlight?.color || connection.color}
        selected={!!highlight}
      />
      
      {connection.description && (
        <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
          <rect x="-40" y="-10" width="80" height="20" rx="4" fill="#0f172a" stroke="#334155" />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="10"
            fontFamily="monospace"
          >
            {connection.description}
          </text>
        </g>
      )}
    </g>
  );
});

Wire.displayName = 'Wire';

export default Wire;