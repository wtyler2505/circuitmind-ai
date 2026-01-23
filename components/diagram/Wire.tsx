import React, { memo, useMemo } from 'react';
import { WireConnection, ElectronicComponent } from '../../types';

const COMPONENT_WIDTH = 140;
const COMPONENT_HEIGHT = 100;

export interface WireHighlightState {
  color: string;
  pulse: boolean;
}

interface WireProps {
  connection: WireConnection;
  index: number;
  startComponent: ElectronicComponent | undefined;
  endComponent: ElectronicComponent | undefined;
  startPos: { x: number; y: number } | undefined;
  endPos: { x: number; y: number } | undefined;
  highlight?: WireHighlightState;
  onEditClick: (index: number) => void;
  onDelete?: (index: number) => void;
}

/**
 * Calculate smart Bezier path between two points.
 * Uses cubic bezier for smooth curves, falls back to Manhattan routing
 * when components are too close horizontally.
 */
const getSmartPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const isReversed = x1 > x2;
  const controlDist = Math.abs(x2 - x1) * 0.5;

  // Manhattan/zig-zag route for close horizontal components
  if (isReversed && Math.abs(x1 - x2) < 100) {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1 + 20} ${y1} L ${x1 + 20} ${midY} L ${x2 - 20} ${midY} L ${x2 - 20} ${y2} L ${x2} ${y2}`;
  }

  // Smooth cubic bezier curve
  const cp1x = x1 + (isReversed ? -controlDist : controlDist);
  const cp2x = x2 + (isReversed ? controlDist : -controlDist);

  return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
};

/**
 * Calculate wire endpoint coordinates based on pin positions.
 */
const calculateWireEndpoints = (
  connection: WireConnection,
  startComponent: ElectronicComponent | undefined,
  endComponent: ElectronicComponent | undefined,
  startPos: { x: number; y: number },
  endPos: { x: number; y: number }
) => {
  let startX = startPos.x;
  let startY = startPos.y;
  const startPinIdx = (startComponent?.pins || []).indexOf(connection.fromPin);

  if (startPinIdx !== -1) {
    const isLeft = endPos.x < startPos.x;
    startX += isLeft ? 0 : COMPONENT_WIDTH;
    startY += 40 + startPinIdx * 15;
  } else {
    // Fallback: bottom-center for missing pins
    startX += COMPONENT_WIDTH / 2;
    startY += COMPONENT_HEIGHT + 10;
  }

  let endX = endPos.x;
  let endY = endPos.y;
  const endPinIdx = (endComponent?.pins || []).indexOf(connection.toPin);

  if (endPinIdx !== -1) {
    const isLeft = endPos.x < startPos.x;
    endX += isLeft ? COMPONENT_WIDTH : 0;
    endY += 40 + endPinIdx * 15;
  } else {
    // Fallback: bottom-center for missing pins
    endX += COMPONENT_WIDTH / 2;
    endY += COMPONENT_HEIGHT + 10;
  }

  return { startX, startY, endX, endY };
};

/**
 * Wire component for rendering connections between diagram nodes.
 * Memoized to prevent unnecessary re-renders.
 */
const Wire = memo<WireProps>(function Wire({
  connection,
  index,
  startComponent,
  endComponent,
  startPos,
  endPos,
  highlight,
  onEditClick,
  onDelete,
}) {
  const { startX, startY, endX, endY } = useMemo(
    () => {
      if (!startPos || !endPos) return { startX: 0, startY: 0, endX: 0, endY: 0 };
      return calculateWireEndpoints(connection, startComponent, endComponent, startPos, endPos);
    },
    [connection, startComponent, endComponent, startPos, endPos]
  );

  const pathD = useMemo(
    () => getSmartPath(startX, startY, endX, endY),
    [startX, startY, endX, endY]
  );

  // Skip rendering if positions are missing
  if (!startPos || !endPos) return null;

  const isHighlighted = !!highlight;
  const color = isHighlighted ? highlight.color : connection.color || '#00f3ff';
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(index);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(index);
    }
  };

  return (
    <g className="pointer-events-auto group" onClick={handleClick} onContextMenu={handleContextMenu}>
      {/* Invisible wider path for easier click targeting */}
      <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" />

      {/* Glow effect for highlighted wires */}
      {isHighlighted && (
        <path
          d={pathD}
          stroke={highlight.color}
          strokeWidth="8"
          fill="none"
          opacity="0.3"
          className={highlight.pulse ? 'animate-pulse' : ''}
        />
      )}

      {/* Main wire path */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth={isHighlighted ? 4 : 2}
        fill="none"
        className={`transition-all duration-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] group-hover:stroke-white ${isHighlighted && highlight.pulse ? 'animate-pulse' : ''}`}
        markerEnd={`url(#arrow-${(connection.color || '#00f3ff').replace('#', '')})`}
      />

      {/* Wire label (shown on hover) */}
      <text
        x={midX}
        y={midY - 5}
        textAnchor="middle"
        fill={color}
        fontSize="10"
        className="opacity-0 group-hover:opacity-100 bg-black"
      >
        {connection.description}
      </text>

      {/* Delete button (shown on hover) */}
      {onDelete && (
        <g
          className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
        >
          <circle
            cx={midX + 15}
            cy={midY - 5}
            r="8"
            fill="#1e293b"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <text
            x={midX + 15}
            y={midY - 1}
            textAnchor="middle"
            fill="#ef4444"
            fontSize="12"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
});

export default Wire;

// Re-export utility for use elsewhere
export { getSmartPath, calculateWireEndpoints, COMPONENT_WIDTH, COMPONENT_HEIGHT };
