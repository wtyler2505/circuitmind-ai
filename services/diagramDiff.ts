import { WiringDiagram, ElectronicComponent, WireConnection } from '../types';

export interface DiffSet {
  added: { components: string[]; connections: number[] };
  removed: { components: string[]; connections: number[] };
  modified: { components: string[] };
}

class DiagramDiffService {
  /**
   * Compares two diagrams and returns a set of differences.
   */
  diff(oldDiagram: WiringDiagram | null, newDiagram: WiringDiagram | null): DiffSet {
    const diffSet: DiffSet = {
      added: { components: [], connections: [] },
      removed: { components: [], connections: [] },
      modified: { components: [] }
    };

    if (!oldDiagram || !newDiagram) return diffSet;

    // 1. Component Diff
    const oldComps = new Map(oldDiagram.components.map(c => [c.id, c]));
    const newComps = new Map(newDiagram.components.map(c => [c.id, c]));

    newDiagram.components.forEach(comp => {
      if (!oldComps.has(comp.id)) {
        diffSet.added.components.push(comp.id);
      } else {
        const oldComp = oldComps.get(comp.id)!;
        // Check for modifications (deep comparison or heuristic)
        if (JSON.stringify(oldComp) !== JSON.stringify(comp)) {
          diffSet.modified.components.push(comp.id);
        }
      }
    });

    oldDiagram.components.forEach(comp => {
      if (!newComps.has(comp.id)) {
        diffSet.removed.components.push(comp.id);
      }
    });

    // 2. Connection Diff
    // For simplicity, we stringify connections to compare them
    const connKey = (c: WireConnection) => `${c.fromComponentId}:${c.fromPin}->${c.toComponentId}:${c.toPin}`;
    const oldConns = oldDiagram.connections.map(connKey);
    const newConns = newDiagram.connections.map(connKey);

    newDiagram.connections.forEach((conn, idx) => {
      if (!oldConns.includes(connKey(conn))) {
        diffSet.added.connections.push(idx);
      }
    });

    oldDiagram.connections.forEach((conn, idx) => {
      if (!newConns.includes(connKey(conn))) {
        diffSet.removed.connections.push(idx);
      }
    });

    return diffSet;
  }
}

export const diagramDiffService = new DiagramDiffService();
