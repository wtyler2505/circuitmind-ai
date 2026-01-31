import ipcData from '../assets/standards/ipc_dimensions.json';

export interface IPCPackage {
  body_width: number;
  body_length: number;
  height: number;
  pitch?: number;
  pin_count: number;
  pin_type: 'gullwing' | 'through-hole' | 'chip';
}

export interface BoardComponentMap {
  name: string;
  width: number;
  length: number;
  components: {
    type: string;
    name: string;
    x: number;
    z: number;
    rotation?: number;
    params?: any;
  }[];
}

const BOARD_MAPS: Record<string, BoardComponentMap> = {
  "ARDUINO-UNO-R3": {
    name: "Arduino Uno R3",
    width: 68.6,
    length: 53.3,
    components: [
      { type: 'MCU', name: 'ATmega328P', x: 15, z: 0, params: { type: 'DIP-28' } },
      { type: 'USB', name: 'USB-B', x: -28, z: 15, rotation: Math.PI / 2 },
      { type: 'DC', name: 'Barrel Jack', x: -28, z: -15, rotation: Math.PI / 2 },
      { type: 'HEADER', name: 'Digital', x: 10, z: 24, params: { count: 10, pitch: 2.54 } },
      { type: 'HEADER', name: 'Digital Low', x: -15, z: 24, params: { count: 8, pitch: 2.54 } },
      { type: 'HEADER', name: 'Analog', x: 15, z: -24, params: { count: 6, pitch: 2.54 } },
      { type: 'HEADER', name: 'Power', x: -10, z: -24, params: { count: 8, pitch: 2.54 } },
      { type: 'OSCILLATOR', name: '16MHz', x: -5, z: 5 },
      { type: 'BUTTON', name: 'Reset', x: -30, z: 22 },
    ]
  },
  "ESP32-WROOM-32": {
    name: "ESP32 DevKit V1",
    width: 28.0,
    length: 54.6,
    components: [
      { type: 'CHIP', name: 'ESP32-WROOM', x: 0, z: -15, params: { width: 18, length: 25.5, height: 3 } },
      { type: 'USB', name: 'Micro-USB', x: 0, z: 25, rotation: 0 },
      { type: 'HEADER', name: 'Left Pins', x: -12, z: 0, params: { count: 15, pitch: 2.54 } },
      { type: 'HEADER', name: 'Right Pins', x: 12, z: 0, params: { count: 15, pitch: 2.54 } },
      { type: 'BUTTON', name: 'EN', x: -8, z: 20 },
      { type: 'BUTTON', name: 'BOOT', x: 8, z: 20 },
    ]
  },
  "RASPBERRY-PI-PICO": {
    name: "Raspberry Pi Pico",
    width: 21.0,
    length: 51.0,
    components: [
      { type: 'CHIP', name: 'RP2040', x: 0, z: 0, params: { width: 7, length: 7, height: 1 } },
      { type: 'USB', name: 'Micro-USB', x: 0, z: -24, rotation: Math.PI },
      { type: 'HEADER', name: 'Left', x: -9, z: 0, params: { count: 20, pitch: 2.54 } },
      { type: 'HEADER', name: 'Right', x: 9, z: 0, params: { count: 20, pitch: 2.54 } },
      { type: 'BUTTON', name: 'BOOTSEL', x: 0, z: -15 },
    ]
  }
};

export const standardsService = {
  getPackage: (name: string): IPCPackage | null => {
    const packages = ipcData.packages as Record<string, IPCPackage>;
    
    // Exact match
    if (packages[name]) return packages[name];
    
    // Fuzzy match (e.g. "SOIC8" -> "SOIC-8")
    const normalized = name.toUpperCase().replace(/\s+/g, '-');
    if (packages[normalized]) return packages[normalized];
    
    // Check for substrings
    for (const key of Object.keys(packages)) {
      if (normalized.includes(key.toUpperCase())) return packages[key];
    }
    
    return null;
  },
  getBoardMap: (name: string): BoardComponentMap | null => {
    const normalized = name.toUpperCase().replace(/\s+/g, '-');
    if (BOARD_MAPS[normalized]) return BOARD_MAPS[normalized];
    for (const key of Object.keys(BOARD_MAPS)) {
      if (normalized.includes(key)) return BOARD_MAPS[key];
    }
    return null;
  }
};
