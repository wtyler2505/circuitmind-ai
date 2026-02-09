import React from 'react';
import type { WiringDiagram, ElectronicComponent } from '../../../types';
import type { DiagramState } from '../diagramState';
import { Wire, DiagramNode } from '..';
import { PredictiveGhost } from '../PredictiveGhost';
import SvgDefs from './SvgDefs';
import { resolveWireColor } from './resolveWireColor';
import type { PredictiveAction } from '../../../services/predictionEngine';

interface Canvas2DContentProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  state: DiagramState;
  diagram: WiringDiagram;
  selectedComponentId?: string | null;
  snapToGrid: boolean;
  uniqueColors: string[];
  renderConnections: Array<{ conn: WiringDiagram['connections'][number]; index: number }>;
  renderComponents: ElectronicComponent[];
  highlightedComponents: Map<string, { color: string; pulse: boolean }>;
  highlightedWires: Map<number, { color: string; pulse: boolean }>;
  stagedActions: PredictiveAction[];
  wiringColors?: Record<string, string>;
  onStagedActionAccept?: (id: string) => void;
  onStagedActionReject?: (id: string) => void;
  onComponentSelect?: (componentId: string) => void;
  onComponentContextMenu?: (componentId: string, x: number, y: number) => void;
  onComponentDoubleClick?: (component: ElectronicComponent) => void;
  onPointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onPinPointerDown: (e: React.PointerEvent, nodeId: string, pin: string, isRightSide: boolean) => void;
  onPinPointerUp: (e: React.PointerEvent, nodeId: string, pin: string) => void;
  onComponentEnter?: (e: React.MouseEvent, component: ElectronicComponent) => void;
  onComponentLeave?: (e: React.MouseEvent, component: ElectronicComponent) => void;
  onPinEnter?: (e: React.MouseEvent, componentId: string, pin: string) => void;
  onPinLeave?: (e: React.MouseEvent, componentId: string, pin: string) => void;
  onNudge?: (componentId: string, dx: number, dy: number) => void;
  onWireEditClick?: (index: number) => void;
  onWireDelete?: (index: number) => void;
}

const Canvas2DContent: React.FC<Canvas2DContentProps> = ({
  svgRef,
  state,
  diagram,
  selectedComponentId,
  snapToGrid,
  uniqueColors,
  renderConnections,
  renderComponents,
  highlightedComponents,
  highlightedWires,
  stagedActions,
  wiringColors,
  onStagedActionAccept,
  onStagedActionReject,
  onComponentSelect,
  onComponentContextMenu,
  onComponentDoubleClick,
  onPointerDown,
  onPinPointerDown,
  onPinPointerUp,
  onComponentEnter,
  onComponentLeave,
  onPinEnter,
  onPinLeave,
  onNudge,
  onWireEditClick,
  onWireDelete,
}) => (
  <svg ref={svgRef} className="w-full h-full pointer-events-none" data-testid="diagram-svg">
    <g transform={`translate(${state.pan.x}, ${state.pan.y}) scale(${state.zoom})`}>
      <SvgDefs snapToGrid={snapToGrid} uniqueColors={uniqueColors} />
      <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" opacity={snapToGrid ? 0.7 : 0.5} />
      {snapToGrid && <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid-major)" opacity="0.5" />}

      <PredictiveGhost
        stagedActions={stagedActions}
        diagram={diagram}
        positions={state.nodePositions}
        zoom={state.zoom}
        onAccept={(id) => onStagedActionAccept?.(id)}
        onReject={(id) => onStagedActionReject?.(id)}
      />

      {renderConnections.map(({ conn, index }) => {
        const wireHighlight = highlightedWires.get(index);
        const overrideColor = resolveWireColor(conn, wiringColors);
        const displayConnection = overrideColor ? { ...conn, color: overrideColor } : conn;
        return (
          <Wire
            key={index}
            connection={displayConnection}
            index={index}
            startComponent={diagram.components.find((c) => c.id === conn.fromComponentId)}
            endComponent={diagram.components.find((c) => c.id === conn.toComponentId)}
            startPos={state.nodePositions.get(conn.fromComponentId)}
            endPos={state.nodePositions.get(conn.toComponentId)}
            highlight={wireHighlight ? { color: wireHighlight.color, pulse: wireHighlight.pulse } : undefined}
            onEditClick={onWireEditClick}
            onDelete={onWireDelete}
          />
        );
      })}

      {state.tempWire && (
        <path
          d={`M ${state.tempWire.startX} ${state.tempWire.startY} L ${state.cursorPos.x} ${state.cursorPos.y}`}
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          className="pointer-events-none"
        />
      )}

      {renderComponents.map((comp) => {
        const pos = state.nodePositions.get(comp.id);
        if (!pos) return null;
        const highlight = highlightedComponents.get(comp.id);
        return (
          <DiagramNode
            key={comp.id}
            component={comp}
            position={pos}
            isHovered={state.hoveredNodeId === comp.id}
            isSelected={selectedComponentId === comp.id}
            highlight={highlight ? { color: highlight.color, pulse: highlight.pulse } : undefined}
            onPointerDown={onPointerDown}
            onSelect={onComponentSelect}
            onContextMenu={onComponentContextMenu}
            onDoubleClick={onComponentDoubleClick}
            onPinPointerDown={onPinPointerDown}
            onPinPointerUp={onPinPointerUp}
            onMouseEnter={onComponentEnter}
            onMouseLeave={onComponentLeave}
            onPinEnter={onPinEnter}
            onPinLeave={onPinLeave}
            onNudge={onNudge}
          />
        );
      })}
    </g>
  </svg>
);

export default React.memo(Canvas2DContent);
