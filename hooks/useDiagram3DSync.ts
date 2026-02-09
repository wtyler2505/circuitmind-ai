import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { WiringDiagram, ElectronicComponent } from '../types';
import { getComponentShape } from '../components/diagram/componentShapes';
import { createLODComponent } from '../components/diagram/3d/lodFactories';
import { createWireMaterial, createPlasticMaterial } from '../components/diagram/3d/materials';
import { getPinCoordinates } from '../components/diagram/3d/pinCoordinates';
import { getWireColor, disposeObject } from '../components/diagram/3d/wireUtils';
import type { SceneRefs } from './useDiagram3DScene';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCALE = 0.5;
const OFFSET_X = -200;
const OFFSET_Z = -150;

// ============================================================================
// COMPONENT LABEL CREATION
// ============================================================================

const createComponentLabel = (name: string): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText((name || 'Unknown').substring(0, 16), 256, 80);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const label = new THREE.Sprite(labelMaterial);
  label.position.set(0, 35, 0);
  label.scale.set(60, 15, 1);
  return label;
};

// ============================================================================
// WIRE CREATION
// ============================================================================

const createWireMesh = (
  startX: number, startY: number, startZ: number,
  endX: number, endY: number, endZ: number,
  fromPin: string,
  envMap: THREE.Texture | null
): THREE.Group => {
  const group = new THREE.Group();

  const wireHeight = Math.max(startY, endY) + 10 + Math.random() * 15;
  const midX = (startX + endX) / 2;
  const midZ = (startZ + endZ) / 2;
  const horizontalOffset = (Math.random() - 0.5) * 30;

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(startX, startY, startZ),
    new THREE.Vector3(startX, startY + 10, startZ),
    new THREE.Vector3(startX + horizontalOffset * 0.3, wireHeight, startZ + (midZ - startZ) * 0.3),
    new THREE.Vector3(midX + horizontalOffset, wireHeight + 5, midZ),
    new THREE.Vector3(endX - horizontalOffset * 0.3, wireHeight, endZ - (endZ - midZ) * 0.3),
    new THREE.Vector3(endX, endY + 10, endZ),
    new THREE.Vector3(endX, endY, endZ),
  ]);

  const tubeGeometry = new THREE.TubeGeometry(curve, 32, 1.5, 8, false);
  const wireMaterial = createWireMaterial(getWireColor(fromPin));
  wireMaterial.envMap = envMap;

  const wireMesh = new THREE.Mesh(tubeGeometry, wireMaterial);
  wireMesh.castShadow = true;
  wireMesh.receiveShadow = true;
  group.add(wireMesh);

  // Connectors at endpoints
  const connectorGeo = new THREE.CylinderGeometry(2, 2, 4, 8);
  const connectorMat = createPlasticMaterial(0x111111);

  const startConnector = new THREE.Mesh(connectorGeo, connectorMat);
  startConnector.position.set(startX, startY, startZ);
  startConnector.castShadow = true;
  group.add(startConnector);

  const endConnector = new THREE.Mesh(connectorGeo, connectorMat);
  endConnector.position.set(endX, endY, endZ);
  endConnector.castShadow = true;
  group.add(endConnector);

  return group;
};

// ============================================================================
// HOOK: useDiagram3DSync
// ============================================================================

export const useDiagram3DSync = (
  diagram: WiringDiagram | null,
  positions: Map<string, { x: number; y: number }>,
  sceneRefs: SceneRefs
): ElectronicComponent[] => {
  const [missingModels, setMissingModels] = useState<ElectronicComponent[]>([]);

  useEffect(() => {
    if (!diagram || !sceneRefs.componentsGroupRef.current || !sceneRefs.wiresGroupRef.current || !sceneRefs.sceneRef.current) return;

    const componentsGroup = sceneRefs.componentsGroupRef.current;
    const wiresGroup = sceneRefs.wiresGroupRef.current;
    const scene = sceneRefs.sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing
    while (componentsGroup.children.length > 0) {
      const child = componentsGroup.children[0];
      disposeObject(child);
      componentsGroup.remove(child);
    }
    while (wiresGroup.children.length > 0) {
      const child = wiresGroup.children[0];
      disposeObject(child);
      wiresGroup.remove(child);
    }

    const missing: ElectronicComponent[] = [];

    // Create 3D components with LOD
    diagram.components.forEach((component) => {
      if (!component || !component.id) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      if (isNaN(pos.x) || isNaN(pos.y)) {
        console.warn(`Invalid position for component ${component.id}`, pos);
        return;
      }

      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');
      if (!shape || isNaN(shape.width) || isNaN(shape.height)) {
        console.warn(`Invalid shape dimensions for ${component.id}`);
        return;
      }

      const width = shape.width * SCALE;
      const depth = shape.height * SCALE;

      if (!component.threeCode && !component.threeDModelUrl) {
        missing.push(component);
      }

      const lodComponent = createLODComponent(component, width, depth);
      lodComponent.position.set(
        pos.x * SCALE + OFFSET_X + width / 2,
        3,
        pos.y * SCALE + OFFSET_Z + depth / 2
      );
      lodComponent.userData = { component };

      // Apply environment map
      lodComponent.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.envMap = sceneRefs.envMapRef.current;
          child.material.needsUpdate = true;
        }
      });

      // Add label
      lodComponent.add(createComponentLabel(component.name || 'Unknown'));
      componentsGroup.add(lodComponent);
    });

    setMissingModels(missing);

    // Create 3D wires
    diagram.connections.forEach((connection) => {
      if (!connection.fromComponentId || !connection.toComponentId) return;

      const fromComponent = diagram.components.find((c) => c.id === connection.fromComponentId);
      const toComponent = diagram.components.find((c) => c.id === connection.toComponentId);
      if (!fromComponent || !toComponent) return;

      const fromPos = positions.get(fromComponent.id) || { x: 0, y: 0 };
      const toPos = positions.get(toComponent.id) || { x: 0, y: 0 };
      if (isNaN(fromPos.x) || isNaN(fromPos.y) || isNaN(toPos.x) || isNaN(toPos.y)) return;

      const fromShape = getComponentShape(fromComponent.type || 'other', fromComponent.name || 'Unknown');
      const toShape = getComponentShape(toComponent.type || 'other', toComponent.name || 'Unknown');

      const fromWidth = fromShape.width * SCALE;
      const fromDepth = fromShape.height * SCALE;
      const toWidth = toShape.width * SCALE;
      const toDepth = toShape.height * SCALE;

      const fromPinOffset = getPinCoordinates(
        fromComponent.type || 'other', fromComponent.name || 'Unknown',
        connection.fromPin || '', fromWidth, fromDepth
      );
      const toPinOffset = getPinCoordinates(
        toComponent.type || 'other', toComponent.name || 'Unknown',
        connection.toPin || '', toWidth, toDepth
      );

      if (isNaN(fromPinOffset.x) || isNaN(fromPinOffset.z) || isNaN(toPinOffset.x) || isNaN(toPinOffset.z)) {
        console.warn('Invalid pin coordinates', connection);
        return;
      }

      const startX = (fromPos.x * SCALE + OFFSET_X + fromWidth / 2) + fromPinOffset.x;
      const startY = 3 + fromPinOffset.y;
      const startZ = (fromPos.y * SCALE + OFFSET_Z + fromDepth / 2) + fromPinOffset.z;
      const endX = (toPos.x * SCALE + OFFSET_X + toWidth / 2) + toPinOffset.x;
      const endY = 3 + toPinOffset.y;
      const endZ = (toPos.y * SCALE + OFFSET_Z + toDepth / 2) + toPinOffset.z;

      const wireGroup = createWireMesh(
        startX, startY, startZ, endX, endY, endZ,
        connection.fromPin || '', sceneRefs.envMapRef.current
      );
      wiresGroup.add(wireGroup);
    });

    // Center camera
    if (diagram.components.length > 0) {
      const box = new THREE.Box3().setFromObject(componentsGroup);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        if (sceneRefs.controlsRef.current) {
          sceneRefs.controlsRef.current.target.copy(center);
          sceneRefs.controlsRef.current.target.y = 20;
        }
      }
    }

    if (sceneRefs.rendererRef.current) {
      sceneRefs.rendererRef.current.shadowMap.needsUpdate = true;
    }
    if (requestRender) requestRender();
  }, [diagram, positions, sceneRefs]);

  return missingModels;
};
