import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addInventoryPart, updateInventoryPart, removeInventoryPart } from '../inventoryHandlers';
import type { ActionContext } from '../types';
import type { ElectronicComponent } from '../../../types';

function makeContext(inventory: ElectronicComponent[]): ActionContext {
  const context = {
    canvasRef: { current: null } as unknown as ActionContext['canvasRef'],
    inventory: [...inventory],
    diagram: null,
    setInventory: vi.fn(),
    setIsInventoryOpen: vi.fn(),
    setIsSettingsOpen: vi.fn(),
    setSelectedComponent: vi.fn(),
    setGenerationMode: vi.fn(),
    updateDiagram: vi.fn(),
    activeConversationId: 'test-conv',
    recordUndo: vi.fn(async () => undefined),
    handleUndo: vi.fn(),
    handleRedo: vi.fn(),
    saveDiagram: vi.fn(),
    loadDiagram: vi.fn(),
  } as unknown as ActionContext;

  context.setInventory = ((updater: unknown) => {
    const nextInventory =
      typeof updater === 'function'
        ? (updater as (prev: ElectronicComponent[]) => ElectronicComponent[])(context.inventory)
        : (updater as ElectronicComponent[]);
    context.inventory = nextInventory;
  }) as ActionContext['setInventory'];

  return context;
}

describe('inventoryHandlers', () => {
  let baseComponent: ElectronicComponent;

  beforeEach(() => {
    baseComponent = {
      id: 'comp-1',
      name: 'Test Sensor',
      type: 'sensor',
      description: 'Test component',
      pins: ['VCC', 'GND'],
      quantity: 1,
    };
  });

  it('adds a new inventory part', async () => {
    const context = makeContext([]);

    const result = await addInventoryPart({ component: baseComponent }, context);

    expect(result.success).toBe(true);
    expect(context.inventory).toHaveLength(1);
    expect(context.inventory[0].id).toBe('comp-1');
  });

  it('updates an existing inventory part', async () => {
    const context = makeContext([baseComponent]);

    const result = await updateInventoryPart(
      { componentId: 'comp-1', updates: { quantity: 5, description: 'Updated' } },
      context
    );

    expect(result.success).toBe(true);
    expect(context.inventory[0].quantity).toBe(5);
    expect(context.inventory[0].description).toBe('Updated');
  });

  it('removes an existing inventory part', async () => {
    const context = makeContext([baseComponent]);

    const result = await removeInventoryPart({ componentId: 'comp-1' }, context);

    expect(result.success).toBe(true);
    expect(context.inventory).toHaveLength(0);
  });
});
