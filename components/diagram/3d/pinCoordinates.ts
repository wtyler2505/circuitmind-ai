import * as THREE from 'three';
import type { ElectronicComponent } from '../../../types';
import { resolveComponentBounds, resolvePinEndpointWithFallback } from '../diagramUtils';

// ============================================================================
// PIN COORDINATES - Calculate local 3D offset for a specific pin on a component
// ============================================================================

const ARDUINO_DIGITAL_PINS: Record<string, number> = {
  'RX': 0, '0': 0, 'TX': 1, '1': 1,
  'GND': 14, 'AREF': 15, 'SDA': 16, 'SCL': 17,
};

const ARDUINO_ANALOG_PINS: Record<string, number> = {
  'VIN': 6, 'GND': 7, '5V': 9, '3V3': 10, 'RESET': 11,
};

const isDigitalPin = (pinName: string): boolean => {
  return pinName.startsWith('D') ||
    !isNaN(parseInt(pinName)) ||
    ['GND', 'AREF', 'SDA', 'SCL', 'TX', 'RX'].includes(pinName);
};

const getArduinoDigitalIndex = (pinName: string): number => {
  const mapped = ARDUINO_DIGITAL_PINS[pinName];
  if (mapped !== undefined) return mapped;
  if (!isNaN(parseInt(pinName))) return parseInt(pinName);
  return 0;
};

const getArduinoAnalogIndex = (pinName: string): number => {
  if (pinName.startsWith('A')) return parseInt(pinName.substring(1));
  const mapped = ARDUINO_ANALOG_PINS[pinName];
  return mapped !== undefined ? mapped : 0;
};

const getArduinoPinPosition = (
  pinName: string, width: number, depth: number, boardHeight: number
): THREE.Vector3 => {
  const pos = new THREE.Vector3(0, boardHeight / 2 + 5, 0);

  if (isDigitalPin(pinName)) {
    pos.z = -depth / 2 + 5;
    const totalPins = 16;
    const span = width * 0.7;
    const step = span / totalPins;
    pos.x = -width * 0.35 + getArduinoDigitalIndex(pinName) * step;
  } else {
    pos.z = depth / 2 - 8;
    const totalPins = 12;
    const span = width * 0.7;
    const step = span / totalPins;
    pos.x = -width * 0.35 + getArduinoAnalogIndex(pinName) * step;
  }

  return pos;
};

const getBreadboardPinPosition = (
  pinName: string, width: number, depth: number
): THREE.Vector3 => {
  const pos = new THREE.Vector3(0, 8.5, 0);
  const hash = pinName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  pos.x = (hash % 20 - 10) * (width / 25);
  pos.z = (hash % 5 - 2.5) * (depth / 10);
  return pos;
};

const getGenericPinPosition = (
  pinName: string, width: number, depth: number
): THREE.Vector3 => {
  const pos = new THREE.Vector3(0, 2, 0);
  const pinCount = 4;
  const hash = pinName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const side = hash % 2 === 0 ? 1 : -1;
  pos.z = (depth / 2) * side;
  pos.x = ((hash % pinCount) - pinCount / 2) * (width / pinCount);
  return pos;
};

const isArduino = (lowerName: string): boolean =>
  lowerName.includes('arduino') || lowerName.includes('uno') || lowerName.includes('mega');

const isBreadboard = (lowerName: string): boolean =>
  lowerName.includes('breadboard') || lowerName.includes('830');

export const getPinCoordinates = (
  type: string,
  name: string,
  pin: string,
  width: number,
  depth: number
): THREE.Vector3 => {
  const lowerName = (name || '').toLowerCase();
  const pinName = (pin || '').toUpperCase();

  if (isArduino(lowerName)) {
    return getArduinoPinPosition(pinName, width, depth, 2);
  }
  if (isBreadboard(lowerName)) {
    return getBreadboardPinPosition(pinName, width, depth);
  }
  return getGenericPinPosition(pinName, width, depth);
};

export interface PinWorldResolveContext {
  scale: number;
  offsetX: number;
  offsetZ: number;
  baseY?: number;
}

export const resolvePinWorldPosition = (
  component: ElectronicComponent | undefined,
  pinName: string,
  componentPosition: { x: number; y: number },
  context: PinWorldResolveContext
): THREE.Vector3 => {
  const endpoint = resolvePinEndpointWithFallback(component, pinName, componentPosition, 'bottom');
  const bounds = resolveComponentBounds(component);
  const pinYOffset = component
    ? getPinCoordinates(
      component.type || 'other',
      component.name || 'Unknown',
      pinName,
      bounds.width * context.scale,
      bounds.height * context.scale
    ).y
    : 2;

  return new THREE.Vector3(
    endpoint.x * context.scale + context.offsetX,
    (context.baseY ?? 3) + pinYOffset,
    endpoint.y * context.scale + context.offsetZ
  );
};
