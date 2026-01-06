import { ActionContext, HandlerResult } from './types';

interface HighlightPayload {
  componentId: string;
  color?: string;
  duration?: number;
  pulse?: boolean;
}

interface CenterOnPayload {
  componentId: string;
  zoom?: number;
}

interface ZoomToPayload {
  level: number;
}

interface PanToPayload {
  x: number;
  y: number;
}

interface HighlightWirePayload {
  wireIndex: number;
  color?: string;
  duration?: number;
  pulse?: boolean;
}

export async function highlight(
  payload: HighlightPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId, color, duration, pulse } = payload;
  context.canvasRef.current?.highlightComponent(componentId, { color, duration, pulse });
  return { success: true };
}

export async function centerOn(
  payload: CenterOnPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId, zoom } = payload;
  context.canvasRef.current?.centerOnComponent(componentId, zoom);
  return { success: true };
}

export async function zoomTo(
  payload: ZoomToPayload,
  context: ActionContext
): Promise<HandlerResult> {
  context.canvasRef.current?.setZoom(payload.level);
  return { success: true };
}

export async function panTo(
  payload: PanToPayload,
  context: ActionContext
): Promise<HandlerResult> {
  context.canvasRef.current?.setPan(payload.x, payload.y);
  return { success: true };
}

export async function resetView(
  _payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  context.canvasRef.current?.resetView();
  return { success: true };
}

export async function highlightWire(
  payload: HighlightWirePayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { wireIndex, color, duration, pulse } = payload;
  context.canvasRef.current?.highlightWire(wireIndex, { color, duration, pulse });
  return { success: true };
}