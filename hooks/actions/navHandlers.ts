import { ActionContext, HandlerResult } from './types';

interface ComponentEditorPayload {
  componentId: string;
}

interface SwitchModePayload {
  mode: 'chat' | 'image' | 'video';
}

export async function openInventory(
  _payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  context.setIsInventoryOpen(true);
  return { success: true };
}

export async function closeInventory(
  _payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  context.setIsInventoryOpen(false);
  return { success: true };
}

export async function openSettings(
  _payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  context.setIsSettingsOpen(true);
  return { success: true };
}

export async function closeSettings(
  _payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  context.setIsSettingsOpen(false);
  return { success: true };
}

export async function openComponentEditor(
  payload: ComponentEditorPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const component = context.inventory.find((c) => c.id === payload.componentId);
  if (component) {
    context.setSelectedComponent(component);
    return { success: true };
  }
  return { success: false, error: `Component ${payload.componentId} not found` };
}

export async function switchGenerationMode(
  payload: SwitchModePayload,
  context: ActionContext
): Promise<HandlerResult> {
  context.setGenerationMode(payload.mode);
  return { success: true };
}
