/**
 * Component Validator Service
 * Ensures 100% consistency between inventory and diagram canvas
 *
 * Key principle: Inventory is the SINGLE SOURCE OF TRUTH
 * Diagram components must always match their inventory source
 */

import type { ElectronicComponent, WiringDiagram, WireConnection } from '../types';

// ============================================
// Types
// ============================================

export interface ComponentMismatch {
  diagramComponentId: string;
  diagramComponentName: string;
  inventoryId: string | undefined;
  field: 'name' | 'type' | 'pins' | 'description' | 'missing' | 'orphaned';
  expected: unknown;
  actual: unknown;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  mismatches: ComponentMismatch[];
  orphanedCount: number;
  syncedCount: number;
  totalChecked: number;
}

export interface ComponentUsage {
  inventoryId: string;
  inDiagramCount: number;
  hasActiveConnections: boolean;
  connectionCount: number;
  inSavedDiagrams: boolean;
  onlyInDrafts: boolean;
  diagramIds: string[];
}

export type OrphanAction = 'block' | 'warn' | 'cascade';

// ============================================
// Main Validation Functions
// ============================================

/**
 * Validate all diagram components against inventory
 * Returns detailed mismatches for debugging/fixing
 */
export function validateDiagramInventoryConsistency(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): ValidationResult {
  const mismatches: ComponentMismatch[] = [];
  let orphanedCount = 0;
  let syncedCount = 0;

  const inventoryMap = new Map(inventory.map(i => [i.id, i]));

  for (const comp of diagram.components) {
    // Check if component has a source reference
    if (!comp.sourceInventoryId) {
      // Legacy component without reference - try to find by ID prefix
      const baseId = comp.id.split('-')[0];
      const source = inventoryMap.get(baseId);

      if (!source) {
        mismatches.push({
          diagramComponentId: comp.id,
          diagramComponentName: comp.name,
          inventoryId: undefined,
          field: 'orphaned',
          expected: 'Component should have inventory source',
          actual: 'No sourceInventoryId and no matching inventory item',
          severity: 'warning',
        });
        orphanedCount++;
        continue;
      }
      // Found by ID prefix - check consistency
      const sourceMismatches = compareComponent(comp, source);
      mismatches.push(...sourceMismatches);
      if (sourceMismatches.length === 0) syncedCount++;
      continue;
    }

    // Has sourceInventoryId - look it up
    const source = inventoryMap.get(comp.sourceInventoryId);

    if (!source) {
      // Source was deleted from inventory
      mismatches.push({
        diagramComponentId: comp.id,
        diagramComponentName: comp.name,
        inventoryId: comp.sourceInventoryId,
        field: 'missing',
        expected: `Inventory item ${comp.sourceInventoryId}`,
        actual: 'Inventory item no longer exists',
        severity: 'error',
      });
      orphanedCount++;
      continue;
    }

    // Compare all fields
    const sourceMismatches = compareComponent(comp, source);
    mismatches.push(...sourceMismatches);
    if (sourceMismatches.length === 0) syncedCount++;
  }

  return {
    isValid: mismatches.length === 0,
    mismatches,
    orphanedCount,
    syncedCount,
    totalChecked: diagram.components.length,
  };
}

/**
 * Compare a diagram component against its inventory source
 */
function compareComponent(
  diagramComp: ElectronicComponent,
  inventoryComp: ElectronicComponent
): ComponentMismatch[] {
  const mismatches: ComponentMismatch[] = [];
  const inventoryId = diagramComp.sourceInventoryId || inventoryComp.id;

  // Check name
  if (diagramComp.name !== inventoryComp.name) {
    mismatches.push({
      diagramComponentId: diagramComp.id,
      diagramComponentName: diagramComp.name,
      inventoryId,
      field: 'name',
      expected: inventoryComp.name,
      actual: diagramComp.name,
      severity: 'error',
    });
  }

  // Check type
  if (diagramComp.type !== inventoryComp.type) {
    mismatches.push({
      diagramComponentId: diagramComp.id,
      diagramComponentName: diagramComp.name,
      inventoryId,
      field: 'type',
      expected: inventoryComp.type,
      actual: diagramComp.type,
      severity: 'error',
    });
  }

  // Check pins (order-independent comparison)
  const diagramPins = new Set(diagramComp.pins || []);
  const inventoryPins = new Set(inventoryComp.pins || []);

  if (!areSetsEqual(diagramPins, inventoryPins)) {
    mismatches.push({
      diagramComponentId: diagramComp.id,
      diagramComponentName: diagramComp.name,
      inventoryId,
      field: 'pins',
      expected: Array.from(inventoryPins),
      actual: Array.from(diagramPins),
      severity: 'error',
    });
  }

  return mismatches;
}

/**
 * Check if two sets are equal
 */
function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

// ============================================
// Usage Analysis (for deletion rules)
// ============================================

/**
 * Analyze how an inventory item is used across all diagrams
 */
export function analyzeUsage(
  inventoryId: string,
  currentDiagram: WiringDiagram,
  savedDiagrams: WiringDiagram[] = []
): ComponentUsage {
  const allDiagrams = [currentDiagram, ...savedDiagrams];
  const diagramIds: string[] = [];
  let totalConnections = 0;
  let hasActiveConnections = false;
  let inSavedDiagrams = false;

  for (let i = 0; i < allDiagrams.length; i++) {
    const diagram = allDiagrams[i];
    const isSaved = i > 0; // First is current, rest are saved

    // Find instances of this inventory item in the diagram
    const instances = diagram.components.filter(c =>
      c.sourceInventoryId === inventoryId ||
      c.id === inventoryId ||
      c.id.startsWith(`${inventoryId}-`)
    );

    if (instances.length > 0) {
      diagramIds.push(diagram.title || `Diagram ${i}`);
      if (isSaved) inSavedDiagrams = true;

      // Check for connections to these instances
      for (const instance of instances) {
        const connections = countConnectionsToComponent(instance.id, diagram.connections);
        totalConnections += connections;
        if (connections > 0) hasActiveConnections = true;
      }
    }
  }

  return {
    inventoryId,
    inDiagramCount: diagramIds.length,
    hasActiveConnections,
    connectionCount: totalConnections,
    inSavedDiagrams,
    onlyInDrafts: diagramIds.length > 0 && !inSavedDiagrams,
    diagramIds,
  };
}

/**
 * Count connections to a specific component
 */
function countConnectionsToComponent(
  componentId: string,
  connections: WireConnection[]
): number {
  return connections.filter(
    c => c.fromComponentId === componentId || c.toComponentId === componentId
  ).length;
}

// ============================================
// Smart Orphan Handling
// ============================================

/**
 * Determine what action to take when deleting an inventory item
 * Based on context-aware rules
 */
export function determineOrphanAction(
  inventoryId: string,
  currentDiagram: WiringDiagram,
  savedDiagrams: WiringDiagram[] = []
): { action: OrphanAction; reason: string; usage: ComponentUsage } {
  const usage = analyzeUsage(inventoryId, currentDiagram, savedDiagrams);

  // BLOCK: Component has active wired connections
  if (usage.hasActiveConnections) {
    return {
      action: 'block',
      reason: `Cannot delete: component is used in ${usage.connectionCount} wire connection(s). Remove wires first.`,
      usage,
    };
  }

  // WARN: Component exists in SAVED diagrams
  if (usage.inSavedDiagrams) {
    return {
      action: 'warn',
      reason: `Component is used in ${usage.inDiagramCount} saved diagram(s): ${usage.diagramIds.join(', ')}. Remove from all?`,
      usage,
    };
  }

  // CASCADE: Component only in current/draft diagram with no connections
  if (usage.onlyInDrafts) {
    return {
      action: 'cascade',
      reason: `Component will be removed from current diagram (no saved references).`,
      usage,
    };
  }

  // Not used anywhere - safe to delete
  return {
    action: 'cascade',
    reason: 'Component is not used in any diagrams.',
    usage,
  };
}

// ============================================
// Sync Helpers
// ============================================

/**
 * Migration mapping for legacy component IDs
 */
const LEGACY_ID_MAP: Record<string, string> = {
  'mcu': 'mcu-arduino-uno-r3',
  'mcu1': 'mcu-arduino-uno-r3',
  'pot': 'other-potentiometer',
  'pot1': 'other-potentiometer',
  'servo': 'actuator-servo',
  'servo1': 'actuator-servo',
  'sensor': 'sensor-hcsr04',
  'hcsr04': 'sensor-hcsr04',
  'dht11': 'sensor-dht11',
  'lcd': 'display-lcd1602',
};

/**
 * Repairs a legacy diagram by mapping old IDs to new semantic inventory IDs
 */
export function migrateLegacyDiagram(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): { diagram: WiringDiagram; repairedCount: number } {
  let repairedCount = 0;
  const inventoryIds = new Set(inventory.map(i => i.id));

  const migratedComponents = diagram.components.map(comp => {
    // Already has a valid reference?
    if (comp.sourceInventoryId && inventoryIds.has(comp.sourceInventoryId)) {
      return comp;
    }

    // Try to find mapping for legacy ID or prefix
    const baseId = comp.sourceInventoryId || comp.id.split('-')[0];
    const newSourceId = LEGACY_ID_MAP[baseId] || LEGACY_ID_MAP[comp.name.toLowerCase()] || undefined;

    if (newSourceId && inventoryIds.has(newSourceId)) {
      repairedCount++;
      return {
        ...comp,
        sourceInventoryId: newSourceId
      };
    }

    // Fallback: try finding by name exact match
    const byName = inventory.find(i => i.name === comp.name);
    if (byName) {
      repairedCount++;
      return {
        ...comp,
        sourceInventoryId: byName.id
      };
    }

    return comp;
  });

  return {
    diagram: {
      ...diagram,
      components: migratedComponents
    },
    repairedCount
  };
}

/**
 * Sync a diagram component with its inventory source
 * Returns the updated component (or original if no source found)
 */
export function syncComponentWithInventory(
  diagramComp: ElectronicComponent,
  inventory: ElectronicComponent[]
): ElectronicComponent {
  const inventoryMap = new Map(inventory.map(i => [i.id, i]));

  // Find source
  const sourceId = diagramComp.sourceInventoryId || diagramComp.id.split('-')[0];
  const source = inventoryMap.get(sourceId);

  if (!source) {
    // No source found - return as-is
    return diagramComp;
  }

  // Sync fields from inventory (preserve diagram instance id)
  return {
    ...diagramComp,
    sourceInventoryId: source.id,
    name: source.name,
    type: source.type,
    description: source.description,
    pins: source.pins ? [...source.pins] : undefined,
    datasheetUrl: source.datasheetUrl,
    imageUrl: source.imageUrl,
  };
}

/**
 * Sync all diagram components with inventory
 * Returns new diagram with synced components
 */
export function syncDiagramWithInventory(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): { diagram: WiringDiagram; changeCount: number } {
  let changeCount = 0;

  const syncedComponents = diagram.components.map(comp => {
    const synced = syncComponentWithInventory(comp, inventory);

    // Check if anything changed
    if (JSON.stringify(comp) !== JSON.stringify(synced)) {
      changeCount++;
    }

    return synced;
  });

  return {
    diagram: {
      ...diagram,
      components: syncedComponents,
    },
    changeCount,
  };
}

/**
 * Remove orphaned components from diagram
 * (components whose inventory source no longer exists)
 */
export function removeOrphanedComponents(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): { diagram: WiringDiagram; removedIds: string[] } {
  const inventoryIds = new Set(inventory.map(i => i.id));
  const removedIds: string[] = [];

  const filteredComponents = diagram.components.filter(comp => {
    const sourceId = comp.sourceInventoryId || comp.id.split('-')[0];
    const exists = inventoryIds.has(sourceId);

    if (!exists) {
      removedIds.push(comp.id);
    }

    return exists;
  });

  // Also remove connections to removed components
  const removedIdSet = new Set(removedIds);
  const filteredConnections = diagram.connections.filter(
    c => !removedIdSet.has(c.fromComponentId) && !removedIdSet.has(c.toComponentId)
  );

  return {
    diagram: {
      ...diagram,
      components: filteredComponents,
      connections: filteredConnections,
    },
    removedIds,
  };
}

// ============================================
// Debug/Dev Utilities
// ============================================

/**
 * Log validation results to console (dev mode only)
 */
export function logValidationResult(result: ValidationResult, label = 'Validation'): void {
  if (result.isValid) {
    console.log(`✅ ${label}: All ${result.totalChecked} components in sync`);
    return;
  }

  console.group(`❌ ${label}: ${result.mismatches.length} mismatch(es) found`);
  console.log(`Synced: ${result.syncedCount}/${result.totalChecked}`);
  console.log(`Orphaned: ${result.orphanedCount}`);

  for (const m of result.mismatches) {
    const icon = m.severity === 'error' ? '🔴' : '🟡';
    console.log(`${icon} [${m.field}] ${m.diagramComponentName} (${m.diagramComponentId})`);
    console.log(`   Expected: ${JSON.stringify(m.expected)}`);
    console.log(`   Actual:   ${JSON.stringify(m.actual)}`);
  }

  console.groupEnd();
}

/**
 * Validates a 3D model's dimensions against expected standards.
 * Returns a score from 0-1 and any specific deviations.
 */
export function verifyModelDimensions(
  model: any, // Three.js Object3D (as JSON or instance)
  expected: { width: number, length: number, height: number }
): { score: number; deviations: string[] } {
  const deviations: string[] = [];
  
  // Calculate bounding box from JSON data if necessary
  // For simplicity here, we assume we are checking the dimensions already extracted
  // In reality, ThreeViewer will call this after loading.
  
  const widthDiff = Math.abs(model.width - expected.width);
  const lengthDiff = Math.abs(model.length - expected.length);
  const heightDiff = Math.abs(model.height - expected.height);

  if (widthDiff > expected.width * 0.1) deviations.push(`Width mismatch: ${model.width}mm vs ${expected.width}mm`);
  if (lengthDiff > expected.length * 0.1) deviations.push(`Length mismatch: ${model.length}mm vs ${expected.length}mm`);
  if (heightDiff > expected.height * 0.2) deviations.push(`Height mismatch: ${model.height}mm vs ${expected.height}mm`);

  const score = Math.max(0, 1 - (deviations.length * 0.3));
  return { score, deviations };
}
