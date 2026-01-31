import { WireConnection, ElectronicComponent } from '../../types';

export const COMPONENT_WIDTH = 140;
export const COMPONENT_HEIGHT = 100;

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

/**
 * Calculate wire endpoint coordinates based on pin positions.
 */
export const calculateWireEndpoints = (
  connection: WireConnection,
  startComponent: ElectronicComponent | undefined,
  endComponent: ElectronicComponent | undefined,
  startPos: { x: number; y: number },
  endPos: { x: number; y: number }
) => {
  let startX = startPos.x;
  let startY = startPos.y;
  const startPinIdx = (startComponent?.pins || []).indexOf(connection.fromPin);

  if (startPinIdx !== -1) {
    const isLeft = endPos.x < startPos.x;
    startX += isLeft ? 0 : COMPONENT_WIDTH;
    startY += 40 + startPinIdx * 15;
  } else {
    // Fallback: bottom-center for missing pins
    startX += COMPONENT_WIDTH / 2;
    startY += COMPONENT_HEIGHT + 10;
  }

  let endX = endPos.x;
  let endY = endPos.y;
  const endPinIdx = (endComponent?.pins || []).indexOf(connection.toPin);

  if (endPinIdx !== -1) {
    const isLeft = endPos.x < startPos.x;
    endX += isLeft ? COMPONENT_WIDTH : 0;
    endY += 40 + endPinIdx * 15;
  } else {
    // Fallback: bottom-center for missing pins
    endX += COMPONENT_WIDTH / 2;
    endY += COMPONENT_HEIGHT + 10;
  }

  return { startX, startY, endX, endY };
};
