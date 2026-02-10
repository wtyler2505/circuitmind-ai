import React, { memo, useMemo } from 'react';
import { WireConnection, ElectronicComponent } from '../../types';
import { BezierWire } from './wiring/BezierWire';
import { useSimulation } from '../../contexts/SimulationContext';
import type { MNASimulationResult } from '../../services/simulation/types';
import { formatCurrent } from './PinTooltip';

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

/**
 * Compute wire color based on current magnitude.
 * Low current = default cyan, increasing current = warmer colors.
 * Overcurrent (>maxCurrent) = red with pulsing glow.
 */
function getWireCurrentColor(currentAmps: number): { color: string; glow: boolean } {
  const abs = Math.abs(currentAmps);
  if (abs < 1e-6) return { color: '#00f3ff', glow: false }; // Near-zero: cyan
  if (abs < 0.01) return { color: '#00e5a0', glow: false }; // <10mA: green
  if (abs < 0.1) return { color: '#facc15', glow: false }; // <100mA: yellow
  if (abs < 0.5) return { color: '#f97316', glow: false }; // <500mA: orange
  return { color: '#ef4444', glow: true }; // >500mA: red + glow
}

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
  const { result } = useSimulation();

  // Get current flowing through this wire from the source component
  const wireCurrentInfo = useMemo(() => {
    if (!result) return null;
    const mna = result as MNASimulationResult;
    if (!mna.usedMNA) return null;

    // Current through the connection's source component
    const fromCurrent = mna.branchCurrents?.[connection.fromComponentId] ?? 0;
    const toCurrent = mna.branchCurrents?.[connection.toComponentId] ?? 0;
    // Use the larger magnitude as the wire current
    const current = Math.abs(fromCurrent) > Math.abs(toCurrent) ? fromCurrent : toCurrent;
    return { current, ...getWireCurrentColor(current) };
  }, [result, connection.fromComponentId, connection.toComponentId]);

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

  // Wire color: highlight > current-based > connection default
  const wireColor = highlight?.color || wireCurrentInfo?.color || connection.color;

  return (
    <g
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${wireCurrentInfo?.glow ? 'wire-overcurrent' : ''}`}
      aria-label={`Wire from ${connection.fromPin} to ${connection.toPin}${wireCurrentInfo ? `, ${formatCurrent(wireCurrentInfo.current)}` : ''}`}
    >
      {/* Overcurrent glow effect */}
      {wireCurrentInfo?.glow && (
        <BezierWire
          start={{ x: x1, y: y1 }}
          end={{ x: x2, y: y2 }}
          points={connection.path}
          color="#ef4444"
          selected={false}
        />
      )}
      <BezierWire
        start={{ x: x1, y: y1 }}
        end={{ x: x2, y: y2 }}
        points={connection.path}
        color={wireColor}
        selected={!!highlight}
      />

      {/* Wire current label (shown for significant current) */}
      {wireCurrentInfo && Math.abs(wireCurrentInfo.current) > 1e-4 && (
        <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 12})`}>
          <rect
            x={-24}
            y={-8}
            width="48"
            height="14"
            rx="2"
            fill="rgba(2, 6, 23, 0.85)"
            stroke={wireCurrentInfo.color}
            strokeWidth="0.5"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill={wireCurrentInfo.color}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="600"
          >
            {formatCurrent(wireCurrentInfo.current)}
          </text>
        </g>
      )}

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