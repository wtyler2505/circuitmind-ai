import * as THREE from 'three';

/**
 * ThreePrimitives: A high-fidelity library of electronic component 3D primitives.
 * Grounded in PBR (Physically Based Rendering) and IPC-7351 dimensions.
 */

// ============================================================================
// MATERIAL SYSTEM (PBR)
// ============================================================================

const materialCache = new Map<string, THREE.Material>();

const getCachedMaterial = <T extends THREE.Material>(key: string, createFn: () => T): T => {
  if (!materialCache.has(key)) {
    materialCache.set(key, createFn());
  }
  return materialCache.get(key) as T;
};

export const Materials = {
  // IC Epoxy Body
  IC_BODY: (color: number = 0x222222) => getCachedMaterial(`ic-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  })),

  // Gold Plated Pins
  GOLD: () => getCachedMaterial('gold', () => new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    roughness: 0.15,
    metalness: 1.0,
    reflectivity: 1.0,
  })),

  // Silver / Nickel Plating
  SILVER: () => getCachedMaterial('silver', () => new THREE.MeshPhysicalMaterial({
    color: 0xe5e4e2,
    roughness: 0.1,
    metalness: 1.0,
    reflectivity: 1.0,
  })),

  // Polished Aluminum (Heatsinks)
  ALUMINUM: () => getCachedMaterial('aluminum', () => new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    roughness: 0.25,
    metalness: 1.0,
    reflectivity: 0.8,
  })),

  // Raw Copper (Traces)
  COPPER: () => getCachedMaterial('copper', () => new THREE.MeshPhysicalMaterial({
    color: 0xb87333,
    roughness: 0.2,
    metalness: 1.0,
    reflectivity: 0.9,
  })),

  // Silicon (Exposed Die / Glassy look)
  SILICON: () => getCachedMaterial('silicon', () => new THREE.MeshPhysicalMaterial({
    color: 0x333333,
    roughness: 0.1,
    metalness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })),

  // Tin/Solder
  SOLDER: () => getCachedMaterial('solder', () => new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 1.0,
    reflectivity: 0.8,
  })),

  // PCB Substrate (FR4 with Solder Mask)
  PCB: (color: number = 0x004400) => getCachedMaterial(`pcb-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.4,
    metalness: 0.0,
    transmission: 0.2, // Subsurface scattering feel
    thickness: 1.0,
    clearcoat: 1.0, // Solder mask lacquer
    clearcoatRoughness: 0.1,
  })),

  // Plastic (Connectors)
  PLASTIC: (color: number = 0x111111) => getCachedMaterial(`plastic-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.5,
    metalness: 0.0,
    clearcoat: 0.1,
  }))
};

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

// Cache for procedural textures to prevent memory leaks and improve performance
const textureCache = new Map<string, THREE.CanvasTexture>();

const createTraceTexture = (width: number, length: number): THREE.CanvasTexture => {
  const key = `${width.toFixed(1)}x${length.toFixed(1)}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  // Scale up for resolution (e.g. 10 pixels per mm)
  const scale = 20; 
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(length * scale);
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Fill background (Neutral Normal [128, 128, 255])
    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Random Traces (Simulated)
    ctx.strokeStyle = 'rgb(160, 160, 255)'; // Slight bump
    ctx.lineWidth = 2 * scale; // 2mm traces
    
    // Draw 5-10 random "routes"
    for (let i = 0; i < 8; i++) {
        const x1 = Math.random() * canvas.width;
        const y1 = Math.random() * canvas.height;
        const x2 = Math.random() * canvas.width;
        const y2 = Math.random() * canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        // Orthogonal routing
        if (Math.random() > 0.5) {
             ctx.lineTo(x2, y1);
             ctx.lineTo(x2, y2);
        } else {
             ctx.lineTo(x1, y2);
             ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    }
    
    // 3. Draw Pads (Circles)
    ctx.fillStyle = 'rgb(200, 200, 255)'; // Higher bump
    for (let i = 0; i < 20; i++) {
         const x = Math.random() * canvas.width;
         const y = Math.random() * canvas.height;
         ctx.beginPath();
         ctx.arc(x, y, 1.5 * scale, 0, Math.PI * 2);
         ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  textureCache.set(key, texture);
  return texture;
};


// ============================================================================
// GEOMETRY PRIMITIVES
// ============================================================================

export const Primitives = {
  // ... (previous primitives)
  createICBody: (width: number, length: number, height: number, color: number = 0x222222) => {
    const group = new THREE.Group();
    
    // Main body
    const geometry = new THREE.BoxGeometry(width, height, length);
    const mesh = new THREE.Mesh(geometry, Materials.IC_BODY(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Pin 1 indicator (dot or notch)
    const indicatorGeo = new THREE.CylinderGeometry(width * 0.05, width * 0.05, 0.2, 16);
    const indicator = new THREE.Mesh(indicatorGeo, Materials.IC_BODY(0x111111));
    indicator.position.set(-width * 0.35, height / 2, -length * 0.35);
    group.add(indicator);

    return group;
  },

  /**
   * Creates a row of pins (Gullwing or DIP style).
   */
  createPinRow: (count: number, pitch: number, length: number, side: 'left' | 'right' | 'front' | 'back', type: 'gullwing' | 'dip' = 'gullwing') => {
    const group = new THREE.Group();
    const pinWidth = 0.4;
    const startPos = -((count - 1) * pitch) / 2;

    for (let i = 0; i < count; i++) {
      let pin: THREE.Mesh;
      
      if (type === 'gullwing') {
        // Gullwing pin is an "L" shape - using ExtrudeGeometry for realism
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.8, 0);
        shape.lineTo(1.2, -0.8);
        shape.lineTo(2.0, -0.8);
        shape.lineTo(2.0, -1.0);
        shape.lineTo(1.0, -1.0);
        shape.lineTo(0.5, -0.2);
        shape.lineTo(0, -0.2);
        shape.closePath();

        const extrudeSettings = { depth: pinWidth, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        pin = new THREE.Mesh(geometry, Materials.SOLDER());
        pin.rotation.y = side === 'left' ? -Math.PI / 2 : Math.PI / 2;
      } else {
        // DIP pin is a straight vertical down
        const geometry = new THREE.BoxGeometry(pinWidth, 4, 0.2);
        pin = new THREE.Mesh(geometry, Materials.SOLDER());
      }

      const offset = startPos + i * pitch;
      if (side === 'left' || side === 'right') {
        pin.position.z = offset;
        pin.position.x = side === 'left' ? -length / 2 : length / 2;
      } else {
        pin.position.x = offset;
        pin.position.z = side === 'front' ? -length / 2 : length / 2;
      }
      
      pin.castShadow = true;
      group.add(pin);
    }
    return group;
  },

  /**
   * Creates a cylindrical body (e.g. electrolytic capacitor).
   */
  createCylinderBody: (radius: number, height: number, color: number = 0x333333) => {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const mesh = new THREE.Mesh(geometry, Materials.PLASTIC(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Negative stripe (for polarity)
    const stripeGeo = new THREE.CylinderGeometry(radius + 0.05, radius + 0.05, height, 32, 1, false, 0, Math.PI * 0.2);
    const stripe = new THREE.Mesh(stripeGeo, Materials.PLASTIC(0xbbbbbb));
    group.add(stripe);

    return group;
  },

  /**
   * Creates a pin header.
   */
  createHeader: (count: number, pitch: number, height: number = 2.5, rows: number = 1) => {
    const group = new THREE.Group();
    const plasticGeo = new THREE.BoxGeometry(pitch, height, pitch);
    const pinGeo = new THREE.BoxGeometry(0.6, height + 6, 0.6);
    
    for (let r = 0; r < rows; r++) {
      const zOffset = (r - (rows - 1) / 2) * pitch;
      for (let i = 0; i < count; i++) {
        const plastic = new THREE.Mesh(plasticGeo, Materials.PLASTIC());
        plastic.position.x = (i - (count - 1) / 2) * pitch;
        plastic.position.z = zOffset;
        plastic.castShadow = true;
        group.add(plastic);

        const pin = new THREE.Mesh(pinGeo, Materials.GOLD());
        pin.position.x = plastic.position.x;
        pin.position.z = zOffset;
        pin.position.y = 1;
        pin.castShadow = true;
        group.add(pin);
      }
    }
    return group;
  },

  /**
   * Creates a USB Type-B port (found on Arduino Uno).
   */
  createUSBPort: (type: 'B' | 'C' | 'Micro' = 'B') => {
    const group = new THREE.Group();
    if (type === 'B') {
      const outerGeo = new THREE.BoxGeometry(12, 11, 16);
      const outerMesh = new THREE.Mesh(outerGeo, Materials.SILVER());
      outerMesh.position.y = 5.5;
      group.add(outerMesh);

      const innerGeo = new THREE.BoxGeometry(8, 7, 2);
      const innerMesh = new THREE.Mesh(innerGeo, Materials.PLASTIC(0x000000));
      innerMesh.position.set(0, 5.5, 7.1);
      group.add(innerMesh);
    }
    return group;
  },

  /**
   * Creates a DC Barrel Jack.
   */
  createDCJack: () => {
    const group = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(9, 11, 14);
    const body = new THREE.Mesh(bodyGeo, Materials.PLASTIC());
    body.position.y = 5.5;
    group.add(body);

    const ringGeo = new THREE.CylinderGeometry(4, 4, 2, 16);
    const ring = new THREE.Mesh(ringGeo, Materials.SILVER());
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 5.5, 7);
    group.add(ring);

    const pinGeo = new THREE.CylinderGeometry(1, 1, 8, 8);
    const pin = new THREE.Mesh(pinGeo, Materials.SILVER());
    pin.rotation.x = Math.PI / 2;
    pin.position.set(0, 5.5, 4);
    group.add(pin);
    return group;
  },

  /**
   * Creates a Crystal Oscillator (Silver SMD type).
   */
  createOscillator: (width: number = 5, length: number = 3.2) => {
    const geo = new THREE.BoxGeometry(width, 1.2, length);
    const mesh = new THREE.Mesh(geo, Materials.SILVER());
    mesh.position.y = 0.6;
    return mesh;
  },

  /**
   * Creates a tactile reset button.
   */
  createButton: (color: number = 0xcc0000) => {
    const group = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(6, 2, 6);
    const base = new THREE.Mesh(baseGeo, Materials.PLASTIC(0x333333));
    base.position.y = 1;
    group.add(base);

    const btnGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 16);
    const btn = new THREE.Mesh(btnGeo, Materials.PLASTIC(color));
    btn.position.y = 3;
    group.add(btn);
    return group;
  },

  /**
   * Creates a laser-etched label or marking.
   */
  createLabel: (text: string, size: number = 1, color: string = '#ffffff') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.font = `bold 40px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(text, 128, 45);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8 });
    const geo = new THREE.PlaneGeometry(size * 4, size);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  },

  /**
   * Creates a PCB base.
   */
  createPCB: (width: number, length: number, color: number = 0x004400, procedural: boolean = false) => {
    const geometry = new THREE.BoxGeometry(width, 1.6, length); // Standard 1.6mm thickness
    const material = Materials.PCB(color).clone();
    
    if (procedural) {
        // Generate a unique trace texture for this PCB
        const traceMap = createTraceTexture(width, length);
        material.normalMap = traceMap;
        material.normalScale = new THREE.Vector2(0.5, 0.5);
        
        // Also use it for roughness to make traces shinier under the mask
        // Note: Real normal maps are blue/purple, but using it as roughness 
        // will interpret blue channel as roughness value. 
        // Ideally we'd generate a separate grayscale roughness map, but this is a cheap hack.
        // Or we can just rely on the normal map for the "bump" effect.
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  }
};
