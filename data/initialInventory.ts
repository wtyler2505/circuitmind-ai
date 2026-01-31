import { ElectronicComponent } from '../types';

/**
 * INITIAL_INVENTORY (Manifest-First)
 * 
 * In the God-Tier FZPZ system, this file acts as a lightweight manifest.
 * Detailed metadata and SVGs are loaded asynchronously from the .fzpz files.
 */
export const INITIAL_INVENTORY: ElectronicComponent[] = [
  {
    id: 'Arduino_Uno_R3_1e4b2fa8',
    name: 'Arduino Uno R3',
    type: 'microcontroller',
    description: 'Standard Arduino Uno R3',
    fzpzUrl: '/parts/Arduino_Uno_R3.fzpz',
    quantity: 1
  },
  {
    id: 'ESP32_DevKit_V1_2a732320',
    name: 'ESP32 DevKit V1',
    type: 'microcontroller',
    description: 'ESP32 WiFi/Bluetooth MCU',
    fzpzUrl: '/parts/ESP32_DevKit_V1.fzpz',
    quantity: 1
  },
  {
    id: 'DHT11_4c1048e6',
    name: 'DHT11',
    type: 'sensor',
    description: 'Temperature & Humidity Sensor',
    fzpzUrl: '/parts/DHT11.fzpz',
    quantity: 1
  },
  {
    id: 'LED_5mm_Red_69d16d88',
    name: 'LED 5mm Red',
    type: 'actuator',
    description: 'Standard 5mm Red LED',
    fzpzUrl: '/parts/LED_5mm_Red.fzpz',
    quantity: 10
  },
  {
    id: 'Resistor_220_Ohm_6370fca2',
    name: 'Resistor 220 Ohm',
    type: 'other',
    description: '220 Ohm Resistor',
    fzpzUrl: '/parts/Resistor_220_Ohm.fzpz',
    quantity: 20
  },
  {
    id: 'Breadboard_Large_3e314f59',
    name: 'Breadboard Large',
    type: 'other',
    description: '830-point Solderless Breadboard',
    fzpzUrl: '/parts/Breadboard_Large.fzpz',
    quantity: 2
  }
];