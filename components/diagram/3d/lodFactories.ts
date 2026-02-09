import * as THREE from 'three';
import { ElectronicComponent } from '../../../types';
import { createSimpleMaterial } from './materials';
import {
  createArduinoGeometry,
  createLCDGeometry,
  createDHT11Geometry,
  createBreadboardGeometry,
  createGenericICGeometry,
} from './geometryFactories';
import { validateThreeCode } from './codeValidation';
import { executeInWorker } from '../../../services/threeCodeRunner';

// ============================================================================
// LOD DISTANCE THRESHOLDS
// ============================================================================

const LOD_HIGH_DISTANCE = 0;
const LOD_MEDIUM_DISTANCE = 300;
const LOD_LOW_DISTANCE = 600;

// ============================================================================
// NAME PATTERN MATCHERS
// ============================================================================

type NameMatcher = { test: (name: string) => boolean };

const ARDUINO_MATCHER: NameMatcher = {
  test: (name) => name.includes('arduino') || name.includes('uno') || name.includes('mega'),
};
const LCD_MATCHER: NameMatcher = {
  test: (name) => name.includes('lcd') || name.includes('display') || name.includes('1602'),
};
const DHT_MATCHER: NameMatcher = {
  test: (name) => name.includes('dht') || name.includes('temperature') || name.includes('humidity'),
};
const BREADBOARD_MATCHER: NameMatcher = {
  test: (name) => name.includes('breadboard') || name.includes('830'),
};

// ============================================================================
// LOW-POLY FACTORIES
// ============================================================================

const createArduinoLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const pcbGeo = new THREE.BoxGeometry(width, 2, depth, 1, 1, 1);
  const pcb = new THREE.Mesh(pcbGeo, createSimpleMaterial(0x0d6b3d));
  pcb.position.y = 1;
  pcb.castShadow = true;
  group.add(pcb);

  const chipGeo = new THREE.BoxGeometry(width * 0.4, 8, depth * 0.3, 1, 1, 1);
  const chip = new THREE.Mesh(chipGeo, createSimpleMaterial(0x1a1a1a));
  chip.position.set(0, 6, 0);
  chip.castShadow = true;
  group.add(chip);

  return group;
};

const createArduinoMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const pcbGeo = new THREE.BoxGeometry(width, 2, depth, 2, 1, 2);
  const pcb = new THREE.Mesh(pcbGeo, createSimpleMaterial(0x0d6b3d));
  pcb.position.y = 1;
  pcb.castShadow = true;
  group.add(pcb);

  const usbGeo = new THREE.BoxGeometry(12, 8, 14, 1, 1, 1);
  const usb = new THREE.Mesh(usbGeo, createSimpleMaterial(0x808080));
  usb.position.set(-width / 2 + 10, 6, 0);
  usb.castShadow = true;
  group.add(usb);

  const chipGeo = new THREE.BoxGeometry(15, 4, 15, 1, 1, 1);
  const chip = new THREE.Mesh(chipGeo, createSimpleMaterial(0x1a1a1a));
  chip.position.set(width * 0.15, 4, 0);
  chip.castShadow = true;
  group.add(chip);

  const headerGeo = new THREE.BoxGeometry(width * 0.7, 10, 3, 1, 1, 1);
  const headerMat = createSimpleMaterial(0x1a1a1a);
  const header1 = new THREE.Mesh(headerGeo, headerMat);
  header1.position.set(width * 0.1, 7, depth / 2 - 5);
  group.add(header1);

  const header2 = new THREE.Mesh(headerGeo.clone(), headerMat.clone());
  header2.position.set(width * 0.1, 7, -depth / 2 + 5);
  group.add(header2);

  return group;
};

const createLCDLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const bezelGeo = new THREE.BoxGeometry(width, 10, depth, 1, 1, 1);
  const bezel = new THREE.Mesh(bezelGeo, createSimpleMaterial(0x1e40af));
  bezel.position.y = 5;
  bezel.castShadow = true;
  group.add(bezel);

  const screenGeo = new THREE.PlaneGeometry(width * 0.8, depth * 0.5);
  const screen = new THREE.Mesh(screenGeo, createSimpleMaterial(0x2dd4bf));
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, 10.1, 0);
  group.add(screen);

  return group;
};

const createLCDMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const bezelGeo = new THREE.BoxGeometry(width, 10, depth, 2, 1, 2);
  const bezel = new THREE.Mesh(bezelGeo, createSimpleMaterial(0x1e40af));
  bezel.position.y = 5;
  bezel.castShadow = true;
  group.add(bezel);

  const screenGeo = new THREE.BoxGeometry(width * 0.85, 1, depth * 0.6);
  const screen = new THREE.Mesh(screenGeo, createSimpleMaterial(0x2dd4bf));
  screen.position.set(0, 10.5, 0);
  group.add(screen);

  const backpackGeo = new THREE.BoxGeometry(width * 0.4, 3, depth * 0.3);
  const backpack = new THREE.Mesh(backpackGeo, createSimpleMaterial(0x0d6b3d));
  backpack.position.set(0, 12, -depth / 2 + depth * 0.2);
  group.add(backpack);

  return group;
};

const createDHT11LowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const housingGeo = new THREE.BoxGeometry(width, 8, depth, 1, 1, 1);
  const housing = new THREE.Mesh(housingGeo, createSimpleMaterial(0x3b82f6));
  housing.position.y = 4;
  housing.castShadow = true;
  group.add(housing);

  return group;
};

const createDHT11MediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const housingGeo = new THREE.BoxGeometry(width, 8, depth, 2, 1, 2);
  const housing = new THREE.Mesh(housingGeo, createSimpleMaterial(0x3b82f6));
  housing.position.y = 4;
  housing.castShadow = true;
  group.add(housing);

  const ventGeo = new THREE.PlaneGeometry(width * 0.6, 4);
  const vent = new THREE.Mesh(ventGeo, createSimpleMaterial(0x1e3a5f));
  vent.rotation.x = -Math.PI / 2;
  vent.position.set(0, 8.1, 0);
  group.add(vent);

  return group;
};

const createBreadboardLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const baseGeo = new THREE.BoxGeometry(width, 8, depth, 1, 1, 1);
  const base = new THREE.Mesh(baseGeo, createSimpleMaterial(0xf5f5f0));
  base.position.y = 4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const railGeo = new THREE.BoxGeometry(width, 0.5, 8);
  const redRail = new THREE.Mesh(railGeo, createSimpleMaterial(0xdc2626));
  redRail.position.set(0, 8.3, depth / 2 - 8);
  group.add(redRail);

  const blueRail = new THREE.Mesh(railGeo.clone(), createSimpleMaterial(0x2563eb));
  blueRail.position.set(0, 8.3, -depth / 2 + 8);
  group.add(blueRail);

  return group;
};

const createBreadboardMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  const baseGeo = new THREE.BoxGeometry(width, 8, depth, 2, 1, 2);
  const base = new THREE.Mesh(baseGeo, createSimpleMaterial(0xf5f5f0));
  base.position.y = 4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const dividerGeo = new THREE.BoxGeometry(width * 0.95, 1, 6);
  const divider = new THREE.Mesh(dividerGeo, createSimpleMaterial(0xe5e5e0));
  divider.position.set(0, 8.5, 0);
  group.add(divider);

  const railGeo = new THREE.BoxGeometry(width * 0.95, 0.5, 12);
  const redRail = new THREE.Mesh(railGeo, createSimpleMaterial(0xdc2626));
  redRail.position.set(0, 8.3, depth / 2 - 10);
  group.add(redRail);

  const blueRail = new THREE.Mesh(railGeo.clone(), createSimpleMaterial(0x2563eb));
  blueRail.position.set(0, 8.3, -depth / 2 + 10);
  group.add(blueRail);

  return group;
};

const getGenericColor = (type: string): number => {
  if (type.includes('sensor')) return 0x3b82f6;
  if (type.includes('motor') || type.includes('actuator')) return 0x7c3aed;
  if (type.includes('power')) return 0xf59e0b;
  return 0x2563eb;
};

const createGenericICLowPoly = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();
  const color = getGenericColor(type);

  const bodyGeo = new THREE.BoxGeometry(width, 12, depth, 1, 1, 1);
  const body = new THREE.Mesh(bodyGeo, createSimpleMaterial(color));
  body.position.y = 6;
  body.castShadow = true;
  group.add(body);

  return group;
};

const createGenericICMediumPoly = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();
  const color = getGenericColor(type);

  const bodyGeo = new THREE.BoxGeometry(width, 12, depth, 2, 1, 2);
  const body = new THREE.Mesh(bodyGeo, createSimpleMaterial(color));
  body.position.y = 6;
  body.castShadow = true;
  group.add(body);

  const pinBarGeo = new THREE.BoxGeometry(width * 0.8, 6, 1);
  const pinMat = createSimpleMaterial(0xd4af37);
  const pins1 = new THREE.Mesh(pinBarGeo, pinMat);
  pins1.position.set(0, -3, depth / 2 + 0.5);
  group.add(pins1);

  const pins2 = new THREE.Mesh(pinBarGeo.clone(), pinMat.clone());
  pins2.position.set(0, -3, -depth / 2 - 0.5);
  group.add(pins2);

  return group;
};

// ============================================================================
// LOOKUP-TABLE BASED LOD FACTORY (replaces CCN-97 if/else chain)
// ============================================================================

type GeometryFactory = (width: number, depth: number) => THREE.Group;
type TypedGeometryFactory = (width: number, depth: number, type: string) => THREE.Group;

interface ComponentLODEntry {
  matcher: NameMatcher;
  high: GeometryFactory;
  medium: GeometryFactory;
  low: GeometryFactory;
  scaleDHT?: boolean; // DHT uses half-size dimensions
}

const COMPONENT_LOD_TABLE: ComponentLODEntry[] = [
  {
    matcher: ARDUINO_MATCHER,
    high: createArduinoGeometry,
    medium: createArduinoMediumPoly,
    low: createArduinoLowPoly,
  },
  {
    matcher: LCD_MATCHER,
    high: createLCDGeometry,
    medium: createLCDMediumPoly,
    low: createLCDLowPoly,
  },
  {
    matcher: DHT_MATCHER,
    high: (w, d) => createDHT11Geometry(w * 0.5, d * 0.5),
    medium: (w, d) => createDHT11MediumPoly(w * 0.5, d * 0.5),
    low: (w, d) => createDHT11LowPoly(w * 0.5, d * 0.5),
  },
  {
    matcher: BREADBOARD_MATCHER,
    high: createBreadboardGeometry,
    medium: createBreadboardMediumPoly,
    low: createBreadboardLowPoly,
  },
];

const getGenericFactory = (lodLevel: 'high' | 'medium' | 'low'): TypedGeometryFactory => {
  switch (lodLevel) {
    case 'high': return createGenericICGeometry;
    case 'medium': return createGenericICMediumPoly;
    case 'low': return createGenericICLowPoly;
  }
};

const resolveProceduralGeometry = (
  lowerName: string,
  lowerType: string,
  width: number,
  depth: number,
  lodLevel: 'high' | 'medium' | 'low'
): THREE.Group => {
  for (const entry of COMPONENT_LOD_TABLE) {
    if (entry.matcher.test(lowerName)) {
      return entry[lodLevel](width, depth);
    }
  }
  return getGenericFactory(lodLevel)(width, depth, lowerType);
};

// ============================================================================
// threeCode WORKER EXECUTION
// ============================================================================

const createWorkerPlaceholder = (width: number, depth: number): THREE.Mesh => {
  const geo = new THREE.BoxGeometry(width, Math.max(5, width / 2), depth);
  const mat = new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = Math.max(5, width / 2) / 2;
  return mesh;
};

const loadWorkerResult = (
  group: THREE.Group,
  placeholder: THREE.Mesh,
  name: string,
  threeCode: string,
  width: number,
  depth: number
): void => {
  executeInWorker(threeCode).then((json) => {
    const loader = new THREE.ObjectLoader();
    const loadedObject = loader.parse(json);

    if (loadedObject) {
      group.remove(placeholder);
      if (placeholder.geometry) placeholder.geometry.dispose();
      if (placeholder.material instanceof THREE.Material) placeholder.material.dispose();

      const box = new THREE.Box3().setFromObject(loadedObject);
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const targetSize = Math.max(width, depth);
        const currentSize = Math.max(size.x, size.z);

        if (currentSize > 0) {
          const scale = targetSize / currentSize;
          loadedObject.scale.setScalar(scale);
          loadedObject.position.sub(center.multiplyScalar(scale));
          loadedObject.position.y += (size.y * scale) / 2;
        }
      }
      group.add(loadedObject);
    }
  }).catch((e) => {
    console.warn(`Worker failed for ${name}:`, e);
  });
};

// ============================================================================
// PUBLIC API
// ============================================================================

export const createComponentAtLOD = (
  component: ElectronicComponent,
  width: number,
  depth: number,
  lodLevel: 'high' | 'medium' | 'low'
): THREE.Group => {
  const { type, name, threeCode } = component;
  const lowerName = (name || 'unknown').toLowerCase();
  const lowerType = (type || 'other').toLowerCase();

  // Try worker-based 3D code for high/medium LOD
  if (threeCode && (lodLevel === 'high' || lodLevel === 'medium')) {
    try {
      const validationError = validateThreeCode(threeCode);
      if (!validationError) {
        const group = new THREE.Group();
        const placeholder = createWorkerPlaceholder(width, depth);
        group.add(placeholder);
        loadWorkerResult(group, placeholder, name || 'unknown', threeCode, width, depth);
        return group;
      }
    } catch (e) {
      console.warn(`Failed to instantiate generated model for ${name}:`, e);
    }
  }

  return resolveProceduralGeometry(lowerName, lowerType, width, depth, lodLevel);
};

export const createLODComponent = (
  component: ElectronicComponent,
  width: number,
  depth: number
): THREE.LOD => {
  const lod = new THREE.LOD();
  lod.addLevel(createComponentAtLOD(component, width, depth, 'high'), LOD_HIGH_DISTANCE);
  lod.addLevel(createComponentAtLOD(component, width, depth, 'medium'), LOD_MEDIUM_DISTANCE);
  lod.addLevel(createComponentAtLOD(component, width, depth, 'low'), LOD_LOW_DISTANCE);
  return lod;
};
