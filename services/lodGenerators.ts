/**
 * LOD (Level of Detail) Geometry Generators
 *
 * Extracted from Diagram3DView.tsx to reduce cyclomatic complexity.
 * Contains pure functions that create Three.js geometry at various
 * detail levels for each supported electronic component type.
 */

import * as THREE from 'three';

export type LODLevel = 'high' | 'medium' | 'low';

// ============================================================================
// MATERIAL CACHING
// ============================================================================

const materialCache = new Map<string, THREE.Material>();

const getCachedMaterial = <T extends THREE.Material>(key: string, createFn: () => T): T => {
  if (!materialCache.has(key)) {
    materialCache.set(key, createFn());
  }
  return materialCache.get(key) as T;
};

// ============================================================================
// PROCEDURAL NORMAL MAPS
// ============================================================================

let pcbNormalMap: THREE.CanvasTexture | null = null;
let plasticNormalMap: THREE.CanvasTexture | null = null;
let metalNormalMap: THREE.CanvasTexture | null = null;

const createPCBNormalMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base normal (facing up)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  // Copper traces (slight bumps)
  ctx.strokeStyle = 'rgb(140, 128, 255)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = 10 + i * 12;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Via holes (indents)
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

  // Base normal
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 128, 128);

  // Add subtle noise/grain
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

  // Base
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 128, 128);

  // Brushed lines
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

const getPCBNormalMap = (): THREE.CanvasTexture => {
  if (!pcbNormalMap) pcbNormalMap = createPCBNormalMap();
  return pcbNormalMap;
};

const getPlasticNormalMap = (): THREE.CanvasTexture => {
  if (!plasticNormalMap) plasticNormalMap = createPlasticNormalMap();
  return plasticNormalMap;
};

const getMetalNormalMap = (): THREE.CanvasTexture => {
  if (!metalNormalMap) metalNormalMap = createBrushedMetalNormalMap();
  return metalNormalMap;
};

// ============================================================================
// PBR MATERIALS
// ============================================================================

const createICMaterial = (color: number): THREE.MeshPhysicalMaterial => {
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

const createPinMaterial = (withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`pin-${withNormalMap}`, () => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37, // Gold
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

const createPCBMaterial = (color: number = 0x0d6b3d, withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
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

const createScreenMaterial = (): THREE.MeshPhysicalMaterial => {
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

// ============================================================================
// SIMPLE MATERIAL (for medium/low LOD)
// ============================================================================

const createSimpleMaterial = (color: number, metalness: number = 0): THREE.MeshLambertMaterial => {
  return getCachedMaterial(`simple-${color}-${metalness}`, () => new THREE.MeshLambertMaterial({
    color,
    emissive: 0x000000,
  }));
};

// ============================================================================
// HIGH-DETAIL GEOMETRY CREATORS
// ============================================================================

// Create Arduino board geometry (realistic shape)
const createArduinoGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 2;

  // Main PCB board
  const boardGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const board = new THREE.Mesh(boardGeo, createPCBMaterial(0x0066cc)); // Arduino blue
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  // ATmega chip (DIP-28 package)
  const chipWidth = width * 0.4;
  const chipDepth = depth * 0.2;
  const chipHeight = 4;
  const chipGeo = new THREE.BoxGeometry(chipWidth, chipHeight, chipDepth);
  const chip = new THREE.Mesh(chipGeo, createICMaterial(0x1a1a1a));
  chip.position.set(0, boardHeight / 2 + chipHeight / 2, -depth * 0.1);
  chip.castShadow = true;
  group.add(chip);

  // Chip notch (semicircle indent)
  const notchGeo = new THREE.CylinderGeometry(chipDepth * 0.1, chipDepth * 0.1, chipHeight + 0.1, 16, 1, false, 0, Math.PI);
  const notch = new THREE.Mesh(notchGeo, createICMaterial(0x0a0a0a));
  notch.rotation.z = Math.PI / 2;
  notch.rotation.y = Math.PI / 2;
  notch.position.set(-chipWidth / 2, boardHeight / 2 + chipHeight / 2, -depth * 0.1);
  group.add(notch);

  // USB connector
  const usbWidth = width * 0.15;
  const usbHeight = 5;
  const usbDepth = 12;
  const usbGeo = new THREE.BoxGeometry(usbWidth, usbHeight, usbDepth);
  const usb = new THREE.Mesh(usbGeo, createPlasticMaterial(0xc0c0c0));
  usb.position.set(-width * 0.35, boardHeight / 2 + usbHeight / 2, depth / 2 - usbDepth / 2 + 5);
  usb.castShadow = true;
  group.add(usb);

  // USB inner (metal contact)
  const usbInnerGeo = new THREE.BoxGeometry(usbWidth * 0.7, usbHeight * 0.5, usbDepth * 0.3);
  const usbInner = new THREE.Mesh(usbInnerGeo, createPinMaterial());
  usbInner.position.set(-width * 0.35, boardHeight / 2 + usbHeight / 2, depth / 2 + 2);
  group.add(usbInner);

  // Power jack
  const jackRadius = 4;
  const jackDepth = 10;
  const jackGeo = new THREE.CylinderGeometry(jackRadius, jackRadius, jackDepth, 16);
  const jack = new THREE.Mesh(jackGeo, createPlasticMaterial(0x2a2a2a));
  jack.rotation.x = Math.PI / 2;
  jack.position.set(width * 0.35, boardHeight / 2 + jackRadius, depth / 2 - jackDepth / 2 + 5);
  jack.castShadow = true;
  group.add(jack);

  // Pin headers (digital side)
  const pinHeaderGeo = new THREE.BoxGeometry(width * 0.8, 8, 2.5);
  const pinHeaderMat = createPlasticMaterial(0x1a1a1a);
  const digitalHeader = new THREE.Mesh(pinHeaderGeo, pinHeaderMat);
  digitalHeader.position.set(0, boardHeight / 2 + 4, -depth / 2 + 5);
  digitalHeader.castShadow = true;
  group.add(digitalHeader);

  // Pin headers (analog side)
  const analogHeader = new THREE.Mesh(pinHeaderGeo.clone(), pinHeaderMat.clone());
  analogHeader.position.set(0, boardHeight / 2 + 4, depth / 2 - 8);
  analogHeader.castShadow = true;
  group.add(analogHeader);

  // Individual pins in headers
  const pinGeo = new THREE.CylinderGeometry(0.4, 0.4, 10, 8);
  const pinMat = createPinMaterial();
  for (let i = 0; i < 14; i++) {
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(-width * 0.35 + i * (width * 0.7 / 13), boardHeight / 2 + 4, -depth / 2 + 5);
    group.add(pin);

    const pin2 = new THREE.Mesh(pinGeo.clone(), pinMat.clone());
    pin2.position.set(-width * 0.35 + i * (width * 0.7 / 13), boardHeight / 2 + 4, depth / 2 - 8);
    group.add(pin2);
  }

  // Reset button
  const btnGeo = new THREE.CylinderGeometry(2, 2, 3, 16);
  const btn = new THREE.Mesh(btnGeo, createPlasticMaterial(0xcc0000));
  btn.position.set(width * 0.25, boardHeight / 2 + 1.5, -depth * 0.25);
  group.add(btn);

  // LEDs
  const ledGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const ledGreen = new THREE.Mesh(ledGeo, new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.0,
    transmission: 0.6,
  }));
  ledGreen.position.set(width * 0.3, boardHeight / 2 + 1.5, 0);
  group.add(ledGreen);

  const ledOrange = new THREE.Mesh(ledGeo.clone(), new THREE.MeshPhysicalMaterial({
    color: 0xff8800,
    emissive: 0xff8800,
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.0,
    transmission: 0.6,
  }));
  ledOrange.position.set(width * 0.35, boardHeight / 2 + 1.5, 0);
  group.add(ledOrange);

  // Crystal oscillator
  const crystalGeo = new THREE.CylinderGeometry(2, 2, 1, 6);
  const crystal = new THREE.Mesh(crystalGeo, createPlasticMaterial(0xc0c0c0));
  crystal.rotation.x = Math.PI / 2;
  crystal.position.set(-width * 0.15, boardHeight / 2 + 1, -depth * 0.2);
  group.add(crystal);

  return group;
};

// Create LCD display geometry
const createLCDGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 2;
  const frameHeight = 8;

  // PCB base
  const boardGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const board = new THREE.Mesh(boardGeo, createPCBMaterial(0x1a6b3d));
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  // LCD frame (bezel)
  const frameWidth = width * 0.9;
  const frameDepth = depth * 0.6;
  const frameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
  const frame = new THREE.Mesh(frameGeo, createPlasticMaterial(0x2a2a2a));
  frame.position.set(0, boardHeight / 2 + frameHeight / 2, -depth * 0.1);
  frame.castShadow = true;
  group.add(frame);

  // LCD screen (visible area)
  const screenWidth = frameWidth * 0.85;
  const screenDepth = frameDepth * 0.7;
  const screenGeo = new THREE.BoxGeometry(screenWidth, 0.5, screenDepth);
  const screen = new THREE.Mesh(screenGeo, createScreenMaterial());
  screen.position.set(0, boardHeight / 2 + frameHeight - 0.3, -depth * 0.1);
  group.add(screen);

  // LCD backlight glow
  const glowGeo = new THREE.BoxGeometry(screenWidth * 0.95, 0.2, screenDepth * 0.95);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, boardHeight / 2 + frameHeight - 0.5, -depth * 0.1);
  group.add(glow);

  // Character grid simulation (16x2)
  const charWidth = screenWidth / 18;
  const charHeight = screenDepth / 4;
  const charGeo = new THREE.PlaneGeometry(charWidth * 0.8, charHeight * 0.8);
  const charMat = new THREE.MeshBasicMaterial({
    color: 0x004422,
    transparent: true,
    opacity: 0.6,
  });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 16; col++) {
      const char = new THREE.Mesh(charGeo, charMat);
      char.rotation.x = -Math.PI / 2;
      char.position.set(
        -screenWidth / 2 + charWidth + col * charWidth,
        boardHeight / 2 + frameHeight + 0.1,
        -depth * 0.1 - screenDepth / 4 + row * charHeight * 1.5
      );
      group.add(char);
    }
  }

  // I2C backpack module
  const backpackGeo = new THREE.BoxGeometry(width * 0.25, 4, depth * 0.3);
  const backpack = new THREE.Mesh(backpackGeo, createPCBMaterial(0x0066cc));
  backpack.position.set(-width * 0.35, boardHeight / 2 + 2, depth * 0.3);
  backpack.castShadow = true;
  group.add(backpack);

  // Potentiometer on backpack
  const potGeo = new THREE.CylinderGeometry(2, 2, 1.5, 16);
  const pot = new THREE.Mesh(potGeo, createPlasticMaterial(0x0088ff));
  pot.position.set(-width * 0.35, boardHeight / 2 + 5, depth * 0.3);
  group.add(pot);

  return group;
};

// Create DHT11 sensor geometry
const createDHT11Geometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const bodyHeight = 15;

  // Main sensor housing (blue plastic)
  const bodyGeo = new THREE.BoxGeometry(width, bodyHeight, depth);
  const body = new THREE.Mesh(bodyGeo, createPlasticMaterial(0x1e88e5));
  body.position.y = bodyHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Ventilation grid
  const gridWidth = width * 0.6;
  const gridDepth = depth * 0.6;
  const barCount = 5;
  const barGeo = new THREE.BoxGeometry(gridWidth, 1, 1);
  const barMat = createPlasticMaterial(0x0d47a1);
  for (let i = 0; i < barCount; i++) {
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, bodyHeight * 0.7, -gridDepth / 2 + i * (gridDepth / (barCount - 1)));
    group.add(bar);
  }

  // Humidity sensor window
  const windowGeo = new THREE.BoxGeometry(gridWidth * 0.8, 0.5, gridDepth * 0.8);
  const windowMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.8,
    thickness: 0.5,
  });
  const sensorWindow = new THREE.Mesh(windowGeo, windowMat);
  sensorWindow.position.set(0, bodyHeight - 0.3, 0);
  group.add(sensorWindow);

  // Pins (3 pins: VCC, DATA, GND)
  const pinGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const pinMat = createPinMaterial();
  const pinSpacing = width * 0.25;
  for (let i = 0; i < 3; i++) {
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(-pinSpacing + i * pinSpacing, -4, 0);
    group.add(pin);
  }

  // Label on front
  const labelGeo = new THREE.PlaneGeometry(width * 0.5, bodyHeight * 0.15);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DHT11', 64, 24);
  }
  const labelTex = new THREE.CanvasTexture(canvas);
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, bodyHeight * 0.3, depth / 2 + 0.1);
  group.add(label);

  return group;
};

// Create breadboard geometry
const createBreadboardGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 8;

  // Main body (white/cream ABS plastic)
  const bodyGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const body = new THREE.Mesh(bodyGeo, createPlasticMaterial(0xf5f5dc));
  body.position.y = boardHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Power rails (red and blue strips)
  const railWidth = width;
  const railDepth = depth * 0.06;
  const railGeo = new THREE.BoxGeometry(railWidth * 0.95, 0.5, railDepth);

  const redRailMat = createPlasticMaterial(0xcc0000);
  const blueRailMat = createPlasticMaterial(0x0000cc);

  // Top power rails
  const topRedRail = new THREE.Mesh(railGeo, redRailMat);
  topRedRail.position.set(0, boardHeight + 0.3, -depth / 2 + railDepth);
  group.add(topRedRail);

  const topBlueRail = new THREE.Mesh(railGeo.clone(), blueRailMat);
  topBlueRail.position.set(0, boardHeight + 0.3, -depth / 2 + railDepth * 2.5);
  group.add(topBlueRail);

  // Bottom power rails
  const bottomRedRail = new THREE.Mesh(railGeo.clone(), redRailMat.clone());
  bottomRedRail.position.set(0, boardHeight + 0.3, depth / 2 - railDepth);
  group.add(bottomRedRail);

  const bottomBlueRail = new THREE.Mesh(railGeo.clone(), blueRailMat.clone());
  bottomBlueRail.position.set(0, boardHeight + 0.3, depth / 2 - railDepth * 2.5);
  group.add(bottomBlueRail);

  // Center divider channel
  const dividerGeo = new THREE.BoxGeometry(width * 0.95, 1, depth * 0.02);
  const dividerMat = createPlasticMaterial(0xcccccc);
  const divider = new THREE.Mesh(dividerGeo, dividerMat);
  divider.position.set(0, boardHeight + 0.5, 0);
  group.add(divider);

  // Hole pattern (optimized with InstancedMesh)
  const holeGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

  // Create representative holes (not all 830!)
  const holesPerRow = 30;
  const holeSpacing = width * 0.9 / holesPerRow;
  const rowSpacing = depth * 0.08;

  // Calculate total count: (10 cols * 5 rows) * 2 halves = 100 holes
  const cols = Math.ceil(holesPerRow / 3);
  const rows = 5;
  const totalHoles = cols * rows * 2;

  const holesMesh = new THREE.InstancedMesh(holeGeo, holeMat, totalHoles);
  const dummy = new THREE.Object3D();
  let index = 0;

  // Top half holes
  for (let col = 0; col < holesPerRow; col += 3) {
    for (let row = 0; row < 5; row++) {
      dummy.position.set(
        -width * 0.45 + col * holeSpacing,
        boardHeight + 0.3,
        -depth * 0.15 - row * rowSpacing
      );
      dummy.updateMatrix();
      holesMesh.setMatrixAt(index++, dummy.matrix);
    }
  }

  // Bottom half holes
  for (let col = 0; col < holesPerRow; col += 3) {
    for (let row = 0; row < 5; row++) {
      dummy.position.set(
        -width * 0.45 + col * holeSpacing,
        boardHeight + 0.3,
        depth * 0.15 + row * rowSpacing
      );
      dummy.updateMatrix();
      holesMesh.setMatrixAt(index++, dummy.matrix);
    }
  }

  holesMesh.instanceMatrix.needsUpdate = true;
  group.add(holesMesh);

  return group;
};

// Generic IC package
const createGenericICGeometry = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();
  const height = 12;

  // Determine color based on type
  let color = 0x2563eb;
  if (type.includes('sensor')) color = 0x3b82f6;
  if (type.includes('motor') || type.includes('actuator')) color = 0x7c3aed;
  if (type.includes('power')) color = 0xf59e0b;
  if (type.includes('communication')) color = 0x06b6d4;

  // Main body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, createICMaterial(color));
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Beveled edge (chamfer simulation)
  const edgeGeo = new THREE.BoxGeometry(width * 1.02, 1, depth * 1.02);
  const edge = new THREE.Mesh(edgeGeo, createICMaterial(color * 0.8));
  edge.position.y = 0.5;
  group.add(edge);

  // Pin row
  const pinGeo = new THREE.BoxGeometry(1, 6, 0.5);
  const pinMat = createPinMaterial();
  const pinCount = Math.min(Math.floor(width / 5), 10);
  for (let i = 0; i < pinCount; i++) {
    // Front pins
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.position.set(-width / 2 + 3 + i * (width - 6) / (pinCount - 1), -3, depth / 2 + 0.3);
    group.add(pin1);

    // Back pins
    const pin2 = new THREE.Mesh(pinGeo.clone(), pinMat.clone());
    pin2.position.set(-width / 2 + 3 + i * (width - 6) / (pinCount - 1), -3, -depth / 2 - 0.3);
    group.add(pin2);
  }

  return group;
};

// ============================================================================
// MEDIUM-DETAIL GEOMETRY CREATORS
// ============================================================================

// Medium-poly Arduino (intermediate detail)
const createArduinoMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // PCB board
  const pcbGeo = new THREE.BoxGeometry(width, 2, depth, 2, 1, 2);
  const pcb = new THREE.Mesh(pcbGeo, createSimpleMaterial(0x0d6b3d));
  pcb.position.y = 1;
  pcb.castShadow = true;
  group.add(pcb);

  // USB port (simplified)
  const usbGeo = new THREE.BoxGeometry(12, 8, 14, 1, 1, 1);
  const usb = new THREE.Mesh(usbGeo, createSimpleMaterial(0x808080));
  usb.position.set(-width / 2 + 10, 6, 0);
  usb.castShadow = true;
  group.add(usb);

  // ATmega chip (simplified)
  const chipGeo = new THREE.BoxGeometry(15, 4, 15, 1, 1, 1);
  const chip = new THREE.Mesh(chipGeo, createSimpleMaterial(0x1a1a1a));
  chip.position.set(width * 0.15, 4, 0);
  chip.castShadow = true;
  group.add(chip);

  // Pin headers (simplified as single bars)
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

// Medium-poly LCD
const createLCDMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Bezel
  const bezelGeo = new THREE.BoxGeometry(width, 10, depth, 2, 1, 2);
  const bezel = new THREE.Mesh(bezelGeo, createSimpleMaterial(0x1e40af));
  bezel.position.y = 5;
  bezel.castShadow = true;
  group.add(bezel);

  // Screen area
  const screenGeo = new THREE.BoxGeometry(width * 0.85, 1, depth * 0.6);
  const screen = new THREE.Mesh(screenGeo, createSimpleMaterial(0x2dd4bf));
  screen.position.set(0, 10.5, 0);
  group.add(screen);

  // I2C backpack (simplified)
  const backpackGeo = new THREE.BoxGeometry(width * 0.4, 3, depth * 0.3);
  const backpack = new THREE.Mesh(backpackGeo, createSimpleMaterial(0x0d6b3d));
  backpack.position.set(0, 12, -depth / 2 + depth * 0.2);
  group.add(backpack);

  return group;
};

// Medium-poly DHT11
const createDHT11MediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Housing
  const housingGeo = new THREE.BoxGeometry(width, 8, depth, 2, 1, 2);
  const housing = new THREE.Mesh(housingGeo, createSimpleMaterial(0x3b82f6));
  housing.position.y = 4;
  housing.castShadow = true;
  group.add(housing);

  // Vent grille (simplified as single plane)
  const ventGeo = new THREE.PlaneGeometry(width * 0.6, 4);
  const vent = new THREE.Mesh(ventGeo, createSimpleMaterial(0x1e3a5f));
  vent.rotation.x = -Math.PI / 2;
  vent.position.set(0, 8.1, 0);
  group.add(vent);

  return group;
};

// Medium-poly Breadboard
const createBreadboardMediumPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Base
  const baseGeo = new THREE.BoxGeometry(width, 8, depth, 2, 1, 2);
  const base = new THREE.Mesh(baseGeo, createSimpleMaterial(0xf5f5f0));
  base.position.y = 4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Center divider
  const dividerGeo = new THREE.BoxGeometry(width * 0.95, 1, 6);
  const divider = new THREE.Mesh(dividerGeo, createSimpleMaterial(0xe5e5e0));
  divider.position.set(0, 8.5, 0);
  group.add(divider);

  // Power rails
  const railGeo = new THREE.BoxGeometry(width * 0.95, 0.5, 12);
  const redRail = new THREE.Mesh(railGeo, createSimpleMaterial(0xdc2626));
  redRail.position.set(0, 8.3, depth / 2 - 10);
  group.add(redRail);

  const blueRail = new THREE.Mesh(railGeo.clone(), createSimpleMaterial(0x2563eb));
  blueRail.position.set(0, 8.3, -depth / 2 + 10);
  group.add(blueRail);

  return group;
};

// Medium-poly Generic IC
const createGenericICMediumPoly = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();

  let color = 0x2563eb;
  if (type.includes('sensor')) color = 0x3b82f6;
  if (type.includes('motor') || type.includes('actuator')) color = 0x7c3aed;
  if (type.includes('power')) color = 0xf59e0b;

  // Body
  const bodyGeo = new THREE.BoxGeometry(width, 12, depth, 2, 1, 2);
  const body = new THREE.Mesh(bodyGeo, createSimpleMaterial(color));
  body.position.y = 6;
  body.castShadow = true;
  group.add(body);

  // Simplified pins (just two bars)
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
// LOW-DETAIL GEOMETRY CREATORS
// ============================================================================

// Low-poly Arduino (for distant views)
const createArduinoLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Single box for PCB
  const pcbGeo = new THREE.BoxGeometry(width, 2, depth, 1, 1, 1);
  const pcb = new THREE.Mesh(pcbGeo, createSimpleMaterial(0x0d6b3d));
  pcb.position.y = 1;
  pcb.castShadow = true;
  group.add(pcb);

  // Single box for main chip area
  const chipGeo = new THREE.BoxGeometry(width * 0.4, 8, depth * 0.3, 1, 1, 1);
  const chip = new THREE.Mesh(chipGeo, createSimpleMaterial(0x1a1a1a));
  chip.position.set(0, 6, 0);
  chip.castShadow = true;
  group.add(chip);

  return group;
};

// Low-poly LCD (for distant views)
const createLCDLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Single box for bezel
  const bezelGeo = new THREE.BoxGeometry(width, 10, depth, 1, 1, 1);
  const bezel = new THREE.Mesh(bezelGeo, createSimpleMaterial(0x1e40af));
  bezel.position.y = 5;
  bezel.castShadow = true;
  group.add(bezel);

  // Screen (single plane)
  const screenGeo = new THREE.PlaneGeometry(width * 0.8, depth * 0.5);
  const screen = new THREE.Mesh(screenGeo, createSimpleMaterial(0x2dd4bf));
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, 10.1, 0);
  group.add(screen);

  return group;
};

// Low-poly DHT11
const createDHT11LowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Single box for housing
  const housingGeo = new THREE.BoxGeometry(width, 8, depth, 1, 1, 1);
  const housing = new THREE.Mesh(housingGeo, createSimpleMaterial(0x3b82f6));
  housing.position.y = 4;
  housing.castShadow = true;
  group.add(housing);

  return group;
};

// Low-poly Breadboard
const createBreadboardLowPoly = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();

  // Single box for base
  const baseGeo = new THREE.BoxGeometry(width, 8, depth, 1, 1, 1);
  const base = new THREE.Mesh(baseGeo, createSimpleMaterial(0xf5f5f0));
  base.position.y = 4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Power rails (simplified as colored stripes)
  const railGeo = new THREE.BoxGeometry(width, 0.5, 8);
  const redRail = new THREE.Mesh(railGeo, createSimpleMaterial(0xdc2626));
  redRail.position.set(0, 8.3, depth / 2 - 8);
  group.add(redRail);

  const blueRail = new THREE.Mesh(railGeo.clone(), createSimpleMaterial(0x2563eb));
  blueRail.position.set(0, 8.3, -depth / 2 + 8);
  group.add(blueRail);

  return group;
};

// Low-poly Generic IC
const createGenericICLowPoly = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();

  let color = 0x2563eb;
  if (type.includes('sensor')) color = 0x3b82f6;
  if (type.includes('motor') || type.includes('actuator')) color = 0x7c3aed;
  if (type.includes('power')) color = 0xf59e0b;

  // Single box for body
  const bodyGeo = new THREE.BoxGeometry(width, 12, depth, 1, 1, 1);
  const body = new THREE.Mesh(bodyGeo, createSimpleMaterial(color));
  body.position.y = 6;
  body.castShadow = true;
  group.add(body);

  return group;
};

// ============================================================================
// PER-COMPONENT LOD DISPATCHERS
// ============================================================================

/**
 * Create Arduino geometry at the specified LOD level.
 */
export const createArduinoLOD = (level: LODLevel, width: number, depth: number): THREE.Group => {
  switch (level) {
    case 'high': return createArduinoGeometry(width, depth);
    case 'medium': return createArduinoMediumPoly(width, depth);
    case 'low': return createArduinoLowPoly(width, depth);
  }
};

/**
 * Create LCD display geometry at the specified LOD level.
 */
export const createLCDLOD = (level: LODLevel, width: number, depth: number): THREE.Group => {
  switch (level) {
    case 'high': return createLCDGeometry(width, depth);
    case 'medium': return createLCDMediumPoly(width, depth);
    case 'low': return createLCDLowPoly(width, depth);
  }
};

/**
 * Create DHT11 sensor geometry at the specified LOD level.
 * Note: applies 0.5x dimension scaling as per the original implementation.
 */
export const createDHT11LOD = (level: LODLevel, width: number, depth: number): THREE.Group => {
  const w = width * 0.5;
  const d = depth * 0.5;
  switch (level) {
    case 'high': return createDHT11Geometry(w, d);
    case 'medium': return createDHT11MediumPoly(w, d);
    case 'low': return createDHT11LowPoly(w, d);
  }
};

/**
 * Create breadboard geometry at the specified LOD level.
 */
export const createBreadboardLOD = (level: LODLevel, width: number, depth: number): THREE.Group => {
  switch (level) {
    case 'high': return createBreadboardGeometry(width, depth);
    case 'medium': return createBreadboardMediumPoly(width, depth);
    case 'low': return createBreadboardLowPoly(width, depth);
  }
};

/**
 * Create generic IC geometry at the specified LOD level.
 * The componentType parameter is used to determine color (sensor, motor, power, etc.).
 */
export const createGenericICLOD = (level: LODLevel, width: number, depth: number, componentType: string): THREE.Group => {
  switch (level) {
    case 'high': return createGenericICGeometry(width, depth, componentType);
    case 'medium': return createGenericICMediumPoly(width, depth, componentType);
    case 'low': return createGenericICLowPoly(width, depth, componentType);
  }
};

/**
 * Create default (generic IC) geometry at the specified LOD level.
 * Alias for createGenericICLOD.
 */
export const createDefaultLOD = (level: LODLevel, width: number, depth: number, componentType: string): THREE.Group => {
  return createGenericICLOD(level, width, depth, componentType);
};

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

/**
 * Main LOD dispatcher. Creates component geometry at the specified detail level
 * based on the component name and type.
 *
 * @param name - Component name (e.g. "Arduino Uno", "LCD 1602", "DHT11")
 * @param componentType - Component type from ElectronicComponent.type (e.g. "microcontroller", "sensor")
 * @param lodLevel - Detail level: 'high', 'medium', or 'low'
 * @param width - Component width in 3D units
 * @param depth - Component depth in 3D units
 * @returns THREE.Group containing the component geometry
 */
export const createComponentAtLOD = (
  name: string,
  componentType: string,
  lodLevel: LODLevel,
  width: number,
  depth: number
): THREE.Group => {
  const lowerName = (name || 'unknown').toLowerCase();
  const lowerType = (componentType || 'other').toLowerCase();

  if (lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega')) {
    return createArduinoLOD(lodLevel, width, depth);
  }
  if (lowerName.includes('lcd') || lowerName.includes('display') || lowerName.includes('1602')) {
    return createLCDLOD(lodLevel, width, depth);
  }
  if (lowerName.includes('dht') || lowerName.includes('temperature') || lowerName.includes('humidity')) {
    return createDHT11LOD(lodLevel, width, depth);
  }
  if (lowerName.includes('breadboard') || lowerName.includes('830')) {
    return createBreadboardLOD(lodLevel, width, depth);
  }
  return createGenericICLOD(lodLevel, width, depth, lowerType);
};
