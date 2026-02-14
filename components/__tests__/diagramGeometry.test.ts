import { describe, it, expect } from 'vitest';
import type { ElectronicComponent, WireConnection } from '../../types';
import {
  FOOTPRINT_CANVAS_SCALE,
  calculatePinPositions,
  getComponentShape,
} from '../diagram/componentShapes';
import {
  COMPONENT_HEIGHT,
  COMPONENT_WIDTH,
  calculateWireEndpoints,
  calculateWireMidpoint,
  resolveComponentBounds,
  resolvePinEndpoint,
  resolvePinEndpointWithFallback,
} from '../diagram/diagramUtils';
import { resolvePinWorldPosition } from '../diagram/3d/pinCoordinates';

describe('diagram geometry scaling', () => {
  const fzpzComponent: ElectronicComponent = {
    id: 'comp-fzpz-1',
    name: 'Scaled FZPZ Part',
    type: 'other',
    description: 'Test footprint component',
    pins: ['PIN_A', 'PIN_B'],
    footprint: {
      width: 20,
      height: 10,
      pins: [
        { id: 'PIN_A', x: 1, y: 2 },
        { id: 'PIN_B', x: 19, y: 8 },
      ],
    },
  };

  it('scales footprint pin coordinates to canvas units', () => {
    const shape = getComponentShape(fzpzComponent.type, fzpzComponent.name);

    const pins = calculatePinPositions(shape, fzpzComponent.pins || [], fzpzComponent);

    expect(pins).toEqual([
      expect.objectContaining({
        name: 'PIN_A',
        x: 1 * FOOTPRINT_CANVAS_SCALE,
        y: 2 * FOOTPRINT_CANVAS_SCALE,
        side: 'left',
      }),
      expect.objectContaining({
        name: 'PIN_B',
        x: 19 * FOOTPRINT_CANVAS_SCALE,
        y: 8 * FOOTPRINT_CANVAS_SCALE,
        side: 'right',
      }),
    ]);
  });

  it('resolves wire endpoint using scaled footprint pin coordinates', () => {
    const endpoint = resolvePinEndpoint(fzpzComponent, 'PIN_A', { x: 100, y: 200 });

    expect(endpoint).toEqual({
      x: 100 + 1 * FOOTPRINT_CANVAS_SCALE,
      y: 200 + 2 * FOOTPRINT_CANVAS_SCALE,
      side: 'left',
    });
  });

  it('resolves component bounds from footprint dimensions and global defaults', () => {
    expect(resolveComponentBounds(fzpzComponent)).toEqual({
      width: 20 * FOOTPRINT_CANVAS_SCALE,
      height: 10 * FOOTPRINT_CANVAS_SCALE,
    });

    expect(resolveComponentBounds(undefined)).toEqual({
      width: COMPONENT_WIDTH,
      height: COMPONENT_HEIGHT,
    });
  });

  it('falls back to resolved component bounds when pin endpoint cannot be resolved', () => {
    const connection: WireConnection = {
      fromComponentId: 'comp-fzpz-1',
      fromPin: 'MISSING_START_PIN',
      toComponentId: 'comp-fzpz-2',
      toPin: 'MISSING_END_PIN',
      description: 'Fallback wire',
      color: '#00f3ff',
    };

    const endComponent: ElectronicComponent = {
      id: 'comp-fzpz-2',
      name: 'Scaled FZPZ End Part',
      type: 'other',
      description: 'Fallback endpoint component',
      pins: ['X1'],
      footprint: {
        width: 12,
        height: 6,
        pins: [{ id: 'X1', x: 2, y: 3 }],
      },
    };

    const endpoints = calculateWireEndpoints(
      connection,
      fzpzComponent,
      endComponent,
      { x: 50, y: 70 },
      { x: 200, y: 300 }
    );

    expect(endpoints).toEqual({
      startX: 50 + (20 * FOOTPRINT_CANVAS_SCALE) / 2,
      startY: 70 + 10 * FOOTPRINT_CANVAS_SCALE + 10,
      endX: 200 + (12 * FOOTPRINT_CANVAS_SCALE) / 2,
      endY: 300 + 6 * FOOTPRINT_CANVAS_SCALE + 10,
    });
  });

  it('uses side-aware fallback endpoint for drag-start geometry when pin cannot be resolved', () => {
    const endpoint = resolvePinEndpointWithFallback(
      fzpzComponent,
      'MISSING_PIN',
      { x: 40, y: 60 },
      'left'
    );

    expect(endpoint).toEqual({
      x: 40,
      y: 60 + (10 * FOOTPRINT_CANVAS_SCALE) / 2,
      side: 'left',
    });
  });

  it('calculates routed wire midpoint using path points instead of straight-line midpoint', () => {
    const midpoint = calculateWireMidpoint(
      {
        startX: 0,
        startY: 0,
        endX: 10,
        endY: 10,
      },
      [{ x: 10, y: 0 }]
    );

    expect(midpoint).toEqual({ x: 10, y: 0 });
  });

  it('resolves 3D pin world position from shared footprint-aware endpoint geometry', () => {
    const pinWorld = resolvePinWorldPosition(
      fzpzComponent,
      'PIN_A',
      { x: 100, y: 200 },
      { scale: 0.5, offsetX: -200, offsetZ: -150, baseY: 3 }
    );

    expect(pinWorld.x).toBe((100 + 1 * FOOTPRINT_CANVAS_SCALE) * 0.5 - 200);
    expect(pinWorld.z).toBe((200 + 2 * FOOTPRINT_CANVAS_SCALE) * 0.5 - 150);
    expect(pinWorld.y).toBe(5);
  });
});
