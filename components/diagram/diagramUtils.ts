import { WireConnection, ElectronicComponent, WirePoint } from '../../types';
import { getComponentShape, calculatePinPositions, FOOTPRINT_CANVAS_SCALE } from './componentShapes';

export const COMPONENT_WIDTH = 140;
export const COMPONENT_HEIGHT = 100;

export const resolveComponentBounds = (
  component: ElectronicComponent | undefined
): { width: number; height: number } => {
  if (!component) {
    return {
      width: COMPONENT_WIDTH,
      height: COMPONENT_HEIGHT,
    };
  }

  const baseShape = getComponentShape(component.type, component.name);

  if (component.footprint) {
    return {
      width: component.footprint.width * FOOTPRINT_CANVAS_SCALE,
      height: component.footprint.height * FOOTPRINT_CANVAS_SCALE,
    };
  }

  return {
    width: baseShape.width,
    height: baseShape.height,
  };
};

export interface PinEndpoint {
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export type PinSide = PinEndpoint['side'];

export interface WireEndpoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Calculate smart Bezier path between two points.
 * Uses cubic bezier for smooth curves, falls back to Manhattan routing
 * when components are too close horizontally.
 */
export const getSmartPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const isReversed = x1 > x2;
  const controlDist = Math.abs(x2 - x1) * 0.5;

  // Manhattan/zig-zag route for close horizontal components
  if (isReversed && Math.abs(x1 - x2) < 100) {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1 + 20} ${y1} L ${x1 + 20} ${midY} L ${x2 - 20} ${midY} L ${x2 - 20} ${y2} L ${x2} ${y2}`;
  }

  // Smooth cubic bezier curve
  const cp1x = x1 + (isReversed ? -controlDist : controlDist);
  const cp2x = x2 + (isReversed ? controlDist : -controlDist);

  return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
};

const resolveFallbackEndpoint = (
  position: { x: number; y: number },
  bounds: { width: number; height: number },
  preferredSide: PinSide = 'bottom'
): PinEndpoint => {
  switch (preferredSide) {
    case 'left':
      return {
        x: position.x,
        y: position.y + bounds.height / 2,
        side: 'left',
      };
    case 'right':
      return {
        x: position.x + bounds.width,
        y: position.y + bounds.height / 2,
        side: 'right',
      };
    case 'top':
      return {
        x: position.x + bounds.width / 2,
        y: position.y,
        side: 'top',
      };
    case 'bottom':
    default:
      return {
        x: position.x + bounds.width / 2,
        y: position.y + bounds.height + 10,
        side: 'bottom',
      };
  }
};

export const resolvePinEndpointWithFallback = (
  component: ElectronicComponent | undefined,
  pinName: string,
  position: { x: number; y: number },
  preferredSide: PinSide = 'bottom'
): PinEndpoint => {
  const endpoint = resolvePinEndpoint(component, pinName, position);
  if (endpoint) {
    return endpoint;
  }

  const bounds = resolveComponentBounds(component);
  return resolveFallbackEndpoint(position, bounds, preferredSide);
};

/**
 * Calculate wire endpoint coordinates based on pin positions.
 */
export const calculateWireEndpoints = (
  connection: WireConnection,
  startComponent: ElectronicComponent | undefined,
  endComponent: ElectronicComponent | undefined,
  startPos: { x: number; y: number },
  endPos: { x: number; y: number }
): WireEndpoints => {
  const startEndpoint = resolvePinEndpointWithFallback(
    startComponent,
    connection.fromPin,
    startPos,
    'bottom'
  );
  const endEndpoint = resolvePinEndpointWithFallback(
    endComponent,
    connection.toPin,
    endPos,
    'bottom'
  );

  return {
    startX: startEndpoint.x,
    startY: startEndpoint.y,
    endX: endEndpoint.x,
    endY: endEndpoint.y,
  };
};

export const calculateWireMidpoint = (
  endpoints: WireEndpoints,
  pathPoints?: WirePoint[]
): { x: number; y: number } => {
  const points = [
    { x: endpoints.startX, y: endpoints.startY },
    ...(pathPoints ?? []).map((point) => ({ x: point.x, y: point.y })),
    { x: endpoints.endX, y: endpoints.endY },
  ];

  if (points.length === 2) {
    return {
      x: (endpoints.startX + endpoints.endX) / 2,
      y: (endpoints.startY + endpoints.endY) / 2,
    };
  }

  let totalLength = 0;
  const segmentLengths: number[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const segmentLength = Math.hypot(dx, dy);
    segmentLengths.push(segmentLength);
    totalLength += segmentLength;
  }

  if (totalLength === 0) {
    return {
      x: points[0].x,
      y: points[0].y,
    };
  }

  const halfLength = totalLength / 2;
  let traversed = 0;

  for (let i = 0; i < segmentLengths.length; i += 1) {
    const segmentLength = segmentLengths[i];
    if (traversed + segmentLength >= halfLength) {
      const ratio = segmentLength === 0 ? 0 : (halfLength - traversed) / segmentLength;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    traversed += segmentLength;
  }

  return points[points.length - 1];
};

export const resolvePinEndpoint = (
  component: ElectronicComponent | undefined,
  pinName: string,
  position: { x: number; y: number }
): PinEndpoint | null => {
  if (!component) return null;

  const baseShape = getComponentShape(component.type, component.name);
  const bounds = resolveComponentBounds(component);
  const shape = {
    ...baseShape,
    width: bounds.width,
    height: bounds.height,
  };

  const pinPositions = calculatePinPositions(shape, component.pins || [], component);
  const match = pinPositions.find((p) => p.name === pinName);
  if (!match) return null;

  return {
    x: position.x + match.x,
    y: position.y + match.y,
    side: match.side,
  };
};
