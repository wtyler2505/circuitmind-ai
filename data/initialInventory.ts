import { ElectronicComponent } from '../types';

/**
 * INITIAL_INVENTORY (Manifest-First)
 * 
 * In the God-Tier FZPZ system, this file acts as a lightweight manifest.
 * Detailed metadata and SVGs are loaded asynchronously from the .fzpz files.
 */
export const INITIAL_INVENTORY: ElectronicComponent[] = [
  {
    id: 'Arduino_Uno_R3_a88cc83c',
    name: 'Arduino Uno R3',
    type: 'microcontroller',
    description: 'Standard Arduino Uno R3',
    fzpzUrl: '/parts/Arduino_Uno_R3.fzpz',
    quantity: 1,
    pins: [
      'NC', 'IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN',
      'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
      'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
      'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'GND', 'AREF', 'SDA', 'SCL'
    ]
  },
  {
    id: 'DHT11_28081550',
    name: 'DHT11',
    type: 'sensor',
    description: 'Temperature & Humidity Sensor',
    fzpzUrl: '/parts/DHT11.fzpz',
    quantity: 1,
    pins: ['VCC', 'DATA', 'NC', 'GND']
  },
  {
    id: 'LED_5mm_Red_f7efb7de',
    name: 'LED 5mm Red',
    type: 'actuator',
    description: 'Standard 5mm Red LED',
    fzpzUrl: '/parts/LED_5mm_Red.fzpz',
    quantity: 10,
    pins: ['anode', 'cathode']
  },
  {
    id: 'Resistor_220_Ohm_81020ded',
    name: 'Resistor 220 Ohm',
    type: 'other',
    description: '220 Ohm Resistor',
    fzpzUrl: '/parts/Resistor_220_Ohm.fzpz',
    quantity: 20,
    pins: ['pin1', 'pin2']
  }
];
