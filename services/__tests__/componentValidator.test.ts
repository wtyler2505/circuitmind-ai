/**
 * Tests for componentValidator service
 * Ensures inventory-canvas consistency validation works correctly
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateDiagramInventoryConsistency,
  analyzeUsage,
  determineOrphanAction,
  syncComponentWithInventory,
  syncDiagramWithInventory,
  removeOrphanedComponents,
} from '../componentValidator';
import type { ElectronicComponent, WiringDiagram } from '../../types';

// ============================================
// Test Data Factories
// ============================================

const createComponent = (overrides: Partial<ElectronicComponent> = {}): ElectronicComponent => ({
  id: 'test-component',
  name: 'Test Component',
  type: 'sensor',
  description: 'A test component',
  pins: ['VCC', 'GND', 'DATA'],
  ...overrides,
});

const createDiagram = (components: ElectronicComponent[] = [], connections: any[] = []): WiringDiagram => ({
  title: 'Test Diagram',
  components,
  connections,
  explanation: 'Test diagram',
});

// ============================================
// validateDiagramInventoryConsistency Tests
// ============================================

describe('validateDiagramInventoryConsistency', () => {
  it('should return valid for empty diagram', () => {
    const diagram = createDiagram();
    const inventory: ElectronicComponent[] = [];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(true);
    expect(result.mismatches).toHaveLength(0);
    expect(result.totalChecked).toBe(0);
  });

  it('should return valid when all components match', () => {
    const inventoryItem = createComponent({ id: '1', name: 'Arduino Uno' });
    const diagramItem = createComponent({
      id: '1-123456',
      name: 'Arduino Uno',
      sourceInventoryId: '1',
    });

    const diagram = createDiagram([diagramItem]);
    const inventory = [inventoryItem];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(true);
    expect(result.syncedCount).toBe(1);
  });

  it('should detect name mismatch', () => {
    const inventoryItem = createComponent({ id: '1', name: 'Arduino Uno R3' });
    const diagramItem = createComponent({
      id: '1-123456',
      name: 'Arduino Uno',
      sourceInventoryId: '1',
    });

    const diagram = createDiagram([diagramItem]);
    const inventory = [inventoryItem];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(false);
    expect(result.mismatches).toHaveLength(1);
    expect(result.mismatches[0].field).toBe('name');
    expect(result.mismatches[0].expected).toBe('Arduino Uno R3');
    expect(result.mismatches[0].actual).toBe('Arduino Uno');
  });

  it('should detect type mismatch', () => {
    const inventoryItem = createComponent({ id: '1', type: 'microcontroller' });
    const diagramItem = createComponent({
      id: '1-123456',
      type: 'sensor',
      sourceInventoryId: '1',
    });

    const diagram = createDiagram([diagramItem]);
    const inventory = [inventoryItem];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(false);
    expect(result.mismatches.some(m => m.field === 'type')).toBe(true);
  });

  it('should detect pin mismatch', () => {
    const inventoryItem = createComponent({ id: '1', pins: ['VCC', 'GND', 'D0', 'D1'] });
    const diagramItem = createComponent({
      id: '1-123456',
      pins: ['VCC', 'GND'],
      sourceInventoryId: '1',
    });

    const diagram = createDiagram([diagramItem]);
    const inventory = [inventoryItem];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(false);
    expect(result.mismatches.some(m => m.field === 'pins')).toBe(true);
  });

  it('should detect orphaned component (source deleted)', () => {
    const diagramItem = createComponent({
      id: '1-123456',
      sourceInventoryId: 'deleted-id',
    });

    const diagram = createDiagram([diagramItem]);
    const inventory: ElectronicComponent[] = [];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    expect(result.isValid).toBe(false);
    expect(result.orphanedCount).toBe(1);
    expect(result.mismatches[0].field).toBe('missing');
  });

  it('should handle legacy components without sourceInventoryId', () => {
    const inventoryItem = createComponent({ id: '1', name: 'Arduino' });
    const legacyDiagramItem = createComponent({
      id: '1-123456',
      name: 'Arduino',
      // No sourceInventoryId - legacy component
    });

    const diagram = createDiagram([legacyDiagramItem]);
    const inventory = [inventoryItem];

    const result = validateDiagramInventoryConsistency(diagram, inventory);

    // Should find match by ID prefix
    expect(result.isValid).toBe(true);
    expect(result.syncedCount).toBe(1);
  });
});

// ============================================
// analyzeUsage Tests
// ============================================

describe('analyzeUsage', () => {
  it('should return empty usage for unused component', () => {
    const diagram = createDiagram();

    const usage = analyzeUsage('unused-id', diagram);

    expect(usage.inDiagramCount).toBe(0);
    expect(usage.hasActiveConnections).toBe(false);
    expect(usage.connectionCount).toBe(0);
  });

  it('should detect component in diagram without connections', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp]);

    const usage = analyzeUsage('1', diagram);

    expect(usage.inDiagramCount).toBe(1);
    expect(usage.hasActiveConnections).toBe(false);
    expect(usage.connectionCount).toBe(0);
  });

  it('should detect component with active connections', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp], [
      { fromComponentId: '1-123456', fromPin: 'VCC', toComponentId: 'other', toPin: 'IN', description: 'test' },
    ]);

    const usage = analyzeUsage('1', diagram);

    expect(usage.hasActiveConnections).toBe(true);
    expect(usage.connectionCount).toBe(1);
  });

  it('should count multiple connections', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp], [
      { fromComponentId: '1-123456', fromPin: 'VCC', toComponentId: 'other', toPin: 'IN', description: 'test1' },
      { fromComponentId: 'other', fromPin: 'OUT', toComponentId: '1-123456', toPin: 'DATA', description: 'test2' },
    ]);

    const usage = analyzeUsage('1', diagram);

    expect(usage.connectionCount).toBe(2);
  });
});

// ============================================
// determineOrphanAction Tests
// ============================================

describe('determineOrphanAction', () => {
  it('should return cascade for unused component', () => {
    const diagram = createDiagram();

    const { action, reason } = determineOrphanAction('unused', diagram);

    expect(action).toBe('cascade');
    expect(reason).toContain('not used');
  });

  it('should return block for component with active connections', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp], [
      { fromComponentId: '1-123456', fromPin: 'VCC', toComponentId: 'other', toPin: 'IN', description: 'test' },
    ]);

    const { action, reason } = determineOrphanAction('1', diagram);

    expect(action).toBe('block');
    expect(reason).toContain('Cannot delete');
    expect(reason).toContain('wire');
  });

  it('should return cascade for component in diagram without connections', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp]);

    const { action } = determineOrphanAction('1', diagram);

    // No saved diagrams passed, so it's treated as draft only
    expect(action).toBe('cascade');
  });
});

// ============================================
// syncComponentWithInventory Tests
// ============================================

describe('syncComponentWithInventory', () => {
  it('should update component with inventory data', () => {
    const inventoryItem = createComponent({
      id: '1',
      name: 'Updated Name',
      type: 'microcontroller',
      pins: ['A', 'B', 'C'],
    });
    const diagramItem = createComponent({
      id: '1-123456',
      name: 'Old Name',
      type: 'sensor',
      pins: ['X', 'Y'],
      sourceInventoryId: '1',
    });

    const synced = syncComponentWithInventory(diagramItem, [inventoryItem]);

    expect(synced.id).toBe('1-123456'); // ID preserved
    expect(synced.name).toBe('Updated Name');
    expect(synced.type).toBe('microcontroller');
    expect(synced.pins).toEqual(['A', 'B', 'C']);
    expect(synced.sourceInventoryId).toBe('1');
  });

  it('should return original if no source found', () => {
    const diagramItem = createComponent({
      id: '1-123456',
      sourceInventoryId: 'missing',
    });

    const synced = syncComponentWithInventory(diagramItem, []);

    expect(synced).toEqual(diagramItem);
  });
});

// ============================================
// syncDiagramWithInventory Tests
// ============================================

describe('syncDiagramWithInventory', () => {
  it('should sync all components and count changes', () => {
    const inventoryItem = createComponent({ id: '1', name: 'New Name' });
    const diagramItem = createComponent({
      id: '1-123456',
      name: 'Old Name',
      sourceInventoryId: '1',
    });
    const diagram = createDiagram([diagramItem]);

    const { diagram: synced, changeCount } = syncDiagramWithInventory(diagram, [inventoryItem]);

    expect(changeCount).toBe(1);
    expect(synced.components[0].name).toBe('New Name');
  });

  it('should return 0 changes when already in sync', () => {
    const inventoryItem = createComponent({ id: '1', name: 'Same Name' });
    const diagramItem = createComponent({
      id: '1-123456',
      name: 'Same Name',
      sourceInventoryId: '1',
      type: inventoryItem.type,
      description: inventoryItem.description,
      pins: inventoryItem.pins,
    });
    const diagram = createDiagram([diagramItem]);

    const { changeCount } = syncDiagramWithInventory(diagram, [inventoryItem]);

    expect(changeCount).toBe(0);
  });
});

// ============================================
// removeOrphanedComponents Tests
// ============================================

describe('removeOrphanedComponents', () => {
  it('should remove components with deleted inventory source', () => {
    const orphanedComp = createComponent({
      id: '1-123456',
      sourceInventoryId: 'deleted',
    });
    const validComp = createComponent({
      id: '2-123456',
      sourceInventoryId: '2',
    });
    const diagram = createDiagram([orphanedComp, validComp]);
    const inventory = [createComponent({ id: '2' })];

    const { diagram: cleaned, removedIds } = removeOrphanedComponents(diagram, inventory);

    expect(cleaned.components).toHaveLength(1);
    expect(cleaned.components[0].id).toBe('2-123456');
    expect(removedIds).toContain('1-123456');
  });

  it('should also remove connections to orphaned components', () => {
    const orphanedComp = createComponent({ id: '1-123456', sourceInventoryId: 'deleted' });
    const validComp = createComponent({ id: '2-123456', sourceInventoryId: '2' });
    const diagram = createDiagram(
      [orphanedComp, validComp],
      [
        { fromComponentId: '1-123456', fromPin: 'OUT', toComponentId: '2-123456', toPin: 'IN', description: '' },
        { fromComponentId: '2-123456', fromPin: 'OUT', toComponentId: '3', toPin: 'IN', description: '' },
      ]
    );
    const inventory = [createComponent({ id: '2' })];

    const { diagram: cleaned } = removeOrphanedComponents(diagram, inventory);

    // Connection to orphaned component should be removed
    expect(cleaned.connections).toHaveLength(1);
    expect(cleaned.connections[0].fromComponentId).toBe('2-123456');
  });

  it('should return empty removedIds when nothing to remove', () => {
    const comp = createComponent({ id: '1-123456', sourceInventoryId: '1' });
    const diagram = createDiagram([comp]);
    const inventory = [createComponent({ id: '1' })];

    const { removedIds } = removeOrphanedComponents(diagram, inventory);

    expect(removedIds).toHaveLength(0);
  });
});
