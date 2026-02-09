import * as THREE from 'three';

// ============================================================================
// WIRE COLOR MAPPING
// ============================================================================

const WIRE_PIN_COLORS: Record<string, number> = {
  'VCC': 0xdc2626,
  '5V': 0xdc2626,
  '3V3': 0xdc2626,
  'GND': 0x1f2937,
  'SDA': 0x2563eb,
  'SCL': 0x2563eb,
  'TX': 0x059669,
  'RX': 0xd97706,
};

export const getWireColor = (fromPin: string): number => {
  const pin = fromPin.toUpperCase();

  const exact = WIRE_PIN_COLORS[pin];
  if (exact !== undefined) return exact;

  if (pin.includes('PWR')) return 0xdc2626;
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
