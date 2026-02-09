/**
 * MNA Circuit Graph Builder
 *
 * Builds circuit connectivity graph and assigns node numbers using union-find.
 * Ground node is always node 0, unconnected pins get unique node numbers.
 */

import type { ElectronicComponent, WiringDiagram, WireConnection } from '../../types';
import type { CircuitGraph } from './types';

/**
 * Union-Find data structure for efficient connected component tracking.
 * Uses path compression and union by rank for optimal performance.
 */
class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  /**
   * Find the root of the set containing x (with path compression).
   */
  find(x: string): string {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
      return x;
    }

    const parentX = this.parent.get(x)!;
    if (parentX !== x) {
      // Path compression: point directly to root
      this.parent.set(x, this.find(parentX));
    }

    return this.parent.get(x)!;
  }

  /**
   * Union two sets containing x and y (by rank).
   */
  union(x: string, y: string): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return; // Already in same set
    }

    // Union by rank: attach smaller tree under larger tree
    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
  }

  /**
   * Check if x and y are in the same connected component.
   */
  connected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Group all elements by their root.
   * Returns a map from root → set of all elements in that group.
   */
  getGroups(): Map<string, Set<string>> {
    const groups = new Map<string, Set<string>>();

    for (const key of this.parent.keys()) {
      const root = this.find(key);
      if (!groups.has(root)) {
        groups.set(root, new Set());
      }
      groups.get(root)!.add(key);
    }

    return groups;
  }
}

/**
 * Identify the ground node in the circuit.
 *
 * Looks for a 'power' component with a GND pin.
 * Pin matching is case-insensitive and accepts: GND, ground, gnd, VSS.
 *
 * @param components - Array of electronic components
 * @returns Pin key "componentId:pinName" for ground, or null if not found
 */
export function identifyGroundNode(components: ElectronicComponent[]): string | null {
  const groundPatterns = ['gnd', 'ground', 'vss'];

  for (const component of components) {
    if (component.type !== 'power') {
      continue;
    }

    if (!component.pins || component.pins.length === 0) {
      continue;
    }

    // Search for a ground pin
    for (const pin of component.pins) {
      const pinLower = pin.toLowerCase();
      if (groundPatterns.includes(pinLower)) {
        return `${component.id}:${pin}`;
      }
    }
  }

  return null;
}

/**
 * Build the circuit connectivity graph using union-find.
 *
 * Creates adjacency sets representing which pins are electrically connected.
 * Handles both explicit wire connections and internal buses (e.g., breadboard rails).
 *
 * @param diagram - The wiring diagram
 * @returns CircuitGraph with nets and ground pin
 */
export function buildCircuitGraph(diagram: WiringDiagram): CircuitGraph {
  const uf = new UnionFind();
  const allPinKeys = new Set<string>();

  // Step 1: Collect all pin keys from components
  for (const component of diagram.components) {
    if (!component.pins) {
      continue;
    }

    for (const pin of component.pins) {
      const pinKey = `${component.id}:${pin}`;
      allPinKeys.add(pinKey);
      // Initialize in union-find
      uf.find(pinKey);
    }
  }

  // Step 2: Union pins connected by wires
  for (const wire of diagram.connections) {
    const fromKey = `${wire.fromComponentId}:${wire.fromPin}`;
    const toKey = `${wire.toComponentId}:${wire.toPin}`;

    // Add to union-find if not already present
    uf.find(fromKey);
    uf.find(toKey);

    // Union these two pins
    uf.union(fromKey, toKey);
  }

  // Step 3: Union pins within internal buses (e.g., breadboard power rails)
  for (const component of diagram.components) {
    if (!component.internalBuses) {
      continue;
    }

    for (const bus of component.internalBuses) {
      if (bus.length < 2) {
        continue; // Nothing to connect
      }

      // Union all pins in this bus
      const firstPinKey = `${component.id}:${bus[0]}`;
      for (let i = 1; i < bus.length; i++) {
        const pinKey = `${component.id}:${bus[i]}`;
        uf.union(firstPinKey, pinKey);
      }
    }
  }

  // Step 4: Build nets map (pin → set of connected pins)
  const groups = uf.getGroups();
  const nets = new Map<string, Set<string>>();

  for (const [root, group] of groups.entries()) {
    // For each pin in the group, map it to all other pins in the same group
    for (const pinKey of group) {
      const connectedPins = new Set(group);
      connectedPins.delete(pinKey); // Remove self
      nets.set(pinKey, connectedPins);
    }
  }

  // Step 5: Identify ground node
  const groundPin = identifyGroundNode(diagram.components);

  return {
    nets,
    groundPin,
  };
}

/**
 * Assign node numbers to all component pins.
 *
 * Uses union-find to group connected pins into equivalence classes (nets).
 * Ground net gets node 0, other nets get sequential numbers starting from 1.
 * Every pin gets a node number, including unconnected pins (each gets unique number).
 *
 * @param graph - Circuit connectivity graph
 * @param components - Array of electronic components
 * @returns Map from pin key ("componentId:pinName") to node number
 */
export function assignNodeNumbers(
  graph: CircuitGraph,
  components: ElectronicComponent[]
): Map<string, number> {
  const nodeMap = new Map<string, number>();
  const uf = new UnionFind();

  // Step 1: Rebuild union-find from graph.nets
  for (const [pinKey, connectedPins] of graph.nets.entries()) {
    uf.find(pinKey); // Ensure pin exists in UF

    for (const connectedKey of connectedPins) {
      uf.find(connectedKey);
      uf.union(pinKey, connectedKey);
    }
  }

  // Step 2: Ensure all component pins exist in union-find
  for (const component of components) {
    if (!component.pins) {
      continue;
    }

    for (const pin of component.pins) {
      const pinKey = `${component.id}:${pin}`;
      uf.find(pinKey); // Initialize if not already present
    }
  }

  // Step 3: Group pins by their root (connected component)
  const groups = uf.getGroups();

  // Step 4: Identify which group contains ground
  let groundRoot: string | null = null;
  if (graph.groundPin) {
    groundRoot = uf.find(graph.groundPin);
  }

  // Step 5: Assign node numbers
  let nextNodeNumber = 1; // Start from 1 (ground gets 0)

  for (const [root, group] of groups.entries()) {
    let nodeNumber: number;

    if (root === groundRoot) {
      // Ground net gets node 0
      nodeNumber = 0;
    } else {
      // Non-ground nets get sequential numbers
      nodeNumber = nextNodeNumber;
      nextNodeNumber++;
    }

    // Assign this node number to all pins in the group
    for (const pinKey of group) {
      nodeMap.set(pinKey, nodeNumber);
    }
  }

  return nodeMap;
}
