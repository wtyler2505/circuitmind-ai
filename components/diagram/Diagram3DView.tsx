import React, { useEffect, useRef, useCallback, useState, memo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { WiringDiagram, ElectronicComponent } from '../../types';
import { getComponentShape } from './componentShapes';
import { executeInWorker } from '../../services/threeCodeRunner';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useLayout } from '../../contexts/LayoutContext';
import IconButton from '../IconButton';

interface Diagram3DViewProps {
  diagram: WiringDiagram | null;
  positions: Map<string, { x: number; y: number }>;
  onComponentClick?: (component: ElectronicComponent) => void;
  onGenerate3D?: (component: ElectronicComponent) => Promise<void>;
}

// ============================================================================
// UTILS: CODE VALIDATION (Reused from ThreeViewer)
// ============================================================================

const BLOCKED_CODE_TOKENS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bwindow\b/, label: 'window' },
  { pattern: /\bdocument\b/, label: 'document' },
  { pattern: /\blocalStorage\b/, label: 'localStorage' },
  { pattern: /\bsessionStorage\b/, label: 'sessionStorage' },
  { pattern: /\bindexedDB\b/, label: 'indexedDB' },
  { pattern: /\bfetch\b/, label: 'fetch' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bWebSocket\b/, label: 'WebSocket' },
  { pattern: /\bWorker\b/, label: 'Worker' },
  { pattern: /\bnavigator\b/, label: 'navigator' },
  { pattern: /\blocation\b/, label: 'location' },
  { pattern: /\bimport\b/, label: 'import' },
  { pattern: /\brequire\b/, label: 'require' },
  { pattern: /\beval\b/, label: 'eval' },
  { pattern: /\bFunction\b/, label: 'Function' },
];

const validateThreeCode = (code: string): string | null => {
  const trimmed = code.trim();
  if (!trimmed) return 'No 3D code provided.';
  // Relaxed check: generated code usually ends with return group; but might have trailing whitespace
  if (!/return\s+group\s*;?/m.test(trimmed)) {
    return '3D code must end with "return group;".';
  }

  const blocked = BLOCKED_CODE_TOKENS.filter(({ pattern }) => pattern.test(trimmed)).map(
    ({ label }) => label
  );

  if (blocked.length > 0) {
    return `Blocked unsafe token(s): ${blocked.join(', ')}.`;
  }

  return null;
};

// ============================================================================
// PERFORMANCE OPTIMIZATION: MATERIAL CACHING
// ============================================================================

const materialCache = new Map<string, THREE.Material>();

const getCachedMaterial = <T extends THREE.Material>(key: string, createFn: () => T): T => {
  if (!materialCache.has(key)) {
    materialCache.set(key, createFn());
  }
  return materialCache.get(key) as T;
};

// ============================================================================
// HELPER: PIN COORDINATES
// ============================================================================

// Calculate local 3D offset for a specific pin on a component
const getPinCoordinates = (type: string, name: string, pin: string, width: number, depth: number): THREE.Vector3 => {
  const lowerName = (name || '').toLowerCase();
  const pinName = (pin || '').toUpperCase();
  
  // Default center top
  const pos = new THREE.Vector3(0, 5, 0);

  // Arduino Uno / Mega
  if (lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega')) {
    const boardHeight = 2;
    pos.y = boardHeight / 2 + 5; // Top of pin header

    // Digital pins (0-13, GND, AREF, SDA, SCL) - Top edge
    if (pinName.startsWith('D') || !isNaN(parseInt(pinName)) || ['GND', 'AREF', 'SDA', 'SCL', 'TX', 'RX'].includes(pinName)) {
      pos.z = -depth / 2 + 5;
      
      // Map pins to X coordinate (approximate distribution)
      // Range: -width * 0.35 to +width * 0.35
      const totalPins = 16; // 0-13 + GND + AREF
      const span = width * 0.7;
      const step = span / totalPins;
      const startX = -width * 0.35;
      
      let index = 0;
      if (pinName === 'RX' || pinName === '0') index = 0;
      else if (pinName === 'TX' || pinName === '1') index = 1;
      else if (!isNaN(parseInt(pinName))) index = parseInt(pinName);
      else if (pinName === 'GND') index = 14;
      else if (pinName === 'AREF') index = 15;
      else if (pinName === 'SDA') index = 16;
      else if (pinName === 'SCL') index = 17;
      
      pos.x = startX + index * step;
    } 
    // Analog pins (A0-A5) & Power (3.3V, 5V, GND, Vin) - Bottom edge
    else {
      pos.z = depth / 2 - 8;
      const totalPins = 12; // A0-A5 + Power pins
      const span = width * 0.7;
      const step = span / totalPins;
      const startX = -width * 0.35;
      
      let index = 0;
      if (pinName.startsWith('A')) index = parseInt(pinName.substring(1));
      else if (pinName === 'VIN') index = 6;
      else if (pinName === 'GND') index = 7; // There are two GNDs usually
      else if (pinName === '5V') index = 9;
      else if (pinName === '3V3') index = 10;
      else if (pinName === 'RESET') index = 11;
      
      pos.x = startX + index * step;
    }
  }
  // Breadboard 830
  else if (lowerName.includes('breadboard') || lowerName.includes('830')) {
    pos.y = 8.5; // Surface height
    
    // Parse Breadboard coordinate "J1", "A10", "power+", etc.
    const hash = pinName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    pos.x = (hash % 20 - 10) * (width / 25);
    pos.z = (hash % 5 - 2.5) * (depth / 10);
  }
  // Generic IC / Sensor
  else {
    pos.y = 2; // Pin height
    const pinCount = 4; // Estimate
    const hash = pinName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const side = hash % 2 === 0 ? 1 : -1;
    pos.z = (depth / 2) * side;
    pos.x = ((hash % pinCount) - pinCount / 2) * (width / pinCount);
  }

  return pos;
};

// ============================================================================
// PHASE 1: PBR MATERIALS & ENVIRONMENT
// ============================================================================

// Create PBR material for IC chips (epoxy package)
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

// Create PBR material for metal pins (gold-plated)
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

// Create PBR material for PCB (FR4 with solder mask)
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

// Create PBR material for plastic housings (sensors, connectors)
const createPlasticMaterial = (color: number, withNormalMap: boolean = true): THREE.MeshPhysicalMaterial => {
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

// Create PBR material for wires (insulated copper)
const createWireMaterial = (color: number): THREE.MeshPhysicalMaterial => {
  return getCachedMaterial(`wire-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.4,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.6,
  }));
};

// Create PBR material for LCD screen (glass with IPS coating)
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
// PROCEDURAL NORMAL MAPS - Surface Detail
// ============================================================================

// Create procedural PCB solder mask texture with traces
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

// Create plastic surface normal map (subtle grain)
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

// Create metal brushed normal map
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

// Cache for normal maps (avoid recreating)
let pcbNormalMap: THREE.CanvasTexture | null = null;
let plasticNormalMap: THREE.CanvasTexture | null = null;
let metalNormalMap: THREE.CanvasTexture | null = null;

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
// PHASE 1.5: LOD (Level of Detail) SYSTEM
// ============================================================================

// LOD distance thresholds - Adjusted for better visual quality
const LOD_HIGH_DISTANCE = 0;      // Full detail up close
const LOD_MEDIUM_DISTANCE = 300;  // Reduced detail (increased range)
const LOD_LOW_DISTANCE = 600;     // Minimal detail (pushed back)

// Create simplified material (no normal maps, basic properties)
const createSimpleMaterial = (color: number, metalness: number = 0): THREE.MeshLambertMaterial => {
  return getCachedMaterial(`simple-${color}-${metalness}`, () => new THREE.MeshLambertMaterial({
    color,
    emissive: 0x000000,
  }));
};

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

// Factory function to create geometry at specific LOD level
const createComponentAtLOD = (
  component: ElectronicComponent,
  width: number,
  depth: number,
  lodLevel: 'high' | 'medium' | 'low'
): THREE.Group => {
  const { type, name, threeCode } = component;
  const lowerName = (name || 'unknown').toLowerCase();
  const lowerType = (type || 'other').toLowerCase();

  // Try to use generated 3D code if available (High/Medium LOD only)
  if (threeCode && (lodLevel === 'high' || lodLevel === 'medium')) {
    try {
      const validationError = validateThreeCode(threeCode);
      if (!validationError) {
        // Return a group immediately, populate it asynchronously from worker
        const group = new THREE.Group();
        
        // Temporary placeholder (wireframe box)
        const placeholder = new THREE.Mesh(
            new THREE.BoxGeometry(width, Math.max(5, width/2), depth),
            new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true })
        );
        placeholder.position.y = Math.max(5, width/2) / 2;
        group.add(placeholder);

        executeInWorker(threeCode).then((json) => {
            const loader = new THREE.ObjectLoader();
            const loadedObject = loader.parse(json);
            
            if (loadedObject) {
                // Clean up placeholder
                group.remove(placeholder);
                if (placeholder.geometry) placeholder.geometry.dispose();
                if (placeholder.material instanceof THREE.Material) placeholder.material.dispose();

                // Auto-scale to fit expected dimensions
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
            // Keep placeholder or show error indicator? 
            // Placeholder is fine for fallback.
        });

        return group;
      }
    } catch (e) {
      console.warn(`Failed to instantiate generated model for ${name}:`, e);
    }
  }

  if (lodLevel === 'high') {
    // Use full-detail procedural geometry
    if (lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega')) {
      return createArduinoGeometry(width, depth);
    }
    if (lowerName.includes('lcd') || lowerName.includes('display') || lowerName.includes('1602')) {
      return createLCDGeometry(width, depth);
    }
    if (lowerName.includes('dht') || lowerName.includes('temperature') || lowerName.includes('humidity')) {
      return createDHT11Geometry(width * 0.5, depth * 0.5);
    }
    if (lowerName.includes('breadboard') || lowerName.includes('830')) {
      return createBreadboardGeometry(width, depth);
    }
    return createGenericICGeometry(width, depth, lowerType);
  }

  if (lodLevel === 'medium') {
    if (lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega')) {
      return createArduinoMediumPoly(width, depth);
    }
    if (lowerName.includes('lcd') || lowerName.includes('display') || lowerName.includes('1602')) {
      return createLCDMediumPoly(width, depth);
    }
    if (lowerName.includes('dht') || lowerName.includes('temperature') || lowerName.includes('humidity')) {
      return createDHT11MediumPoly(width * 0.5, depth * 0.5);
    }
    if (lowerName.includes('breadboard') || lowerName.includes('830')) {
      return createBreadboardMediumPoly(width, depth);
    }
    return createGenericICMediumPoly(width, depth, lowerType);
  }

  // Low detail
  if (lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega')) {
    return createArduinoLowPoly(width, depth);
  }
  if (lowerName.includes('lcd') || lowerName.includes('display') || lowerName.includes('1602')) {
    return createLCDLowPoly(width, depth);
  }
  if (lowerName.includes('dht') || lowerName.includes('temperature') || lowerName.includes('humidity')) {
    return createDHT11LowPoly(width * 0.5, depth * 0.5);
  }
  if (lowerName.includes('breadboard') || lowerName.includes('830')) {
    return createBreadboardLowPoly(width, depth);
  }
  return createGenericICLowPoly(width, depth, lowerType);
};

// Create LOD object wrapping component at multiple detail levels
const createLODComponent = (
  component: ElectronicComponent,
  width: number,
  depth: number
): THREE.LOD => {
  const lod = new THREE.LOD();

  // High detail (closest)
  const highDetail = createComponentAtLOD(component, width, depth, 'high');
  lod.addLevel(highDetail, LOD_HIGH_DISTANCE);

  // Medium detail
  const mediumDetail = createComponentAtLOD(component, width, depth, 'medium');
  lod.addLevel(mediumDetail, LOD_MEDIUM_DISTANCE);

  // Low detail (furthest)
  const lowDetail = createComponentAtLOD(component, width, depth, 'low');
  lod.addLevel(lowDetail, LOD_LOW_DISTANCE);

  return lod;
};

// ============================================================================
// PHASE 2: PROCEDURAL GEOMETRY - Component Shapes
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
  const window = new THREE.Mesh(windowGeo, windowMat);
  window.position.set(0, bodyHeight - 0.3, 0);
  group.add(window);

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

  return holesMesh;
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
// WIRE COLOR MAPPING
// ============================================================================

const getWireColor = (fromPin: string): number => {
  const pin = fromPin.toUpperCase();
  if (pin === 'VCC' || pin === '5V' || pin === '3V3' || pin.includes('PWR')) return 0xdc2626;
  if (pin === 'GND') return 0x1f2937;
  if (pin === 'SDA' || pin === 'SCL') return 0x2563eb;
  if (pin === 'TX') return 0x059669;
  if (pin === 'RX') return 0xd97706;
  if (pin.startsWith('A')) return 0x0891b2;
  return 0xfbbf24;
};

// ============================================================================
// DISPOSE HELPER
// ============================================================================

const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (mat instanceof THREE.Material) {
          mat.dispose();
        }
      });
    }
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Diagram3DViewComponent = React.forwardRef<{ getSnapshotBlob: () => Promise<Blob | null> }, Diagram3DViewProps>(
  ({ diagram, positions, onComponentClick: _onComponentClick, onGenerate3D }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const _animationIdRef = useRef<number>(0);
  const componentsGroupRef = useRef<THREE.Group | null>(null);
  const wiresGroupRef = useRef<THREE.Group | null>(null);
  const telemetryGroupRef = useRef<THREE.Group | null>(null);
  const envMapRef = useRef<THREE.Texture | null>(null);
  
  const { liveData } = useTelemetry();
  const { neuralLinkEnabled, setNeuralLinkEnabled } = useLayout();
  const [missingModels, setMissingModels] = useState<ElectronicComponent[]>([]);

  // Expose snapshot capability to parent (DiagramCanvas)
  React.useImperativeHandle(ref, () => ({
    getSnapshotBlob: async () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
      
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const composer = composerRef.current;

      // Force a high-quality render for the snapshot
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      return new Promise((resolve) => {
        renderer.domElement.toBlob((blob) => resolve(blob), 'image/png', 0.8);
      });
    }
  }));

  // Create procedural environment map (studio HDRI simulation)
  const createEnvironmentMap = useCallback((renderer: THREE.WebGLRenderer): THREE.Texture => {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a simple gradient environment
    const envScene = new THREE.Scene();

    // Sky gradient
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    envScene.add(sky);

    // Add some bright spots for reflections
    const lightGeo = new THREE.SphereGeometry(50, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const light1 = new THREE.Mesh(lightGeo, lightMat);
    light1.position.set(200, 300, 100);
    envScene.add(light1);

    const light2 = new THREE.Mesh(lightGeo.clone(), lightMat.clone());
    light2.position.set(-200, 200, -100);
    envScene.add(light2);

    // Create environment camera
    const envCamera = new THREE.CubeCamera(1, 1000, new THREE.WebGLCubeRenderTarget(256));
    envCamera.update(renderer, envScene);

    const envMap = pmremGenerator.fromCubemap(envCamera.renderTarget.texture).texture;
    pmremGenerator.dispose();

    return envMap;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 250, 350);
    cameraRef.current = camera;

    // Renderer with enhanced settings
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable MSAA if we are using post-processing
      powerPreference: 'high-performance',
      precision: 'mediump', // Use medium precision for better performance
    });
    renderer.setSize(width, height);
    // CRITICAL PERFORMANCE FIX: Cap pixel ratio at 1.0
    renderer.setPixelRatio(1); 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create environment map for PBR reflections
    const envMap = createEnvironmentMap(renderer);
    scene.environment = envMap;
    envMapRef.current = envMap;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 800;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 20, 0);
    controlsRef.current = controls;

    // Enhanced lighting for PBR
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);

    // Adaptive settings
    const _isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    
    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(150, 300, 150);
    keyLight.castShadow = true;
    // PERFORMANCE: Drastically reduce shadow map size
    keyLight.shadow.mapSize.width = 1024; 
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = 800;
    keyLight.shadow.camera.left = -300;
    keyLight.shadow.camera.right = 300;
    keyLight.shadow.camera.top = 300;
    keyLight.shadow.camera.bottom = -300;
    keyLight.shadow.bias = -0.0005; 
    scene.add(keyLight);

    // PERFORMANCE: STATIC SHADOW MAPS
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    // Performance stats
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.left = '10px';
    container.appendChild(stats.dom);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.5);
    fillLight.position.set(-100, 150, -100);
    scene.add(fillLight);

    // Rim light (back light for edge definition)
    const rimLight = new THREE.DirectionalLight(0xffcc88, 0.4);
    rimLight.position.set(0, 50, -200);
    scene.add(rimLight);

    // ENERGIZED GLASS TABLE (Simplified to prevent feedback loops)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x001122,        // Dark cyber base
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
      emissive: 0x002244,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 2.0; 
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper - Adds technical "blueprint" look to the glass
    const gridHelper = new THREE.GridHelper(2000, 100, 0x0088ff, 0x002244);
    gridHelper.position.y = 2.01; 
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // Component and wire groups
    const componentsGroup = new THREE.Group();
    const wiresGroup = new THREE.Group();
    const telemetryGroup = new THREE.Group();
    scene.add(componentsGroup);
    scene.add(wiresGroup);
    scene.add(telemetryGroup);
    componentsGroupRef.current = componentsGroup;
    wiresGroupRef.current = wiresGroup;
    telemetryGroupRef.current = telemetryGroup;

    // Post-processing setup with optimized settings
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Subtle bloom - Reduced complexity
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.2,   // Reduced strength
      0.1,   // Reduced radius
      0.9    // Increased threshold (only bright things bloom)
    );
    composer.addPass(bloomPass);

    // FXAA as the final pass
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
    composer.addPass(fxaaPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // PERFORMANCE: ON-DEMAND RENDERING WITH THROTTLING
    let renderRequested = false;
    let lastRenderTime = 0;
    const FRAME_MIN_TIME = 1000 / 30; // Cap at 30fps during interaction to save battery/CPU

    const requestRender = () => {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    };

    const render = (now: number) => {
      renderRequested = false;
      
      // Throttle if needed
      if (now - lastRenderTime < FRAME_MIN_TIME) {
        requestRender();
        return;
      }
      lastRenderTime = now;

      stats.update();
      if (controls.update()) {
        // Continue rendering if controls are still damping
        requestRender();
      }
      
      // Update LOD levels
      if (componentsGroupRef.current) {
        componentsGroupRef.current.traverse((child) => {
          if (child instanceof THREE.LOD) {
            child.update(camera);
          }
        });
      }

      composer.render();
    };


    // Render on interaction
    controls.addEventListener('change', requestRender);
    
    // Initial render burst
    requestRender();
    setTimeout(requestRender, 100);
    setTimeout(requestRender, 500);

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer || !composer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);
      
      const pixelRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (newWidth * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (newHeight * pixelRatio);
      
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    // Expose requestRender to effect below
    (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender = requestRender;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      envMap.dispose();
      scene.traverse(disposeObject);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (container.contains(stats.dom)) {
        container.removeChild(stats.dom);
      }
    };
  }, [createEnvironmentMap]);

  // Update components and wires when diagram changes
  useEffect(() => {
    if (!diagram || !componentsGroupRef.current || !wiresGroupRef.current || !sceneRef.current) return;

    const componentsGroup = componentsGroupRef.current;
    const wiresGroup = wiresGroupRef.current;
    const scene = sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing objects
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

    // Scale factor (2D canvas coords to 3D)
    const scale = 0.5;
    const offsetX = -200;
    const offsetZ = -150;
    
    // Track missing models
    const missing: ElectronicComponent[] = [];

    // Create 3D components with LOD (Level of Detail)
    diagram.components.forEach((component) => {
      // Defensive check: ensure component exists and has an ID
      if (!component || !component.id) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      // Defensive check: ensure position is valid numbers
      if (isNaN(pos.x) || isNaN(pos.y)) {
        console.warn(`Invalid position for component ${component.id}`, pos);
        return;
      }

      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');
      
      // Defensive check: ensure shape dimensions are valid
      if (!shape || isNaN(shape.width) || isNaN(shape.height)) {
        console.warn(`Invalid shape dimensions for ${component.id}`);
        return;
      }

      const width = shape.width * scale;
      const depth = shape.height * scale;
      
      // Check if we need to generate a model
      if (!component.threeCode && !component.threeDModelUrl) {
        missing.push(component);
      }

      // Create LOD component with multiple detail levels
      const lodComponent = createLODComponent(component, width, depth);

      lodComponent.position.set(
        pos.x * scale + offsetX + width / 2,
        3,
        pos.y * scale + offsetZ + depth / 2
      );

      lodComponent.userData = { component };

      // Apply environment map to all materials in all LOD levels
      lodComponent.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.envMap = envMapRef.current;
          child.material.needsUpdate = true;
        }
      });

      // Add floating label (attached to the LOD object, shared across all levels)
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
        ctx.fillText((component.name || 'Unknown').substring(0, 16), 256, 80);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const label = new THREE.Sprite(labelMaterial);
      label.position.set(0, 35, 0);
      label.scale.set(60, 15, 1);
      lodComponent.add(label);

      componentsGroup.add(lodComponent);
    });
    
    setMissingModels(missing);

    // Create 3D wires with PBR materials
    diagram.connections.forEach((connection) => {
      if (!connection.fromComponentId || !connection.toComponentId) return;

      const fromComponent = diagram.components.find((c) => c.id === connection.fromComponentId);
      const toComponent = diagram.components.find((c) => c.id === connection.toComponentId);

      if (!fromComponent || !toComponent) return;

      const fromPos = positions.get(fromComponent.id) || { x: 0, y: 0 };
      const toPos = positions.get(toComponent.id) || { x: 0, y: 0 };
      
      // Defensive checks for wire positions
      if (isNaN(fromPos.x) || isNaN(fromPos.y) || isNaN(toPos.x) || isNaN(toPos.y)) return;

      const fromShape = getComponentShape(fromComponent.type || 'other', fromComponent.name || 'Unknown');
      const toShape = getComponentShape(toComponent.type || 'other', toComponent.name || 'Unknown');

      const fromWidth = fromShape.width * scale;
      const fromDepth = fromShape.height * scale;
      const toWidth = toShape.width * scale;
      const toDepth = toShape.height * scale;

      const fromPinOffset = getPinCoordinates(
        fromComponent.type || 'other', 
        fromComponent.name || 'Unknown', 
        connection.fromPin || '', 
        fromWidth, 
        fromDepth
      );
      const toPinOffset = getPinCoordinates(
        toComponent.type || 'other', 
        toComponent.name || 'Unknown', 
        connection.toPin || '', 
        toWidth, 
        toDepth
      );
      
      // Validate pin offsets
      if (isNaN(fromPinOffset.x) || isNaN(fromPinOffset.z) || isNaN(toPinOffset.x) || isNaN(toPinOffset.z)) {
          console.warn("Invalid pin coordinates", connection);
          return;
      }

      const startX = (fromPos.x * scale + offsetX + fromWidth / 2) + fromPinOffset.x;
      const startY = 3 + fromPinOffset.y;
      const startZ = (fromPos.y * scale + offsetZ + fromDepth / 2) + fromPinOffset.z;

      const endX = (toPos.x * scale + offsetX + toWidth / 2) + toPinOffset.x;
      const endY = 3 + toPinOffset.y;
      const endZ = (toPos.y * scale + offsetZ + toDepth / 2) + toPinOffset.z;

      // Improved wire routing with more natural curves
      const wireHeight = Math.max(startY, endY) + 10 + Math.random() * 15;
      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;

      // Add some horizontal offset for visual interest
      const horizontalOffset = (Math.random() - 0.5) * 30;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(startX, startY + 10, startZ), // Vertical rise
        new THREE.Vector3(startX + horizontalOffset * 0.3, wireHeight, startZ + (midZ - startZ) * 0.3),
        new THREE.Vector3(midX + horizontalOffset, wireHeight + 5, midZ),
        new THREE.Vector3(endX - horizontalOffset * 0.3, wireHeight, endZ - (endZ - midZ) * 0.3),
        new THREE.Vector3(endX, endY + 10, endZ), // Vertical drop
        new THREE.Vector3(endX, endY, endZ),
      ]);

      // Thicker, more realistic wire
      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 1.5, 8, false); // Optimized geometry segments
      const wireMaterial = createWireMaterial(getWireColor(connection.fromPin || ''));
      wireMaterial.envMap = envMapRef.current;

      const wireMesh = new THREE.Mesh(tubeGeometry, wireMaterial);
      wireMesh.castShadow = true;
      wireMesh.receiveShadow = true;
      wiresGroup.add(wireMesh);

      // Add "Connectors" (Terminals/Solder points)
      const connectorGeo = new THREE.CylinderGeometry(2, 2, 4, 8);
      const connectorMat = createPlasticMaterial(0x111111);
      
      const startConnector = new THREE.Mesh(connectorGeo, connectorMat);
      startConnector.position.set(startX, startY, startZ);
      startConnector.castShadow = true;
      wiresGroup.add(startConnector);

      const endConnector = new THREE.Mesh(connectorGeo, connectorMat);
      endConnector.position.set(endX, endY, endZ);
      endConnector.castShadow = true;
      wiresGroup.add(endConnector);
    });

    // Center camera on components
    if (diagram.components.length > 0) {
      const box = new THREE.Box3().setFromObject(componentsGroup);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        if (controlsRef.current) {
          controlsRef.current.target.copy(center);
          controlsRef.current.target.y = 20;
        }
      }
    }
    
    // Trigger update
    if (rendererRef.current) {
        rendererRef.current.shadowMap.needsUpdate = true;
    }
    if (requestRender) requestRender();

  }, [diagram, positions]);

  // Update telemetry sprites when liveData changes
  useEffect(() => {
    if (!telemetryGroupRef.current || !diagram || !sceneRef.current) return;
    const group = telemetryGroupRef.current;
    const scene = sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing sprites
    while (group.children.length > 0) {
      const child = group.children[0];
      disposeObject(child);
      group.remove(child);
    }

    const scale = 0.5;
    const offsetX = -200;
    const offsetZ = -150;

    // Create 3D sprites for each active data point
    Object.entries(liveData).forEach(([key, packet]) => {
      const [componentId, pin] = key.split(':');
      
      // Attempt to find the component in the diagram
      const component = diagram.components.find(c => c.id === componentId);
      
      // If auto-mapped, we might not know which component yet, 
      // but if there's only one of that type, we could guess.
      // For now, we only show sprites for explicit IDs.
      if (!component) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');
      
      const width = shape.width * scale;
      const depth = shape.height * scale;

      const pinOffset = getPinCoordinates(
        component.type || 'other', 
        component.name || 'Unknown', 
        pin === 'default' ? '' : pin, 
        width, 
        depth
      );

      // Create a high-contrast label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = packet.value === 'HIGH' || packet.value === '1' ? '#00ff9d' : '#00f3ff';
        ctx.beginPath();
        ctx.roundRect(0, 0, 128, 64, 12);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(packet.value), 64, 32);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        depthTest: false // Ensure labels are always visible
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      
      // Position sprite above the pin
      sprite.position.set(
        pos.x * scale + offsetX + width / 2 + pinOffset.x,
        3 + pinOffset.y + 15, // 15 units above pin
        pos.y * scale + offsetZ + depth / 2 + pinOffset.z
      );
      
      sprite.scale.set(24, 12, 1);
      group.add(sprite);
    });

    if (requestRender) requestRender();
  }, [liveData, diagram, positions]);

  // Handle generation click
  const handleGenerateClick = async (component: ElectronicComponent) => {
    if (onGenerate3D) {
      await onGenerate3D(component);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Neural Link Toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <IconButton
          label={neuralLinkEnabled ? "DISABLE NEURAL-LINK" : "ENABLE NEURAL-LINK"}
          icon={
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {neuralLinkEnabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
              )}
            </div>
          }
          variant={neuralLinkEnabled ? "primary" : "secondary"}
          onClick={() => setNeuralLinkEnabled(!neuralLinkEnabled)}
          className={neuralLinkEnabled ? "shadow-[0_0_15px_rgba(0,243,255,0.4)]" : ""}
        />
      </div>

      {/* Missing Models Overlay */}
      {missingModels.length > 0 && onGenerate3D && (
        <div className="absolute top-4 right-4 z-10 bg-slate-950/90 border border-neon-purple/50 rounded-lg p-3 max-w-sm shadow-xl backdrop-blur-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <h4 className="text-xs font-bold text-neon-purple font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"/>
              Missing 3D Models
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{missingModels.length} ITEMS</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {missingModels.map(comp => (
              <div key={comp.id} className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-300 truncate max-w-[120px]" title={comp.name}>{comp.name}</span>
                <button
                  onClick={() => handleGenerateClick(comp)}
                  className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple hover:text-black transition-colors rounded uppercase font-bold tracking-wider shrink-0"
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const Diagram3DView = memo(Diagram3DViewComponent);

export default Diagram3DView;