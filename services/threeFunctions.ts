/**
 * threeFunctions.ts
 *
 * Extracted 3D rendering utility functions from Diagram3DView.tsx.
 * Contains pure functions for:
 * - Code validation (Three.js generated code safety)
 * - Pin coordinate calculation
 * - LOD component creation (with threeCode worker fallback)
 * - Wire color mapping
 * - Object disposal
 * - Environment map generation
 *
 * Geometry creation at various LOD levels is delegated to lodGenerators.ts.
 */

import * as THREE from 'three';
import { ElectronicComponent } from '../types';
import { executeInWorker } from './threeCodeRunner';
import { createComponentAtLOD } from './lodGenerators';

// Re-export material functions from lodGenerators for convenience
export { createWireMaterial, createPlasticMaterial } from './lodGenerators';

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
// HELPER: PIN COORDINATES
// ============================================================================

// Calculate local 3D offset for a specific pin on a component
export const getPinCoordinates = (type: string, name: string, pin: string, width: number, depth: number): THREE.Vector3 => {
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
// LOD (Level of Detail) COMPONENT FACTORY
// ============================================================================

// LOD distance thresholds - Adjusted for better visual quality
const LOD_HIGH_DISTANCE = 0;      // Full detail up close
const LOD_MEDIUM_DISTANCE = 300;  // Reduced detail (increased range)
const LOD_LOW_DISTANCE = 600;     // Minimal detail (pushed back)

// Create geometry at a specific LOD level, with threeCode fallback
const createGeometryAtLOD = (
  component: ElectronicComponent,
  width: number,
  depth: number,
  lodLevel: 'high' | 'medium' | 'low'
): THREE.Group => {
  const { type, name, threeCode } = component;

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

  // Delegate to extracted LOD geometry generator
  return createComponentAtLOD(name || 'unknown', type || 'other', lodLevel, width, depth);
};

// Create LOD object wrapping component at multiple detail levels
export const createLODComponent = (
  component: ElectronicComponent,
  width: number,
  depth: number
): THREE.LOD => {
  const lod = new THREE.LOD();

  // High detail (closest)
  const highDetail = createGeometryAtLOD(component, width, depth, 'high');
  lod.addLevel(highDetail, LOD_HIGH_DISTANCE);

  // Medium detail
  const mediumDetail = createGeometryAtLOD(component, width, depth, 'medium');
  lod.addLevel(mediumDetail, LOD_MEDIUM_DISTANCE);

  // Low detail (furthest)
  const lowDetail = createGeometryAtLOD(component, width, depth, 'low');
  lod.addLevel(lowDetail, LOD_LOW_DISTANCE);

  return lod;
};

// ============================================================================
// WIRE COLOR MAPPING
// ============================================================================

export const getWireColor = (fromPin: string): number => {
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

export const disposeObject = (obj: THREE.Object3D): void => {
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
// ENVIRONMENT MAP (Procedural Studio HDRI Simulation)
// ============================================================================

export const createEnvironmentMap = (renderer: THREE.WebGLRenderer): THREE.Texture => {
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
};
