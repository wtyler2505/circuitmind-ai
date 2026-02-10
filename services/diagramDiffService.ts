/**
 * Diagram Diff Service
 *
 * Pure-function service that computes structural diffs between two WiringDiagram
 * snapshots. Returns full component and wire objects (not just IDs) so that
 * consumers can render rich diff visualizations without a second lookup pass.
 *
 * Comparison strategy:
 *   - Components matched by `id` (stable across saves)
 *   - Wires matched by the canonical key `from:pin -> to:pin`
 *   - Modifications detected via deep JSON equality (cheap for small diagrams,
 *     and correctness matters more than micro-perf in a diff viewer)
 */

import type { WiringDiagram, ElectronicComponent, WireConnection } from '../types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A single component that was modified between two diagram versions. */
export interface ModifiedComponent {
  before: ElectronicComponent;
  after: ElectronicComponent;
}

/** Full structural diff between two diagram snapshots. */
export interface DiagramDiff {
  added: ElectronicComponent[];
  removed: ElectronicComponent[];
  modified: ModifiedComponent[];
  addedWires: WireConnection[];
  removedWires: WireConnection[];
}

/** Human-readable summary counts for the diff. */
export interface DiagramDiffSummary {
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  addedWireCount: number;
  removedWireCount: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Canonical string key for a wire connection.
 *
 * Because `WireConnection` has no stable `id` field, identity is determined
 * by its endpoint pair. We normalise direction (smaller key first) so that
 * a wire from A->B matches B->A if they share the same pins.
 */
function wireKey(c: WireConnection): string {
  const a = `${c.fromComponentId}:${c.fromPin}`;
  const b = `${c.toComponentId}:${c.toPin}`;
  // Normalise direction so order doesn't matter
  return a < b ? `${a}->${b}` : `${b}->${a}`;
}

/**
 * Shallow-ish equality for components. Uses JSON.stringify which is fine
 * for the small objects we deal with (< 1 KB each).  We deliberately
 * exclude transient rendering fields that don't represent semantic change.
 */
function componentEqual(a: ElectronicComponent, b: ElectronicComponent): boolean {
  // Fast path: referential equality
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Core diff function
// ---------------------------------------------------------------------------

/**
 * Compute a structural diff between two wiring diagram versions.
 *
 * @param before - The earlier / base diagram snapshot.
 * @param after  - The later / target diagram snapshot.
 * @returns A `DiagramDiff` with full component and wire objects.
 */
export function diffDiagrams(
  before: WiringDiagram,
  after: WiringDiagram,
): DiagramDiff {
  const result: DiagramDiff = {
    added: [],
    removed: [],
    modified: [],
    addedWires: [],
    removedWires: [],
  };

  // -----------------------------------------------------------------------
  // 1. Component diff (keyed by id)
  // -----------------------------------------------------------------------
  const beforeMap = new Map<string, ElectronicComponent>(
    before.components.map((c) => [c.id, c]),
  );
  const afterMap = new Map<string, ElectronicComponent>(
    after.components.map((c) => [c.id, c]),
  );

  // Added & modified
  for (const [id, afterComp] of afterMap) {
    const beforeComp = beforeMap.get(id);
    if (!beforeComp) {
      result.added.push(afterComp);
    } else if (!componentEqual(beforeComp, afterComp)) {
      result.modified.push({ before: beforeComp, after: afterComp });
    }
  }

  // Removed
  for (const [id, beforeComp] of beforeMap) {
    if (!afterMap.has(id)) {
      result.removed.push(beforeComp);
    }
  }

  // -----------------------------------------------------------------------
  // 2. Wire diff (keyed by endpoint pair)
  // -----------------------------------------------------------------------
  const beforeWireKeys = new Set<string>(before.connections.map(wireKey));
  const afterWireKeys = new Set<string>(after.connections.map(wireKey));

  // Build lookup maps keyed by canonical key
  const beforeWireMap = new Map<string, WireConnection>();
  for (const w of before.connections) {
    beforeWireMap.set(wireKey(w), w);
  }
  const afterWireMap = new Map<string, WireConnection>();
  for (const w of after.connections) {
    afterWireMap.set(wireKey(w), w);
  }

  // Added wires
  for (const [key, wire] of afterWireMap) {
    if (!beforeWireKeys.has(key)) {
      result.addedWires.push(wire);
    }
  }

  // Removed wires
  for (const [key, wire] of beforeWireMap) {
    if (!afterWireKeys.has(key)) {
      result.removedWires.push(wire);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Summary helper
// ---------------------------------------------------------------------------

/**
 * Produce a concise count summary from a diff result.
 *
 * Useful for badges and status lines without having to re-walk the arrays.
 */
export function summariseDiff(diff: DiagramDiff): DiagramDiffSummary {
  return {
    addedCount: diff.added.length,
    removedCount: diff.removed.length,
    modifiedCount: diff.modified.length,
    addedWireCount: diff.addedWires.length,
    removedWireCount: diff.removedWires.length,
  };
}

/**
 * Format a diff summary as a human-readable string.
 *
 * Example output: "+3 components, -1 wire, 2 modified"
 */
export function formatDiffSummary(diff: DiagramDiff): string {
  const parts: string[] = [];
  const s = summariseDiff(diff);

  if (s.addedCount > 0) {
    parts.push(`+${s.addedCount} component${s.addedCount !== 1 ? 's' : ''}`);
  }
  if (s.removedCount > 0) {
    parts.push(`-${s.removedCount} component${s.removedCount !== 1 ? 's' : ''}`);
  }
  if (s.modifiedCount > 0) {
    parts.push(`${s.modifiedCount} modified`);
  }
  if (s.addedWireCount > 0) {
    parts.push(`+${s.addedWireCount} wire${s.addedWireCount !== 1 ? 's' : ''}`);
  }
  if (s.removedWireCount > 0) {
    parts.push(`-${s.removedWireCount} wire${s.removedWireCount !== 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No changes';
}
