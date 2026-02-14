/**
 * CircuitDiffOverlay
 *
 * SVG overlay that visualises the structural difference between two
 * WiringDiagram snapshots.  Designed to be rendered *on top of* the main
 * diagram canvas (or inside a preview viewport) so that users can visually
 * inspect what changed between two versions.
 *
 * Colour conventions follow the project-wide diff palette:
 *   - Green  (#00ff9d / neon-green)  -> additions
 *   - Red    (#ef4444)               -> removals
 *   - Amber  (#ffaa00 / neon-amber)  -> modifications
 *
 * The overlay is non-interactive (pointer-events: none) so it never
 * interferes with the canvas underneath.
 */

import React, { useMemo } from 'react';
import type { WiringDiagram, ElectronicComponent, WireConnection } from '../../types';
import {
  calculateWireEndpoints,
  resolveComponentBounds,
} from '../diagram';
import {
  diffDiagrams,
  formatDiffSummary,
  type DiagramDiff,
} from '../../services/diagramDiffService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  added: '#00ff9d',
  removed: '#ef4444',
  modified: '#ffaa00',
} as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CircuitDiffOverlayProps {
  /** The earlier / base diagram. */
  before: WiringDiagram;
  /** The later / target diagram. */
  after: WiringDiagram;
  /**
   * Optional position map.  If supplied, component positions are looked up
   * here; otherwise the overlay falls back to `(component as any).position`
   * or a grid-based auto-layout.
   */
  positions?: Map<string, { x: number; y: number }>;
  /** SVG viewport width (defaults to 800). */
  width?: number;
  /** SVG viewport height (defaults to 600). */
  height?: number;
  /** Whether to show the summary badge (defaults to true). */
  showSummary?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPosition(
  comp: ElectronicComponent,
  positions: Map<string, { x: number; y: number }> | undefined,
  fallbackIndex: number,
): { x: number; y: number } {
  if (positions?.has(comp.id)) {
    return positions.get(comp.id)!;
  }
  // Legacy: position might be baked onto the component by drag state
  const legacy = (comp as unknown as Record<string, unknown>).position;
  if (legacy && typeof legacy === 'object' && legacy !== null) {
    const pos = legacy as { x?: number; y?: number };
    if (typeof pos.x === 'number' && typeof pos.y === 'number') {
      return { x: pos.x, y: pos.y };
    }
  }
  // Auto-layout fallback: simple grid
  const cols = 4;
  const fallbackBounds = resolveComponentBounds(comp);
  const gapX = fallbackBounds.width + 40;
  const gapY = fallbackBounds.height + 40;
  return {
    x: 20 + (fallbackIndex % cols) * gapX,
    y: 20 + Math.floor(fallbackIndex / cols) * gapY,
  };
}

/**
 * Resolve approximate endpoint positions for a wire so we can draw a
 * visual line.  We look up source/target component positions and offset
 * to the right/left edge respectively.
 */
function resolveWireEndpoints(
  wire: WireConnection,
  componentPositions: Map<string, { x: number; y: number }>,
  componentLookup: Map<string, ElectronicComponent>,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const fromPos = componentPositions.get(wire.fromComponentId);
  const toPos = componentPositions.get(wire.toComponentId);
  if (!fromPos || !toPos) return null;

  const fromComponent = componentLookup.get(wire.fromComponentId);
  const toComponent = componentLookup.get(wire.toComponentId);
  const endpoints = calculateWireEndpoints(wire, fromComponent, toComponent, fromPos, toPos);

  return {
    x1: endpoints.startX,
    y1: endpoints.startY,
    x2: endpoints.endX,
    y2: endpoints.endY,
  };
}

// ---------------------------------------------------------------------------
// Sub-components (kept internal, not exported)
// ---------------------------------------------------------------------------

interface ComponentOutlineProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  dashed?: boolean;
  strikethrough?: boolean;
}

const ComponentOutline: React.FC<ComponentOutlineProps> = ({
  x,
  y,
  width,
  height,
  color,
  label,
  dashed = false,
  strikethrough = false,
}) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={6}
      ry={6}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dashed ? '6 4' : undefined}
      opacity={0.85}
    />
    {/* Component label */}
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      textAnchor="middle"
      fill={color}
      fontSize={11}
      fontFamily="var(--font-mono, monospace)"
      opacity={0.9}
    >
      {label}
    </text>
    {/* Strikethrough for removed components */}
    {strikethrough && (
      <>
        <line
          x1={x + 4}
          y1={y + 4}
          x2={x + width - 4}
          y2={y + height - 4}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.6}
        />
        <line
          x1={x + width - 4}
          y1={y + 4}
          x2={x + 4}
          y2={y + height - 4}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.6}
        />
      </>
    )}
  </g>
);

interface WireLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const WireLine: React.FC<WireLineProps> = ({ x1, y1, x2, y2, color }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    strokeWidth={2}
    strokeDasharray="8 4"
    opacity={0.75}
    markerEnd={`url(#arrow-${color.replace('#', '')})`}
  />
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const CircuitDiffOverlayInner: React.FC<CircuitDiffOverlayProps> = ({
  before,
  after,
  positions,
  width = 800,
  height = 600,
  showSummary = true,
}) => {
  // Compute diff (memoised on diagram identity)
  const diff: DiagramDiff = useMemo(
    () => diffDiagrams(before, after),
    [before, after],
  );

  const summaryText = useMemo(() => formatDiffSummary(diff), [diff]);

  // Build a unified position map for all components we need to render.
  // We merge "before" and "after" component lists so both removed and added
  // components have positions available.
  const allPositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();
    let idx = 0;

    // After components first (they are the "current" state)
    for (const comp of after.components) {
      posMap.set(comp.id, getPosition(comp, positions, idx++));
    }
    // Before-only components (removed)
    for (const comp of before.components) {
      if (!posMap.has(comp.id)) {
        posMap.set(comp.id, getPosition(comp, positions, idx++));
      }
    }
    return posMap;
  }, [before, after, positions]);

  const allComponents = useMemo(() => {
    const componentMap = new Map<string, ElectronicComponent>();
    before.components.forEach((component) => {
      componentMap.set(component.id, component);
    });
    after.components.forEach((component) => {
      componentMap.set(component.id, component);
    });
    return componentMap;
  }, [before, after]);

  // Early return when diagrams are identical
  const isEmpty =
    diff.added.length === 0 &&
    diff.removed.length === 0 &&
    diff.modified.length === 0 &&
    diff.addedWires.length === 0 &&
    diff.removedWires.length === 0;

  if (isEmpty) {
    return (
      <svg
        width={width}
        height={height}
        className="pointer-events-none absolute inset-0"
        aria-label="No diagram changes"
      >
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={14}
          fontFamily="var(--font-sans, sans-serif)"
        >
          No changes between versions
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      aria-label={`Diagram diff: ${summaryText}`}
    >
      {/* Arrow marker definitions */}
      <defs>
        {[COLORS.added, COLORS.removed].map((color) => (
          <marker
            key={color}
            id={`arrow-${color.replace('#', '')}`}
            markerWidth={8}
            markerHeight={6}
            refX={8}
            refY={3}
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill={color} opacity={0.75} />
          </marker>
        ))}
      </defs>

      {/* --- Added components (green outline) --- */}
      {diff.added.map((comp) => {
        const pos = allPositions.get(comp.id) ?? { x: 0, y: 0 };
        const bounds = resolveComponentBounds(comp);
        return (
          <ComponentOutline
            key={`added-${comp.id}`}
            x={pos.x}
            y={pos.y}
            width={bounds.width}
            height={bounds.height}
            color={COLORS.added}
            label={`+ ${comp.name}`}
          />
        );
      })}

      {/* --- Removed components (red strikethrough) --- */}
      {diff.removed.map((comp) => {
        const pos = allPositions.get(comp.id) ?? { x: 0, y: 0 };
        const bounds = resolveComponentBounds(comp);
        return (
          <ComponentOutline
            key={`removed-${comp.id}`}
            x={pos.x}
            y={pos.y}
            width={bounds.width}
            height={bounds.height}
            color={COLORS.removed}
            label={`- ${comp.name}`}
            strikethrough
          />
        );
      })}

      {/* --- Modified components (amber dashed outline) --- */}
      {diff.modified.map(({ after: afterComp }) => {
        const pos = allPositions.get(afterComp.id) ?? { x: 0, y: 0 };
        const bounds = resolveComponentBounds(afterComp);
        return (
          <ComponentOutline
            key={`modified-${afterComp.id}`}
            x={pos.x}
            y={pos.y}
            width={bounds.width}
            height={bounds.height}
            color={COLORS.modified}
            label={`~ ${afterComp.name}`}
            dashed
          />
        );
      })}

      {/* --- Added wires (green dashed) --- */}
      {diff.addedWires.map((wire, i) => {
        const pts = resolveWireEndpoints(wire, allPositions, allComponents);
        if (!pts) return null;
        return (
          <WireLine
            key={`added-wire-${i}`}
            {...pts}
            color={COLORS.added}
          />
        );
      })}

      {/* --- Removed wires (red dashed) --- */}
      {diff.removedWires.map((wire, i) => {
        const pts = resolveWireEndpoints(wire, allPositions, allComponents);
        if (!pts) return null;
        return (
          <WireLine
            key={`removed-wire-${i}`}
            {...pts}
            color={COLORS.removed}
          />
        );
      })}

      {/* --- Summary badge --- */}
      {showSummary && (
        <g>
          <rect
            x={8}
            y={height - 36}
            width={Math.max(summaryText.length * 7.5 + 24, 140)}
            height={28}
            rx={4}
            fill="#0a0a12"
            fillOpacity={0.9}
            stroke="#00f3ff"
            strokeWidth={1}
            strokeOpacity={0.3}
          />
          <text
            x={20}
            y={height - 17}
            fill="#00f3ff"
            fontSize={12}
            fontFamily="var(--font-mono, monospace)"
          >
            {summaryText}
          </text>
        </g>
      )}
    </svg>
  );
};

export const CircuitDiffOverlay = React.memo(CircuitDiffOverlayInner);
export default CircuitDiffOverlay;
