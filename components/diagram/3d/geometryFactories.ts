import * as THREE from 'three';
import {
  createPCBMaterial,
  createICMaterial,
  createPlasticMaterial,
  createPinMaterial,
  createScreenMaterial,
} from './materials';

// ============================================================================
// HIGH-DETAIL PROCEDURAL GEOMETRY
// ============================================================================

export const createArduinoGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 2;

  // Main PCB board
  const boardGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const board = new THREE.Mesh(boardGeo, createPCBMaterial(0x0066cc));
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

  // Chip notch
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

  // Pin headers
  const pinHeaderGeo = new THREE.BoxGeometry(width * 0.8, 8, 2.5);
  const pinHeaderMat = createPlasticMaterial(0x1a1a1a);
  const digitalHeader = new THREE.Mesh(pinHeaderGeo, pinHeaderMat);
  digitalHeader.position.set(0, boardHeight / 2 + 4, -depth / 2 + 5);
  digitalHeader.castShadow = true;
  group.add(digitalHeader);

  const analogHeader = new THREE.Mesh(pinHeaderGeo.clone(), pinHeaderMat.clone());
  analogHeader.position.set(0, boardHeight / 2 + 4, depth / 2 - 8);
  analogHeader.castShadow = true;
  group.add(analogHeader);

  // Individual pins
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
    color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5,
    roughness: 0.2, metalness: 0.0, transmission: 0.6,
  }));
  ledGreen.position.set(width * 0.3, boardHeight / 2 + 1.5, 0);
  group.add(ledGreen);

  const ledOrange = new THREE.Mesh(ledGeo.clone(), new THREE.MeshPhysicalMaterial({
    color: 0xff8800, emissive: 0xff8800, emissiveIntensity: 0.3,
    roughness: 0.2, metalness: 0.0, transmission: 0.6,
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

export const createLCDGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 2;
  const frameHeight = 8;

  // PCB base
  const boardGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const board = new THREE.Mesh(boardGeo, createPCBMaterial(0x1a6b3d));
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  // LCD frame
  const frameWidth = width * 0.9;
  const frameDepth = depth * 0.6;
  const frameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
  const frame = new THREE.Mesh(frameGeo, createPlasticMaterial(0x2a2a2a));
  frame.position.set(0, boardHeight / 2 + frameHeight / 2, -depth * 0.1);
  frame.castShadow = true;
  group.add(frame);

  // LCD screen
  const screenWidth = frameWidth * 0.85;
  const screenDepth = frameDepth * 0.7;
  const screenGeo = new THREE.BoxGeometry(screenWidth, 0.5, screenDepth);
  const screen = new THREE.Mesh(screenGeo, createScreenMaterial());
  screen.position.set(0, boardHeight / 2 + frameHeight - 0.3, -depth * 0.1);
  group.add(screen);

  // Backlight glow
  const glowGeo = new THREE.BoxGeometry(screenWidth * 0.95, 0.2, screenDepth * 0.95);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.3 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, boardHeight / 2 + frameHeight - 0.5, -depth * 0.1);
  group.add(glow);

  // Character grid (16x2)
  const charWidth = screenWidth / 18;
  const charHeight = screenDepth / 4;
  const charGeo = new THREE.PlaneGeometry(charWidth * 0.8, charHeight * 0.8);
  const charMat = new THREE.MeshBasicMaterial({ color: 0x004422, transparent: true, opacity: 0.6 });
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

  // I2C backpack
  const backpackGeo = new THREE.BoxGeometry(width * 0.25, 4, depth * 0.3);
  const backpack = new THREE.Mesh(backpackGeo, createPCBMaterial(0x0066cc));
  backpack.position.set(-width * 0.35, boardHeight / 2 + 2, depth * 0.3);
  backpack.castShadow = true;
  group.add(backpack);

  // Potentiometer
  const potGeo = new THREE.CylinderGeometry(2, 2, 1.5, 16);
  const pot = new THREE.Mesh(potGeo, createPlasticMaterial(0x0088ff));
  pot.position.set(-width * 0.35, boardHeight / 2 + 5, depth * 0.3);
  group.add(pot);

  return group;
};

export const createDHT11Geometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const bodyHeight = 15;

  // Main sensor housing
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
    color: 0xffffff, roughness: 0.1, metalness: 0.0, transmission: 0.8, thickness: 0.5,
  });
  const sensorWindow = new THREE.Mesh(windowGeo, windowMat);
  sensorWindow.position.set(0, bodyHeight - 0.3, 0);
  group.add(sensorWindow);

  // Pins
  const pinGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
  const pinMat = createPinMaterial();
  const pinSpacing = width * 0.25;
  for (let i = 0; i < 3; i++) {
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(-pinSpacing + i * pinSpacing, -4, 0);
    group.add(pin);
  }

  // Label
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

export const createBreadboardGeometry = (width: number, depth: number): THREE.Group => {
  const group = new THREE.Group();
  const boardHeight = 8;

  // Main body
  const bodyGeo = new THREE.BoxGeometry(width, boardHeight, depth);
  const body = new THREE.Mesh(bodyGeo, createPlasticMaterial(0xf5f5dc));
  body.position.y = boardHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Power rails
  const railWidth = width;
  const railDepth = depth * 0.06;
  const railGeo = new THREE.BoxGeometry(railWidth * 0.95, 0.5, railDepth);
  const redRailMat = createPlasticMaterial(0xcc0000);
  const blueRailMat = createPlasticMaterial(0x0000cc);

  const topRedRail = new THREE.Mesh(railGeo, redRailMat);
  topRedRail.position.set(0, boardHeight + 0.3, -depth / 2 + railDepth);
  group.add(topRedRail);

  const topBlueRail = new THREE.Mesh(railGeo.clone(), blueRailMat);
  topBlueRail.position.set(0, boardHeight + 0.3, -depth / 2 + railDepth * 2.5);
  group.add(topBlueRail);

  const bottomRedRail = new THREE.Mesh(railGeo.clone(), redRailMat.clone());
  bottomRedRail.position.set(0, boardHeight + 0.3, depth / 2 - railDepth);
  group.add(bottomRedRail);

  const bottomBlueRail = new THREE.Mesh(railGeo.clone(), blueRailMat.clone());
  bottomBlueRail.position.set(0, boardHeight + 0.3, depth / 2 - railDepth * 2.5);
  group.add(bottomBlueRail);

  // Center divider
  const dividerGeo = new THREE.BoxGeometry(width * 0.95, 1, depth * 0.02);
  const dividerMat = createPlasticMaterial(0xcccccc);
  const divider = new THREE.Mesh(dividerGeo, dividerMat);
  divider.position.set(0, boardHeight + 0.5, 0);
  group.add(divider);

  // Hole pattern (InstancedMesh)
  const holeGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });

  const holesPerRow = 30;
  const holeSpacing = width * 0.9 / holesPerRow;
  const rowSpacing = depth * 0.08;

  const cols = Math.ceil(holesPerRow / 3);
  const rows = 5;
  const totalHoles = cols * rows * 2;

  const holesMesh = new THREE.InstancedMesh(holeGeo, holeMat, totalHoles);
  const dummy = new THREE.Object3D();
  let index = 0;

  for (let col = 0; col < holesPerRow; col += 3) {
    for (let row = 0; row < 5; row++) {
      dummy.position.set(-width * 0.45 + col * holeSpacing, boardHeight + 0.3, -depth * 0.15 - row * rowSpacing);
      dummy.updateMatrix();
      holesMesh.setMatrixAt(index++, dummy.matrix);
    }
  }

  for (let col = 0; col < holesPerRow; col += 3) {
    for (let row = 0; row < 5; row++) {
      dummy.position.set(-width * 0.45 + col * holeSpacing, boardHeight + 0.3, depth * 0.15 + row * rowSpacing);
      dummy.updateMatrix();
      holesMesh.setMatrixAt(index++, dummy.matrix);
    }
  }

  holesMesh.instanceMatrix.needsUpdate = true;
  group.add(holesMesh);

  return group;
};

export const createGenericICGeometry = (width: number, depth: number, type: string): THREE.Group => {
  const group = new THREE.Group();
  const height = 12;

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

  // Beveled edge
  const edgeGeo = new THREE.BoxGeometry(width * 1.02, 1, depth * 1.02);
  const edge = new THREE.Mesh(edgeGeo, createICMaterial(color * 0.8));
  edge.position.y = 0.5;
  group.add(edge);

  // Pin rows
  const pinGeo = new THREE.BoxGeometry(1, 6, 0.5);
  const pinMat = createPinMaterial();
  const pinCount = Math.min(Math.floor(width / 5), 10);
  for (let i = 0; i < pinCount; i++) {
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.position.set(-width / 2 + 3 + i * (width - 6) / (pinCount - 1), -3, depth / 2 + 0.3);
    group.add(pin1);

    const pin2 = new THREE.Mesh(pinGeo.clone(), pinMat.clone());
    pin2.position.set(-width / 2 + 3 + i * (width - 6) / (pinCount - 1), -3, -depth / 2 - 0.3);
    group.add(pin2);
  }

  return group;
};
