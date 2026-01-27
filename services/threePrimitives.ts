import * as THREE from 'three';

/**
 * ThreePrimitives: A high-fidelity library of electronic component 3D primitives.
 * Grounded in PBR (Physically Based Rendering) and IPC-7351 dimensions.
 */

// Helper to safely parse numbers, defaulting if NaN/Inf/Invalid
const safeNum = (val: unknown, def: number): number => {
  const n = Number(val);
  return (Number.isFinite(n) && !Number.isNaN(n)) ? n : def;
};

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

// Helper to create a noise texture for wear/tear
const createWearTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        // Add random scratches
        ctx.strokeStyle = '#eeeeee';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random()*512, Math.random()*512);
            ctx.lineTo(Math.random()*512, Math.random()*512);
            ctx.stroke();
        }
        // Add dust/spots
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(200,200,200,${Math.random()*0.1})`;
            ctx.beginPath();
            ctx.arc(Math.random()*512, Math.random()*512, Math.random()*2, 0, Math.PI*2);
            ctx.fill();
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

const wearMap = createWearTexture();

export const Materials = {
  // IC Epoxy Body
  IC_BODY: (color: number = 0x222222) => getCachedMaterial(`ic-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.75,
    metalness: 0.05,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
    roughnessMap: wearMap,
  })),

  // Gold Plated Pins
  GOLD: () => getCachedMaterial('gold', () => new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    roughness: 0.15,
    metalness: 1.0,
    reflectivity: 1.0,
    envMapIntensity: 1.0,
  })),

  // Silver / Nickel Plating
  SILVER: () => getCachedMaterial('silver', () => new THREE.MeshPhysicalMaterial({
    color: 0xe5e4e2,
    roughness: 0.1,
    metalness: 1.0,
    reflectivity: 1.0,
    envMapIntensity: 1.0,
  })),

  // Polished Aluminum (Heatsinks)
  ALUMINUM: () => getCachedMaterial('aluminum', () => new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    roughness: 0.25,
    metalness: 1.0,
    reflectivity: 0.8,
    envMapIntensity: 0.8,
  })),

  // Raw Copper (Traces)
  COPPER: () => getCachedMaterial('copper', () => new THREE.MeshPhysicalMaterial({
    color: 0xb87333,
    roughness: 0.2,
    metalness: 1.0,
    reflectivity: 0.9,
    envMapIntensity: 0.9,
  })),

  // Silicon (Exposed Die / Glassy look)
  SILICON: () => getCachedMaterial('silicon', () => new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    roughness: 0.05,
    metalness: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  })),

  // Tin/Solder
  SOLDER: () => getCachedMaterial('solder', () => new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    roughness: 0.3,
    metalness: 1.0,
    reflectivity: 0.8,
    envMapIntensity: 0.7,
  })),

  // PCB Substrate (FR4 with Solder Mask)
  PCB: (color: number = 0x004400) => getCachedMaterial(`pcb-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.1,
    transmission: 0.2, // Enhanced translucency
    thickness: 1.6,
    ior: 1.55,
    clearcoat: 1.0,
    clearcoatRoughness: 0.15,
    attenuationColor: new THREE.Color(color),
    attenuationDistance: 0.4,
    specularIntensity: 0.5,
  })),

  // Glass (For LEDs/Displays)
  GLASS: (color: number = 0xffffff) => getCachedMaterial(`glass-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 0.5,
    ior: 1.5,
  })),

  // Plastic (Connectors)
  PLASTIC: (color: number = 0x111111) => getCachedMaterial(`plastic-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.4,
    metalness: 0.0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
  })),

  // Hallucination mitigation for AI: Light markings (White/Silver)
  IC_MARKING_LIGHT: () => getCachedMaterial('ic-marking-light', () => new THREE.MeshBasicMaterial({
    color: 0xeeeeee,
    transparent: true,
    opacity: 0.8,
  })),

  // Hallucination mitigation for AI: Dark markings (Black/Engraved)
  IC_MARKING_DARK: () => getCachedMaterial('ic-marking-dark', () => new THREE.MeshBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.8,
  })),

  // Passive Component Bodies
  RESISTOR_BODY: (color: number = 0x333333) => getCachedMaterial(`resistor-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.6,
    metalness: 0.0,
  })),

  CAPACITOR_BODY: (color: number = 0x222222) => getCachedMaterial(`capacitor-${color}`, () => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.5,
    metalness: 0.1,
  }))
};

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

// Cache for procedural textures to prevent memory leaks and improve performance
const textureCache = new Map<string, { normal: THREE.CanvasTexture, spec: THREE.CanvasTexture }>();

export const disposeCaches = () => {
  // Dispose Textures
  textureCache.forEach((value) => {
    value.normal.dispose();
    value.spec.dispose();
  });
  textureCache.clear();

  // Dispose Materials
  materialCache.forEach((mat) => {
    mat.dispose();
    const m = mat as THREE.MeshStandardMaterial & { 
        roughnessMap?: THREE.Texture | null; 
        metalnessMap?: THREE.Texture | null; 
    };
    if (m.map) m.map.dispose();
    if (m.roughnessMap) m.roughnessMap.dispose();
    if (m.metalnessMap) m.metalnessMap.dispose();
    if (m.normalMap) m.normalMap.dispose();
  });
  materialCache.clear();
  
  // Note: wearMap is global/singleton, so we keep it or verify if it needs dispose (it's small)
};

const createPCBTextures = (width: number, length: number): { normal: THREE.CanvasTexture, spec: THREE.CanvasTexture } => {
  const w = safeNum(width, 50);
  const l = safeNum(length, 50);
  const key = `${w.toFixed(1)}x${l.toFixed(1)}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  // 1. Normal Map Canvas
  const normCanvas = document.createElement('canvas');
  const scale = 10; 
  // Ensure non-zero dimensions
  normCanvas.width = Math.max(1, Math.ceil(w * scale));
  normCanvas.height = Math.max(1, Math.ceil(l * scale));
  const nCtx = normCanvas.getContext('2d');
  
  // 2. Specular/Roughness/Metalness Canvas (R: Roughness, G: Metalness, B: Unused)
  const specCanvas = document.createElement('canvas');
  specCanvas.width = normCanvas.width;
  specCanvas.height = normCanvas.height;
  const sCtx = specCanvas.getContext('2d');

  if (nCtx && sCtx) {
    // Normal Background (Flat)
    nCtx.fillStyle = 'rgb(128, 128, 255)';
    nCtx.fillRect(0, 0, normCanvas.width, normCanvas.height);

    // Specular Background (Semi-rough [100/255], non-metal [0])
    sCtx.fillStyle = 'rgb(100, 0, 0)'; 
    sCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);

    // --- THE TURTLE ROUTER (Procedural Trace Generation) ---
    const drawTrace = (x: number, y: number, length: number, angle: number) => {
        const width = (Math.random() > 0.8 ? 2 : 1) * scale; // Occasional thick power traces
        nCtx.lineWidth = width;
        sCtx.lineWidth = width;
        
        nCtx.strokeStyle = 'rgb(140, 140, 255)';
        sCtx.strokeStyle = 'rgb(50, 150, 0)';

        nCtx.beginPath(); sCtx.beginPath();
        nCtx.moveTo(x, y); sCtx.moveTo(x, y);
        
        // Dogleg logic
        let cx = x, cy = y;
        let remaining = length;
        let currentAngle = angle;
        
        while (remaining > 0) {
            const segment = Math.min(remaining, Math.random() * 50 + 20);
            cx += Math.cos(currentAngle) * segment;
            cy += Math.sin(currentAngle) * segment;
            
            nCtx.lineTo(cx, cy); sCtx.lineTo(cx, cy);
            
            // 45 degree turn
            if (Math.random() > 0.5) currentAngle += Math.PI / 4;
            else currentAngle -= Math.PI / 4;
            
            remaining -= segment;
        }
        nCtx.stroke(); sCtx.stroke();
        
        // Add Via at end
        nCtx.fillStyle = 'rgb(180, 180, 255)';
        sCtx.fillStyle = 'rgb(20, 255, 0)';
        nCtx.beginPath(); nCtx.arc(cx, cy, width * 0.8, 0, Math.PI * 2); nCtx.fill();
        sCtx.beginPath(); sCtx.arc(cx, cy, width * 0.8, 0, Math.PI * 2); sCtx.fill();
    };

    // Spawn traces from edges and random IC spots
    for (let i = 0; i < 40; i++) {
        const startX = Math.random() * normCanvas.width;
        const startY = Math.random() * normCanvas.height;
        const angle = Math.floor(Math.random() * 8) * (Math.PI / 4); // Snap to 45 deg
        drawTrace(startX, startY, Math.random() * 300 + 100, angle);
    }
    
    // Ground Plane Fill (Hatched)
    nCtx.strokeStyle = 'rgba(140, 140, 255, 0.1)';
    nCtx.lineWidth = 1;
    for(let i=0; i<normCanvas.width; i+=10) {
        nCtx.beginPath(); nCtx.moveTo(i, 0); nCtx.lineTo(i, normCanvas.height); nCtx.stroke();
    }
  }

  const normal = new THREE.CanvasTexture(normCanvas);
  const spec = new THREE.CanvasTexture(specCanvas);
  
  const result = { normal, spec };
  textureCache.set(key, result);
  return result;
};


// ============================================================================
// GEOMETRY PRIMITIVES
// ============================================================================

export const Primitives = {
  /**
   * Creates a high-fidelity IC body with chamfered/beveled edges.
   */
  createICBody: (width: number, length: number, height: number, color: number = 0x222222) => {
    const w = safeNum(width, 10);
    const l = safeNum(length, 10);
    const h = safeNum(height, 2);
    const group = new THREE.Group();
    
    // Create a beveled box using ExtrudeGeometry for realism
    const shape = new THREE.Shape();
    const radius = 0.2; // Chamfer radius
    shape.moveTo(-w / 2 + radius, -l / 2);
    shape.lineTo(w / 2 - radius, -l / 2);
    shape.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + radius);
    shape.lineTo(w / 2, l / 2 - radius);
    shape.quadraticCurveTo(w / 2, l / 2, w / 2 - radius, l / 2);
    shape.lineTo(-w / 2 + radius, l / 2);
    shape.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - radius);
    shape.lineTo(-w / 2, -l / 2 + radius);
    shape.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + radius, -l / 2);

    const extrudeSettings = {
      steps: 1,
      depth: Math.max(0.1, h - 0.4),
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, Materials.IC_BODY(color));
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Pin 1 indicator (dot or notch)
    const indicatorGeo = new THREE.CylinderGeometry(w * 0.05, w * 0.05, 0.1, 16);
    const indicator = new THREE.Mesh(indicatorGeo, Materials.IC_BODY(0x111111));
    indicator.position.set(-w * 0.35, h, -l * 0.35);
    group.add(indicator);

    return group;
  },

  /**
   * Creates a realistic solder fillet at the base of a pin with wicking concave profile.
   */
  createSolderFillet: (width: number, length: number, height: number = 0.4) => {
    const w = safeNum(width, 0.5);
    const l = safeNum(length, 1.0);
    const h = safeNum(height, 0.4);
    
    const shape = new THREE.Shape();
    // Start at bottom center
    shape.moveTo(-w / 2 - 0.2, 0); // Slight bleed past pin width
    shape.lineTo(w / 2 + 0.2, 0);
    shape.lineTo(w / 2 + 0.1, 0.1);
    
    // Wicking curve up the pin
    shape.quadraticCurveTo(0, h * 0.8, -w / 2 - 0.1, 0.1);
    shape.closePath();
    
    const extrudeSettings = { depth: l, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -l / 2);
    
    const mesh = new THREE.Mesh(geometry, Materials.SOLDER());
    mesh.rotation.y = Math.PI / 2;
    return mesh;
  },

  /**
   * Creates a realistic aluminum heatsink with thermal dissipation fins.
   */
  createHeatsink: (width: number = 10, length: number = 10, height: number = 5, finCount: number = 6) => {
    const w = safeNum(width, 10);
    const l = safeNum(length, 10);
    const h = safeNum(height, 5);
    const fc = safeNum(finCount, 6);
    
    const group = new THREE.Group();
    const baseH = 1.2;
    const baseGeo = new THREE.BoxGeometry(w, baseH, l);
    const base = new THREE.Mesh(baseGeo, Materials.ALUMINUM());
    base.position.y = baseH / 2;
    base.castShadow = true;
    group.add(base);

    const finThick = 0.4;
    const finH = h - baseH;
    const spacing = (w - (fc * finThick)) / (fc + 1);
    const finGeo = new THREE.BoxGeometry(finThick, finH, l - 0.5);
    
    for (let i = 0; i < fc; i++) {
        const fin = new THREE.Mesh(finGeo, Materials.ALUMINUM());
        fin.position.x = -w/2 + spacing + (i * (spacing + finThick)) + finThick/2;
        fin.position.y = baseH + finH/2;
        fin.castShadow = true;
        group.add(fin);
    }
    return group;
  },

  /**
   * Creates a realistic toroidal inductor with copper wire turns.
   */
  createInductorCoil: (radius: number = 4, thickness: number = 3, turns: number = 18) => {
    const r = safeNum(radius, 4);
    const th = safeNum(thickness, 3);
    const n = safeNum(turns, 18);
    
    const group = new THREE.Group();
    // Ferrite Core
    const coreGeo = new THREE.TorusGeometry(r, th/2, 12, 24);
    const core = new THREE.Mesh(coreGeo, Materials.IC_BODY(0x1a1a1a));
    core.rotation.x = Math.PI / 2;
    group.add(core);

    // Copper Wire Turns
    const wireRad = 0.25;
    const turnGeo = new THREE.TorusGeometry(th/2 + wireRad, wireRad, 8, 16);
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const turn = new THREE.Mesh(turnGeo, Materials.COPPER());
        turn.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        turn.rotation.y = -angle;
        group.add(turn);
    }
    return group;
  },

  /**
   * Creates procedural Flux residue around a component.
   */
  createFluxResidue: (width: number, length: number) => {
    const w = safeNum(width, 10);
    const l = safeNum(length, 10);
    const geo = new THREE.PlaneGeometry(w + 2, l + 2);
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0xaa8800,
        transparent: true,
        opacity: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        transmission: 0.5,
        thickness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.801; // Just above PCB surface
    return mesh;
  },

  /**
   * Creates a high-detail silkscreen logo or text marking.
   */
  createSilkscreenLogo: (text: string, color: string = '#ffffff') => {
    return Primitives.createLabel(text, 1.5, color);
  },

  /**
   * Creates a single Gullwing lead (SMD).
   */
  createGullwingLead: (width: number = 0.4) => {
    const w = safeNum(width, 0.4);
    const group = new THREE.Group();
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

    const extrudeSettings = { depth: w, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center the extrusion on Z
    geometry.translate(0, 0, -w / 2);
    
    const pinMesh = new THREE.Mesh(geometry, Materials.SOLDER());
    group.add(pinMesh);

    // Add solder fillet at the toe
    const fillet = Primitives.createSolderFillet(w, 0.6);
    // Adjust fillet position relative to the pin
    fillet.position.set(1.8, -1.0, 0);
    // Rotate fillet to align with Z axis extrusion center
    fillet.rotation.y = Math.PI / 2; 
    group.add(fillet);

    return group;
  },

  /**
   * Creates a single DIP pin (Through-hole).
   */
  createDipPin: (width: number = 0.4, length: number = 4) => {
    const w = safeNum(width, 0.4);
    const l = safeNum(length, 4);
    const geometry = new THREE.BoxGeometry(w, l, 0.2);
    const pin = new THREE.Mesh(geometry, Materials.SOLDER());
    return pin;
  },

  /**
   * Creates a single BGA ball.
   */
  createBgaBall: (diameter: number) => {
    const d = safeNum(diameter, 0.5);
    const geometry = new THREE.SphereGeometry(d / 2, 16, 12);
    const pin = new THREE.Mesh(geometry, Materials.SOLDER());
    return pin;
  },

  /**
   * Creates a row of pins (Gullwing, DIP, or BGA Ball style).
   */
  createPinRow: (count: number, pitch: number, length: number, side: 'left' | 'right' | 'front' | 'back' | 'bottom', type: 'gullwing' | 'dip' | 'ball' = 'gullwing') => {
    const c = safeNum(count, 1);
    const p = safeNum(pitch, 2.54);
    const l = safeNum(length, c * p);
    
    const group = new THREE.Group();
    const pinWidth = 0.4;
    const startPos = -((c - 1) * p) / 2;

    for (let i = 0; i < c; i++) {
      let pin: THREE.Object3D;
      
      if (type === 'gullwing') {
        pin = Primitives.createGullwingLead(pinWidth);
        // Rotation for side placement
        if (side === 'left') {
            pin.rotation.y = -Math.PI / 2;
        } else if (side === 'right') {
            pin.rotation.y = Math.PI / 2;
        } else if (side === 'front') {
             // Default orientation (maybe needs adjustment based on usage)
        } else if (side === 'back') {
             pin.rotation.y = Math.PI;
        }
      } else if (type === 'ball') {
        pin = Primitives.createBgaBall(p * 0.6);
      } else {
        // DIP
        pin = Primitives.createDipPin(pinWidth, 4);
      }

      const offset = startPos + i * p;
      if (side === 'left' || side === 'right') {
        pin.position.z = offset;
        pin.position.x = side === 'left' ? -l / 2 : l / 2;
      } else if (side === 'front' || side === 'back') {
        pin.position.x = offset;
        pin.position.z = side === 'front' ? -l / 2 : l / 2;
      } else {
        // Bottom (for BGA/QFN)
        const rowCount = Math.sqrt(c);
        const x = (i % rowCount - (rowCount - 1) / 2) * p;
        const z = (Math.floor(i / rowCount) - (rowCount - 1) / 2) * p;
        pin.position.set(x, -0.2, z);
      }
      
      pin.castShadow = true;
      // METADATA FOR INTERACTIVITY
      pin.userData = { 
          type: 'pin', 
          pinIndex: i, 
          side: side,
          label: `Pin ${i+1}` // Default label
      };
      group.add(pin);
    }
    return group;
  },

  /**
   * Creates a cylindrical body (e.g. electrolytic capacitor).
   */
  createCylinderBody: (radius: number, height: number, color: number = 0x333333) => {
    const r = safeNum(radius, 2);
    const h = safeNum(height, 5);
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(r, r, h, 32);
    const mesh = new THREE.Mesh(geometry, Materials.PLASTIC(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Negative stripe (for polarity)
    const stripeGeo = new THREE.CylinderGeometry(r + 0.05, r + 0.05, h, 32, 1, false, 0, Math.PI * 0.2);
    const stripe = new THREE.Mesh(stripeGeo, Materials.PLASTIC(0xbbbbbb));
    group.add(stripe);

    return group;
  },

  /**
   * Creates a pin header.
   */
  createHeader: (count: number, pitch: number, height: number = 2.5, rows: number = 1) => {
    const c = safeNum(count, 1);
    const p = safeNum(pitch, 2.54);
    const h = safeNum(height, 2.5);
    const rCount = safeNum(rows, 1);
    
    const group = new THREE.Group();
    const plasticGeo = new THREE.BoxGeometry(p, h, p);
    const pinGeo = new THREE.BoxGeometry(0.6, h + 6, 0.6);
    
    for (let r = 0; r < rCount; r++) {
      const zOffset = (r - (rCount - 1) / 2) * p;
      for (let i = 0; i < c; i++) {
        const plastic = new THREE.Mesh(plasticGeo, Materials.PLASTIC());
        plastic.position.x = (i - (c - 1) / 2) * p;
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
    const w = safeNum(width, 5);
    const l = safeNum(length, 3.2);
    const geo = new THREE.BoxGeometry(w, 1.2, l);
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
   * Creates a laser-etched label or marking with physical depth.
   */
  createLabel: (text: string, size: number = 1, color: string = '#ffffff') => {
    const s = safeNum(size, 1);
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Higher resolution for better etching
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background for bump map (Neutral)
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      ctx.fillStyle = color;
      ctx.font = `bold 60px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshPhysicalMaterial({ 
        map: tex, 
        transparent: true, 
        opacity: 0.9,
        bumpMap: tex,
        bumpScale: 0.05,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const geo = new THREE.PlaneGeometry(s * 4, s);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  },

  /**
   * Creates a PCB base.
   */
  createPCB: (width: number, length: number, color: number = 0x004400, procedural: boolean = false) => {
    const w = safeNum(width, 50);
    const l = safeNum(length, 50);
    const geometry = new THREE.BoxGeometry(w, 1.6, l); // Standard 1.6mm thickness
    const material = Materials.PCB(color).clone();
    
    if (procedural) {
        // Generate a unique trace texture for this PCB
        const textures = createPCBTextures(w, l);
        material.normalMap = textures.normal;
        material.normalScale = new THREE.Vector2(0.5, 0.5);
        
        // Roughness/Metalness mapping (R=Roughness, G=Metalness)
        material.roughnessMap = textures.spec;
        material.metalnessMap = textures.spec;
        material.metalness = 1.0; // Allow map to control it
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  },

  /**
   * Creates a standard SMD Resistor (0603, 0805, etc).
   */
  createSMDResistor: (width: number = 3.2, length: number = 1.6, height: number = 0.6) => {
    const w = safeNum(width, 3.2);
    const l = safeNum(length, 1.6);
    const h = safeNum(height, 0.6);
    
    const group = new THREE.Group();
    // Main body (Black/Dark)
    const bodyGeo = new THREE.BoxGeometry(Math.max(0.1, w - 0.4), h, l);
    const body = new THREE.Mesh(bodyGeo, Materials.RESISTOR_BODY());
    body.position.y = h / 2;
    body.castShadow = true;
    group.add(body);

    // Terminations (Silver)
    const termGeo = new THREE.BoxGeometry(0.2, h, l);
    const leftTerm = new THREE.Mesh(termGeo, Materials.SILVER());
    leftTerm.position.set(-(w / 2) + 0.1, h / 2, 0);
    group.add(leftTerm);

    const rightTerm = new THREE.Mesh(termGeo, Materials.SILVER());
    rightTerm.position.set((w / 2) - 0.1, h / 2, 0);
    group.add(rightTerm);
    
    return group;
  },

  /**
   * Creates a standard SMD Capacitor (Brown/Beige body).
   */
  createSMDCapacitor: (width: number = 3.2, length: number = 1.6, height: number = 1.6) => {
    const w = safeNum(width, 3.2);
    const l = safeNum(length, 1.6);
    const h = safeNum(height, 1.6);

    const group = new THREE.Group();
    // Main body (Brown/Beige)
    const bodyGeo = new THREE.BoxGeometry(Math.max(0.1, w - 0.4), h, l);
    const body = new THREE.Mesh(bodyGeo, Materials.CAPACITOR_BODY(0x8B4513)); // SaddleBrown
    body.position.y = h / 2;
    body.castShadow = true;
    group.add(body);

    // Terminations (Silver)
    const termGeo = new THREE.BoxGeometry(0.2, h, l);
    const leftTerm = new THREE.Mesh(termGeo, Materials.SILVER());
    leftTerm.position.set(-(w / 2) + 0.1, h / 2, 0);
    group.add(leftTerm);

    const rightTerm = new THREE.Mesh(termGeo, Materials.SILVER());
    rightTerm.position.set((w / 2) - 0.1, h / 2, 0);
    group.add(rightTerm);

    return group;
  },

  /**
   * Creates a through-hole or SMD LED.
   */
  createLED: (radius: number = 1.5, color: number = 0xff0000) => {
    const r = safeNum(radius, 1.5);
    const group = new THREE.Group();
    // Dome
    const domeGeo = new THREE.SphereGeometry(r, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, Materials.GLASS(color));
    dome.position.y = 0.5;
    group.add(dome);

    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(r, r, 1, 16);
    const base = new THREE.Mesh(baseGeo, Materials.GLASS(color));
    base.position.y = 0; // Centered at 0, goes -0.5 to 0.5
    group.add(base);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, 4, 0.4);
    const leg1 = new THREE.Mesh(legGeo, Materials.SILVER());
    leg1.position.set(-0.5, -2, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, Materials.SILVER());
    leg2.position.set(0.5, -2, 0);
    group.add(leg2);

    return group;
  },

  /**
   * Creates a single Bond Wire (ultra-fine gold wire).
   */
  createBondWire: (start: THREE.Vector3, end: THREE.Vector3) => {
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3((start.x + end.x)/2, start.y + 0.5, (start.z + end.z)/2), // Arc
      end
    ]);
    const geometry = new THREE.TubeGeometry(curve, 8, 0.02, 8, false);
    return new THREE.Mesh(geometry, Materials.GOLD());
  },

  /**
   * Creates an internal Lead Frame for delidded ICs.
   */
  createLeadFrame: (width: number, length: number) => {
    const w = safeNum(width, 10);
    const l = safeNum(length, 10);
    const group = new THREE.Group();
    const padGeo = new THREE.BoxGeometry(w * 0.4, 0.1, l * 0.4);
    const diePad = new THREE.Mesh(padGeo, Materials.SILVER());
    group.add(diePad);
    
    // Add 4 corner leads
    const leadGeo = new THREE.BoxGeometry(w * 0.2, 0.05, 0.5);
    for (let i = 0; i < 4; i++) {
        const lead = new THREE.Mesh(leadGeo, Materials.SILVER());
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        lead.position.set(Math.cos(angle) * w * 0.4, 0, Math.sin(angle) * l * 0.4);
        lead.lookAt(0, 0, 0);
        group.add(lead);
    }
    return group;
  },

  /**
   * Creates a high-fidelity USB Type-C port.
   */
  createUSB_C_Port: () => {
    const group = new THREE.Group();
    // Metal housing (Rounded rectangle)
    const shape = new THREE.Shape();
    const w = 8.94, h = 3.2, r = 1.6;
    shape.moveTo(-w/2 + r, -h/2);
    shape.lineTo(w/2 - r, -h/2);
    shape.absarc(w/2 - r, -h/2 + r, r, -Math.PI/2, 0, false);
    shape.lineTo(w/2, h/2 - r);
    shape.absarc(w/2 - r, h/2 - r, r, 0, Math.PI/2, false);
    shape.lineTo(-w/2 + r, h/2);
    shape.absarc(-w/2 + r, h/2 - r, r, Math.PI/2, Math.PI, false);
    shape.lineTo(-w/2, -h/2 + r);
    shape.absarc(-w/2 + r, -h/2 + r, r, Math.PI, Math.PI*1.5, false);
    
    const extrudeSettings = { depth: 7.3, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const housing = new THREE.Mesh(geometry, Materials.ALUMINUM());
    housing.position.y = h/2;
    group.add(housing);

    // Plastic tongue
    const tongueGeo = new THREE.BoxGeometry(6.5, 0.6, 5);
    const tongue = new THREE.Mesh(tongueGeo, Materials.PLASTIC(0x000000));
    tongue.position.set(0, h/2, 2.5);
    group.add(tongue);
    
    return group;
  },

  /**
   * Creates a JST-XH style connector.
   */
  createJSTConnector: (pins: number = 2) => {
    const p = safeNum(pins, 2);
    const group = new THREE.Group();
    const pitch = 2.5;
    const width = p * pitch + 2;
    const bodyGeo = new THREE.BoxGeometry(width, 5.8, 7);
    const body = new THREE.Mesh(bodyGeo, Materials.PLASTIC(0xeeeeee));
    body.position.y = 2.9;
    group.add(body);

    // Guide slots
    const slotGeo = new THREE.BoxGeometry(1, 4, 1);
    const slot1 = new THREE.Mesh(slotGeo, Materials.PLASTIC(0xdddddd));
    slot1.position.set(-width/2 + 0.5, 3, 3);
    group.add(slot1);
    
    const slot2 = slot1.clone();
    slot2.position.x = width/2 - 0.5;
    group.add(slot2);

    return group;
  },

  /**
   * Creates a realistic wire between two points.
   */
  createWire: (start: THREE.Vector3, end: THREE.Vector3, color: number = 0xff0000, radius: number = 0.5) => {
    const r = safeNum(radius, 0.5);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += Math.max(start.distanceTo(end) * 0.2, 2); // Sag/Arch
    
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const geometry = new THREE.TubeGeometry(curve, 20, r, 8, false);
    return new THREE.Mesh(geometry, Materials.PLASTIC(color));
  },

  /**
   * Creates a single PCB via.
   */
  createVia: (diameter: number = 0.3) => {
    const d = safeNum(diameter, 0.3);
    const geo = new THREE.CylinderGeometry(d/2, d/2, 1.61, 16);
    return new THREE.Mesh(geo, Materials.COPPER());
  },

  /**
   * Creates a through-hole pad with gold rim.
   */
  createThroughHolePad: (outerDia: number = 1.5, innerDia: number = 0.8) => {
    const od = safeNum(outerDia, 1.5);
    const id = safeNum(innerDia, 0.8);
    const group = new THREE.Group();
    // Plated hole
    const via = Primitives.createVia(id);
    group.add(via);
    
    // Gold ring on top
    const ringGeo = new THREE.RingGeometry(id/2, od/2, 32);
    const ring = new THREE.Mesh(ringGeo, Materials.GOLD());
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.81;
    group.add(ring);
    
    // Gold ring on bottom
    const ringBottom = ring.clone();
    ringBottom.position.y = -0.81;
    ringBottom.rotation.x = Math.PI / 2;
    group.add(ringBottom);
    
    return group;
  },

  /**
   * Applies realistic 'Manufacturing Variability' to an object.
   * Adds slight random rotations and position offsets.
   */
  applyVariability: (obj: THREE.Object3D, intensity: number = 1.0) => {
    obj.position.x += (Math.random() - 0.5) * 0.05 * intensity;
    obj.position.z += (Math.random() - 0.5) * 0.05 * intensity;
    obj.rotation.y += (Math.random() - 0.5) * 0.02 * intensity;
  },

  /**
   * Creates a polarity marking for electrolytic capacitors or diodes.
   */
  createPolarityMark: (radius: number, height: number) => {
    const r = safeNum(radius, 2);
    const h = safeNum(height, 5);
    const geo = new THREE.CylinderGeometry(r + 0.05, r + 0.05, h, 32, 1, false, 0, Math.PI * 0.2);
    const stripe = new THREE.Mesh(geo, Materials.PLASTIC(0xbbbbbb));
    return stripe;
  },

  createMountingHole: (diameter: number = 3.2) => {
    const d = safeNum(diameter, 3.2);
    const group = new THREE.Group();
    // Negative space representation (Dark circle on PCB)
    // In a real CSG engine we'd subtract, but for visual we paint it black/void
    const geometry = new THREE.CylinderGeometry(d/2, d/2, 1.7, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0;
    group.add(mesh);
    
    // Gold rim
    const ringGeo = new THREE.RingGeometry(d/2, d/2 + 0.5, 32);
    const ring = new THREE.Mesh(ringGeo, Materials.GOLD());
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.81; // Just above PCB
    group.add(ring);
    
    return group;
  },

  /**
   * Creates a standard HC-49/U Crystal.
   */
  createCrystal: (width: number = 11, length: number = 4.7, height: number = 13.5) => {
    const w = safeNum(width, 11);
    const l = safeNum(length, 4.7);
    const h = safeNum(height, 13.5);
    const group = new THREE.Group();
    
    // Metal Body (Oval cylinder shape)
    const shape = new THREE.Shape();
    const r = l / 2;
    const wRect = w - l; 
    shape.absarc(-wRect/2, 0, r, Math.PI/2, Math.PI*1.5, false);
    shape.absarc(wRect/2, 0, r, -Math.PI/2, Math.PI/2, false);
    
    const extrudeSettings = { depth: h - 1, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const body = new THREE.Mesh(geometry, Materials.SILVER());
    body.rotation.x = -Math.PI / 2;
    body.position.y = 1; // Leads space
    group.add(body);

    // Leads
    const leadGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
    const lead1 = new THREE.Mesh(leadGeo, Materials.SILVER());
    lead1.position.set(-2.4, -1, 0);
    group.add(lead1);

    const lead2 = new THREE.Mesh(leadGeo, Materials.SILVER());
    lead2.position.set(2.4, -1, 0);
    group.add(lead2);

    return group;
  },

  /**
   * Helper to calculate pin position for an IC.
   * Useful for wiring and trace generation.
   */
  getICPinPosition: (pinIndex: number, totalPins: number, pitch: number, width: number, length: number) => {
    const idx = safeNum(pinIndex, 0);
    const total = safeNum(totalPins, 4);
    const p = safeNum(pitch, 2.54);
    const w = safeNum(width, 10);
    const l = safeNum(length, 10);

    const sideCount = Math.ceil(total / 4); // Simplified square distribution
    const side = Math.floor(idx / sideCount); // 0: Left, 1: Bottom, 2: Right, 3: Top (approx)
    const indexOnSide = idx % sideCount;
    
    // Center-based offset
    const offset = (indexOnSide - (sideCount - 1) / 2) * p;
    
    const pos = new THREE.Vector3();
    
    switch (side) {
        case 0: // Left
            pos.set(-w/2, 0, offset);
            break;
        case 1: // Bottom
            pos.set(offset, 0, l/2);
            break;
        case 2: // Right
            pos.set(w/2, 0, -offset);
            break;
        case 3: // Top
            pos.set(-offset, 0, -l/2);
            break;
        default:
            pos.set(0, 0, 0);
    }
    return pos;
  },

  /**
   * Creates a Layout Engine helper for precise semantic placement.
   */
  createLayout: (boardWidth: number, boardLength: number) => {
    const w = safeNum(boardWidth, 100);
    const l = safeNum(boardLength, 100);
    return {
        // Dimensions for reference
        width: w,
        length: l,
        
        // Anchors (Relative to center 0,0)
        anchors: {
            topLeft: new THREE.Vector3(-w/2, 0, -l/2),
            topRight: new THREE.Vector3(w/2, 0, -l/2),
            bottomLeft: new THREE.Vector3(-w/2, 0, l/2),
            bottomRight: new THREE.Vector3(w/2, 0, l/2),
            center: new THREE.Vector3(0, 0, 0),
            left: new THREE.Vector3(-w/2, 0, 0),
            right: new THREE.Vector3(w/2, 0, 0),
            top: new THREE.Vector3(0, 0, -l/2),
            bottom: new THREE.Vector3(0, 0, l/2)
        },

        /**
         * Places an object relative to a semantic anchor.
         * @param obj The THREE.Object3D to place
         * @param anchor 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'left' | 'right' | 'top' | 'bottom'
         * @param offset {x, y, z} offset from the anchor point (in mm)
         */
        place: (obj: THREE.Object3D, anchor: string, offset: {x?: number, y?: number, z?: number} = {}) => {
            const xOff = safeNum(offset.x, 0);
            const yOff = safeNum(offset.y, 0); // Default y should be slightly above PCB (0.8mm)
            const zOff = safeNum(offset.z, 0);
            
            const pos = new THREE.Vector3(0, 0, 0);
            const a = anchor.toLowerCase().replace(/[^a-z]/g, '');
            
            if (a.includes('topleft')) pos.copy(new THREE.Vector3(-w/2, 0, -l/2));
            else if (a.includes('topright')) pos.copy(new THREE.Vector3(w/2, 0, -l/2));
            else if (a.includes('bottomleft')) pos.copy(new THREE.Vector3(-w/2, 0, l/2));
            else if (a.includes('bottomright')) pos.copy(new THREE.Vector3(w/2, 0, l/2));
            else if (a.includes('left')) pos.copy(new THREE.Vector3(-w/2, 0, 0));
            else if (a.includes('right')) pos.copy(new THREE.Vector3(w/2, 0, 0));
            else if (a.includes('top')) pos.copy(new THREE.Vector3(0, 0, -l/2));
            else if (a.includes('bottom')) pos.copy(new THREE.Vector3(0, 0, l/2));
            else pos.copy(new THREE.Vector3(0, 0, 0)); // Default center
            
            // Set position with Y shift to sit on top of PCB (PCB is 1.6mm thick, centered at Y=0)
            obj.position.set(pos.x + xOff, pos.y + 0.8 + yOff, pos.z + zOff);
        },
        
        /**
         * Distributes a list of objects linearly between two anchors.
         */
        distribute: (objects: THREE.Object3D[], axis: 'x' | 'z', startOffset: number, spacing: number) => {
            const off = safeNum(startOffset, 0);
            const sp = safeNum(spacing, 2.54);
            objects.forEach((obj, i) => {
                if (axis === 'x') {
                    obj.position.x = off + (i * sp);
                } else {
                    obj.position.z = off + (i * sp);
                }
            });
        }
    };
  },

  // ========================================================================
  // AI HALLUCINATION ALIASES
  // These map common AI guesses to the correct internal functions
  // ========================================================================
  
  createIC: (width: number, length: number, height: number, color?: number) => Primitives.createICBody(width, length, height, color),
  
  createResistor: (width?: number, length?: number, height?: number) => Primitives.createSMDResistor(width, length, height),
  
  createCapacitor: (width?: number, length?: number, height?: number) => Primitives.createSMDCapacitor(width, length, height),
  
  createPinHeader: (count: number, pitch: number, rows?: number) => Primitives.createHeader(count, pitch, 2.5, rows),
  
  createSilkscreenText: (text: string) => Primitives.createLabel(text),

  createBarrelJack: () => Primitives.createDCJack(),

  createVoltageRegulator: (_width?: number, _height?: number) => {
      // Alias to generic IC body or specific shape if needed
      // For now, return a generic 3-pin TO-220 style placeholder
      const group = new THREE.Group();
      const body = Primitives.createICBody(10, 4, 15);
      group.add(body);
      const pins = Primitives.createPinRow(3, 2.54, 10, 'bottom');
      pins.position.y = -5;
      group.add(pins);
      return group;
  },

  createShieldedModule: (width: number, length: number) => {
      // Generic metal can
      const w = safeNum(width, 15);
      const l = safeNum(length, 15);
      const geo = new THREE.BoxGeometry(w, 3, l);
      const mesh = new THREE.Mesh(geo, Materials.ALUMINUM());
      mesh.position.y = 1.5;
      return mesh;
  },

  createTactileSwitch: (_width?: number) => Primitives.createButton(0x333333),

  createTextLabel: (text: string, size?: number, color?: string) => Primitives.createLabel(text, size, color),

  createICLabel: (text: string, size?: number, color?: string) => Primitives.createLabel(text, size, color),
};