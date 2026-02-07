/**
 * Pure calculation functions extracted from DiagramCanvas.tsx.
 *
 * These functions contain no React state, effects, or DOM access and are
 * therefore easy to unit-test in isolation.
 */

import { WireConnection, ElectronicComponent } from '../../types';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT } from './diagramUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiagramBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ─── 1. resolveWireColor ──────────────────────────────────────────────────────

/**
 * Resolve a wire's display colour based on user preference overrides.
 *
 * Checks for an exact pin-name match first, then falls back to fuzzy matching
 * on well-known signal names (VCC, GND, SDA, SCL).
 */
export const resolveWireColor = (
  conn: WireConnection,
  map?: Record<string, string>
): string | undefined => {
  if (!map) return undefined;

  // Exact match
  if (map[conn.fromPin]) return map[conn.fromPin];
  if (map[conn.toPin]) return map[conn.toPin];

  // Fuzzy match
  const upperFrom = conn.fromPin.toUpperCase();
  const upperTo = conn.toPin.toUpperCase();

  if (
    map['VCC'] &&
    (upperFrom.includes('VCC') ||
      upperFrom.includes('5V') ||
      upperFrom.includes('3.3V') ||
      upperTo.includes('VCC'))
  )
    return map['VCC'];
  if (map['GND'] && (upperFrom.includes('GND') || upperTo.includes('GND'))) return map['GND'];
  if (map['SDA'] && (upperFrom.includes('SDA') || upperTo.includes('SDA'))) return map['SDA'];
  if (map['SCL'] && (upperFrom.includes('SCL') || upperTo.includes('SCL'))) return map['SCL'];

  return undefined;
};

// ─── 2. calculateInitialLayout ────────────────────────────────────────────────

/**
 * Calculate positions for components that don't yet have one.
 *
 * Places components in vertical columns based on their `type`:
 *   - power        → x = 100
 *   - microcontroller → x = 400
 *   - everything else → x = 700
 *
 * Returns a new Map containing all positions (existing + newly computed).
 * If every component already has a position the original map is returned
 * unchanged so callers can skip dispatching.
 */
export const calculateInitialLayout = (
  components: ElectronicComponent[],
  existingPositions: Map<string, { x: number; y: number }>
): Map<string, { x: number; y: number }> => {
  const unpositioned = components.filter((c) => !existingPositions.has(c.id));
  if (unpositioned.length === 0) return existingPositions;

  const newPositions = new Map(existingPositions);
  let yOffset = 50;
  let xOffset = 400;

  unpositioned.forEach((c) => {
    if (c.type === 'power') xOffset = 100;
    else if (c.type === 'microcontroller') xOffset = 400;
    else xOffset = 700;

    let conflict = true;
    let attempts = 0;
    while (conflict && attempts < 100) {
      conflict = Array.from(newPositions.values()).some(
        (p: { x: number; y: number }) =>
          Math.abs(p.x - xOffset) < 50 && Math.abs(p.y - yOffset) < 50
      );
      if (conflict) yOffset += 200;
      attempts++;
    }
    newPositions.set(c.id, { x: xOffset, y: yOffset });
    yOffset += 200;
  });

  return newPositions;
};

// ─── 3. calculateDiagramBounds ────────────────────────────────────────────────

/**
 * Compute the bounding box around all visible (filtered) components,
 * including a fixed 50 px padding on each side.
 *
 * Falls back to a default 500x300 rect when there are no components.
 */
export const calculateDiagramBounds = (
  filteredComponents: ElectronicComponent[],
  nodePositions: Map<string, { x: number; y: number }>
): DiagramBounds => {
  if (filteredComponents.length === 0) {
    return { minX: 0, minY: 0, maxX: 500, maxY: 300, width: 500, height: 300 };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  filteredComponents.forEach((c) => {
    const pos = nodePositions.get(c.id) || { x: 0, y: 0 };
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + COMPONENT_WIDTH);
    maxY = Math.max(maxY, pos.y + COMPONENT_HEIGHT);
  });

  const padding = 50;
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
};

// ─── 4. calculateViewportBounds ───────────────────────────────────────────────

/**
 * Derive the currently visible diagram-coordinate rectangle from the
 * viewport's pixel dimensions, the current pan/zoom, and a padding value.
 *
 * Returns `null` when the viewport dimensions are unknown (zero).
 */
export const calculateViewportBounds = (
  pan: { x: number; y: number },
  zoom: number,
  viewportSize: { width: number; height: number },
  padding: number
): ViewportBounds | null => {
  const width = viewportSize.width;
  const height = viewportSize.height;
  if (!width || !height) return null;

  const minX = -pan.x / zoom - padding;
  const minY = -pan.y / zoom - padding;
  const maxX = (width - pan.x) / zoom + padding;
  const maxY = (height - pan.y) / zoom + padding;
  return { minX, minY, maxX, maxY };
};

// ─── 5. filterVisibleComponents ───────────────────────────────────────────────

/**
 * When the diagram exceeds the virtualisation threshold, cull components
 * that fall entirely outside the viewport bounds.
 *
 * If virtualisation is disabled (or viewport bounds are unavailable),
 * all `filteredComponents` are returned as-is.
 */
export const filterVisibleComponents = (
  filteredComponents: ElectronicComponent[],
  nodePositions: Map<string, { x: number; y: number }>,
  viewportBounds: ViewportBounds | null,
  shouldVirtualize: boolean
): ElectronicComponent[] => {
  if (!shouldVirtualize || !viewportBounds) return filteredComponents;

  return filteredComponents.filter((comp) => {
    const pos = nodePositions.get(comp.id);
    if (!pos) return true; // Keep unpositioned components visible
    const right = pos.x + COMPONENT_WIDTH;
    const bottom = pos.y + COMPONENT_HEIGHT;
    return (
      right >= viewportBounds.minX &&
      pos.x <= viewportBounds.maxX &&
      bottom >= viewportBounds.minY &&
      pos.y <= viewportBounds.maxY
    );
  });
};

// ─── 6. filterVisibleConnections ──────────────────────────────────────────────

/**
 * Keep only connections that touch at least one visible component.
 *
 * When virtualisation is disabled every connection (with its original index)
 * is returned.
 */
export const filterVisibleConnections = (
  connections: WireConnection[],
  visibleComponentIds: Set<string>,
  shouldVirtualize: boolean
): { conn: WireConnection; index: number }[] => {
  const connectionsWithIndex = connections.map((conn, index) => ({ conn, index }));
  if (!shouldVirtualize) return connectionsWithIndex;

  return connectionsWithIndex.filter(
    ({ conn }) =>
      visibleComponentIds.has(conn.fromComponentId) ||
      visibleComponentIds.has(conn.toComponentId)
  );
};
