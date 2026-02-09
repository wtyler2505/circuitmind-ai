import { useEffect } from 'react';
import * as THREE from 'three';
import { WiringDiagram } from '../types';
import { getComponentShape } from '../components/diagram/componentShapes';
import { getPinCoordinates } from '../components/diagram/3d/pinCoordinates';
import { disposeObject } from '../components/diagram/3d/wireUtils';
import type { SceneRefs } from './useDiagram3DScene';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCALE = 0.5;
const OFFSET_X = -200;
const OFFSET_Z = -150;

// ============================================================================
// TELEMETRY SPRITE CREATION
// ============================================================================

const createTelemetrySprite = (
  value: string | number,
  posX: number, posY: number, posZ: number
): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = value === 'HIGH' || value === '1' ? '#00ff9d' : '#00f3ff';
    ctx.beginPath();
    ctx.roundRect(0, 0, 128, 64, 12);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), 64, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(posX, posY + 15, posZ);
  sprite.scale.set(24, 12, 1);
  return sprite;
};

// ============================================================================
// HOOK: useDiagram3DTelemetry
// ============================================================================

export const useDiagram3DTelemetry = (
  liveData: Record<string, { value: string | number | boolean }>,
  diagram: WiringDiagram | null,
  positions: Map<string, { x: number; y: number }>,
  sceneRefs: SceneRefs
): void => {
  useEffect(() => {
    if (!sceneRefs.telemetryGroupRef.current || !diagram || !sceneRefs.sceneRef.current) return;

    const group = sceneRefs.telemetryGroupRef.current;
    const scene = sceneRefs.sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing sprites
    while (group.children.length > 0) {
      const child = group.children[0];
      disposeObject(child);
      group.remove(child);
    }

    // Create sprites for each data point
    Object.entries(liveData).forEach(([key, packet]) => {
      const [componentId, pin] = key.split(':');
      const component = diagram.components.find(c => c.id === componentId);
      if (!component) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');
      const width = shape.width * SCALE;
      const depth = shape.height * SCALE;

      const pinOffset = getPinCoordinates(
        component.type || 'other',
        component.name || 'Unknown',
        pin === 'default' ? '' : pin,
        width,
        depth
      );

      const sprite = createTelemetrySprite(
        typeof packet.value === 'boolean' ? String(packet.value) : packet.value,
        pos.x * SCALE + OFFSET_X + width / 2 + pinOffset.x,
        3 + pinOffset.y,
        pos.y * SCALE + OFFSET_Z + depth / 2 + pinOffset.z
      );
      group.add(sprite);
    });

    if (requestRender) requestRender();
  }, [liveData, diagram, positions, sceneRefs]);
};
