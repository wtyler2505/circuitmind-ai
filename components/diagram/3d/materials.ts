import * as THREE from 'three';

// ============================================================================
// MATERIAL CACHING
// ============================================================================

const materialCache = new Map<string, THREE.Material>();

export const getCachedMaterial = <T extends THREE.Material>(key: string, createFn: () => T): T => {
  if (!materialCache.has(key)) {
    materialCache.set(key, createFn());
  }
  return materialCache.get(key) as T;
};

// ============================================================================
// PROCEDURAL NORMAL MAPS
// ============================================================================

const createPCBNormalMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgb(140, 128, 255)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = 10 + i * 12;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgb(118, 128, 255)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
};

const createPlasticNormalMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const brightness = 120 + Math.random() * 16;
    ctx.fillStyle = `rgb(${brightness}, 128, 255)`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
};

const createBrushedMetalNormalMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = 'rgb(135, 128, 255)';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < 128; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() - 0.5));
    ctx.lineTo(128, y + (Math.random() - 0.5));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
};

// Normal map singletons
let pcbNormalMap: THREE.CanvasTexture | null = null;
let plasticNormalMap: THREE.CanvasTexture | null = null;
let metalNormalMap: THREE.CanvasTexture | null = null;

export const getPCBNormalMap = (): THREE.CanvasTexture => {
  if (!pcbNormalMap) pcbNormalMap = createPCBNormalMap();
  return pcbNormalMap;
};

export const getPlasticNormalMap = (): THREE.CanvasTexture => {
  if (!plasticNormalMap) plasticNormalMap = createPlasticNormalMap();
  return plasticNormalMap;
};

export const getMetalNormalMap = (): THREE.CanvasTexture => {
  if (!metalNormalMap) metalNormalMap = createBrushedMetalNormalMap();
  return metalNormalMap;
};

// ============================================================================
// PBR MATERIALS
// ============================================================================

export const createICMaterial = (color: number): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`ic-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    reflectivity: 0.5,
    envMapIntensity: 0.8,
  }));
};

export const createPinMaterial = (withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`pin-${withNormalMap}`, () => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      roughness: 0.15,
      metalness: 1.0,
      reflectivity: 1.0,
      envMapIntensity: 1.2,
    });
    if (withNormalMap) {
      mat.normalMap = getMetalNormalMap();
      mat.normalScale = new THREE.Vector2(0.1, 0.1);
    }
    return mat;
  });
};

export const createPCBMaterial = (color: number = 0x0d6b3d, withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`pcb-${color}-${withNormalMap}`, () => {
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.6,
      metalness: 0.0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.8,
      envMapIntensity: 0.4,
    });
    if (withNormalMap) {
      mat.normalMap = getPCBNormalMap();
      mat.normalScale = new THREE.Vector2(0.3, 0.3);
    }
    return mat;
  });
};

export const createPlasticMaterial = (color: number, withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`plastic-${color}-${withNormalMap}`, () => {
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.5,
      metalness: 0.0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.9,
      envMapIntensity: 0.5,
    });
    if (withNormalMap) {
      mat.normalMap = getPlasticNormalMap();
      mat.normalScale = new THREE.Vector2(0.15, 0.15);
    }
    return mat;
  });
};

export const createWireMaterial = (color: number): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`wire-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.4,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.6,
  }));
};

export const createScreenMaterial = (): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial('screen', () => new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    envMapIntensity: 1.0,
    transmission: 0.1,
    thickness: 0.5,
  }));
};

export const createSimpleMaterial = (color: number, metalness: number = 0): THREE.MeshLambertMaterial => {
  return getCachedMaterial(`simple-${color}-${metalness}`, () => new THREE.MeshLambertMaterial({
    color,
    emissive: 0x000000,
  }));
};
