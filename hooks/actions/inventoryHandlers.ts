import { ActionContext, HandlerResult } from './types';
import { ElectronicComponent } from '../../types';

interface AddInventoryPartPayload {
  component: ElectronicComponent;
}

interface UpdateInventoryPartPayload {
  componentId: string;
  updates: Partial<ElectronicComponent>;
}

interface RemoveInventoryPartPayload {
  componentId: string;
}

export async function addInventoryPart(
  payload: AddInventoryPartPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { component } = payload;
  if (!component?.id) {
    return { success: false, error: 'Component with id is required' };
  }

  const exists = context.inventory.some((item) => item.id === component.id);
  if (exists) {
    return { success: false, error: `Inventory part ${component.id} already exists` };
  }

  context.setInventory((prev) => [...prev, component]);
  return { success: true };
}

export async function updateInventoryPart(
  payload: UpdateInventoryPartPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId, updates } = payload;
  if (!componentId) {
    return { success: false, error: 'componentId is required' };
  }

  let updated = false;
  context.setInventory((prev) =>
    prev.map((item) => {
      if (item.id !== componentId) return item;
      updated = true;
      return { ...item, ...updates };
    })
  );

  return updated
    ? { success: true }
    : { success: false, error: `Inventory part ${componentId} not found` };
}

export async function removeInventoryPart(
  payload: RemoveInventoryPartPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId } = payload;
  if (!componentId) {
    return { success: false, error: 'componentId is required' };
  }

  const exists = context.inventory.some((item) => item.id === componentId);
  if (!exists) {
    return { success: false, error: `Inventory part ${componentId} not found` };
  }

  context.setInventory((prev) => prev.filter((item) => item.id !== componentId));
  return { success: true };
}
