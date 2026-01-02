import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import DiagramCanvas, { DiagramCanvasRef } from './components/DiagramCanvas';
import Inventory from './components/Inventory';
import ChatPanel from './components/ChatPanel';
import AssistantSidebar from './components/AssistantSidebar';

// Lazy load heavy modals
const ComponentEditorModal = lazy(() => import('./components/ComponentEditorModal'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
import {
  ElectronicComponent,
  WiringDiagram,
  EnhancedChatMessage,
  ActionIntent,
  AIContext,
  AIAutonomySettings,
  ACTION_SAFETY,
} from './types';
import {
  generateWiringDiagram,
  explainComponent,
  generateEditedImage,
  generateCircuitVideo,
  chatWithAI,
  chatWithContext,
  generateConceptImage,
  transcribeAudio,
  generateComponent3DCode,
  generateProactiveSuggestions,
} from './services/geminiService';
import { LiveSession } from './services/liveAudio';
import { useConversations } from './hooks/useConversations';
import { useAIActions } from './hooks/useAIActions';
import { buildAIContext } from './services/aiContextBuilder';

// Auto-generated from electronics_inventory_tier5.json - 63 components
const INITIAL_INVENTORY: ElectronicComponent[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    type: 'microcontroller',
    description:
      '5V Arduino microcontroller with ATmega328P, 14 digital I/O (6 PWM), 6 analog inputs. Most widely supported, beginner-friendly.',
    pins: [
      'SDA',
      'SCL',
      'MOSI',
      'MISO',
      'SCK',
      'SS',
      'TX',
      'RX',
      'VCC',
      'GND',
      'D0',
      'D1',
      'D2',
      'D3',
      'D4',
      'D5',
      'D6',
      'D7',
      'D8',
      'D9',
      'D10',
      'D11',
      'D12',
      'D13',
      'A0',
      'A1',
      'A2',
      'A3',
      'A4',
      'A5',
    ],
    quantity: 2,
    datasheetUrl: 'https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf',
    imageUrl: 'https://store.arduino.cc/cdn/shop/products/A000066_03.front_934x700.jpg',
  },
  {
    id: '2',
    name: 'Arduino Mega 2560 R3',
    type: 'microcontroller',
    description:
      '5V Arduino with ATmega2560, 54 digital I/O (15 PWM), 16 analog inputs, 4 hardware serial ports.',
    pins: [
      'SDA',
      'SCL',
      'MOSI',
      'MISO',
      'SCK',
      'SS',
      'VCC',
      'GND',
      'D0',
      'D1',
      'D2',
      'D3',
      'D4',
      'D5',
      'D6',
      'D7',
      'D8',
      'D9',
      'D10',
      'D11',
      'D12',
      'D13',
      'A0',
      'A1',
      'A2',
      'A3',
      'A4',
      'A5',
      'A6',
      'A7',
      'A8',
      'A9',
      'A10',
      'A11',
      'A12',
      'A13',
      'A14',
      'A15',
    ],
    quantity: 1,
    datasheetUrl: 'https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf',
    imageUrl: 'https://store.arduino.cc/cdn/shop/products/A000067_03.front_934x700.jpg',
  },
  {
    id: '3',
    name: 'ESP32 DevKit 38-Pin',
    type: 'microcontroller',
    description:
      '3.3V dual-core WiFi+Bluetooth MCU. NOT 5V tolerant - requires level shifter for 5V sensors.',
    pins: ['SDA', 'SCL', 'MOSI', 'MISO', 'SCK', 'SS', 'VCC', 'GND'],
    quantity: 1,
    datasheetUrl:
      'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf',
    imageUrl:
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitc-functional-overview.jpg',
  },
  {
    id: '4',
    name: 'NodeMCU ESP8266 Amica V2',
    type: 'microcontroller',
    description: '3.3V WiFi MCU, breadboard-friendly. NOT 5V tolerant. Safe pins: D1/D2/D5/D6/D7.',
    pins: ['SDA', 'SCL', 'MOSI', 'MISO', 'SCK', 'SS', 'VCC', 'GND'],
    quantity: 2,
    datasheetUrl:
      'https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0672/9409/products/NodeMCU_ESP8266_Board_1024x1024.jpg',
  },
  {
    id: '5',
    name: 'SparkFun Blynk Board',
    type: 'microcontroller',
    description:
      'ESP8266 board with pre-loaded Blynk firmware, onboard WS2812 RGB LED and 10K thermistor.',
    pins: ['VCC', 'GND'],
    quantity: 2,
    datasheetUrl:
      'https://cdn.sparkfun.com/assets/learn_tutorials/4/9/4/Blynk_Board_Graphical_Datasheet_v01.png',
    imageUrl: 'https://cdn.sparkfun.com/assets/parts/1/1/2/4/5/13794-01.jpg',
  },
  {
    id: '6',
    name: 'DCCduino Nano',
    type: 'microcontroller',
    description:
      'Arduino Nano clone with CH340G USB chip. Requires CH340 driver. 5V logic, breadboard-friendly.',
    pins: [
      'VCC',
      'GND',
      'D0',
      'D1',
      'D2',
      'D3',
      'D4',
      'D5',
      'D6',
      'D7',
      'D8',
      'D9',
      'D10',
      'D11',
      'D12',
      'D13',
      'A0',
      'A1',
      'A2',
      'A3',
      'A4',
      'A5',
      'A6',
      'A7',
    ],
    quantity: 1,
    datasheetUrl: 'https://docs.arduino.cc/resources/datasheets/A000005-datasheet.pdf',
    imageUrl: 'https://www.electronicshub.org/wp-content/uploads/2021/01/Arduino-Nano-Pinout-1.jpg',
  },
  {
    id: '7',
    name: 'HC-SR04 Ultrasonic Sensor',
    type: 'sensor',
    description:
      '5V ultrasonic distance sensor, 2-400cm range. Requires 2 digital pins (Trig output, Echo input).',
    pins: ['VCC', 'GND', 'TRIG', 'ECHO'],
    quantity: 2,
    datasheetUrl: 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf',
    imageUrl: 'https://cdn.sparkfun.com/assets/parts/6/4/6/4/11308-01.jpg',
  },
  {
    id: '8',
    name: 'HC-SR501 PIR Motion Sensor',
    type: 'sensor',
    description:
      'PIR motion sensor, 3-7m adjustable range. Output is 3.3V safe. Requires 60s warmup.',
    pins: ['VCC', 'GND', 'OUT'],
    quantity: 1,
    datasheetUrl: 'https://www.mpja.com/download/31227sc.pdf',
    imageUrl:
      'https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR501-PIR-Motion-Sensor-Module.jpg',
  },
  {
    id: '9',
    name: 'DHT11 Temperature & Humidity',
    type: 'sensor',
    description:
      'Temperature (0-50°C ±2°C) and humidity (20-90% ±5%) sensor. Single-wire protocol.',
    pins: ['VCC', 'GND', 'DATA'],
    quantity: 1,
    datasheetUrl: 'https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-1143054.pdf',
    imageUrl: 'https://components101.com/sites/default/files/components/DHT11-Module.jpg',
  },
  {
    id: '10',
    name: 'GY-521 MPU6050 6-DOF IMU',
    type: 'sensor',
    description: '6-axis IMU (3-axis accel + 3-axis gyro) on I2C bus. Address 0x68 or 0x69.',
    pins: ['VCC', 'GND', 'SDA', 'SCL'],
    quantity: 1,
    datasheetUrl: 'https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf',
    imageUrl: 'https://components101.com/sites/default/files/components/GY-521-MPU6050-Module.jpg',
  },
  {
    id: '11',
    name: 'DS3231 RTC Module',
    type: 'sensor',
    description: 'Precision RTC (±2ppm) with I2C at 0x68. Includes 4KB EEPROM and CR2032 backup.',
    pins: ['VCC', 'GND', 'SDA', 'SCL'],
    quantity: 1,
    datasheetUrl: 'https://datasheets.maximintegrated.com/en/ds/DS3231.pdf',
    imageUrl: 'https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module.jpg',
  },
  {
    id: '12',
    name: 'RC522 RFID Module',
    type: 'sensor',
    description: '13.56MHz RFID reader on SPI bus. 3.3V ONLY - will be damaged by 5V!',
    pins: ['VCC', 'GND', 'MOSI', 'MISO', 'SCK', 'SS', 'RST'],
    quantity: 1,
    datasheetUrl: 'https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf',
    imageUrl: 'https://components101.com/sites/default/files/components/RFID-Reader-Module.jpg',
  },
  {
    id: '13',
    name: 'KY-023 Joystick Module',
    type: 'sensor',
    description: 'Dual-axis analog joystick with center button. Uses 2 analog pins + 1 digital.',
    pins: ['VCC', 'GND', 'VRX', 'VRY', 'SW'],
    quantity: 2,
    imageUrl: 'https://components101.com/sites/default/files/components/KY023-Joystick-Module.jpg',
  },
  {
    id: '14',
    name: 'KY-040 Rotary Encoder',
    type: 'sensor',
    description: '20-detent rotary encoder with quadrature output and push button.',
    pins: ['VCC', 'GND', 'CLK', 'DT', 'SW'],
    quantity: 1,
    imageUrl: 'https://components101.com/sites/default/files/components/KY040-Rotary-Encoder.jpg',
  },
  {
    id: '15',
    name: 'Photoresistor (LDR)',
    type: 'sensor',
    description: 'Light sensor using voltage divider. Use 10K resistor to GND.',
    pins: ['VCC', 'GND', 'SIG'],
    quantity: 5,
    imageUrl: 'https://components101.com/sites/default/files/components/LDR.jpg',
  },
  {
    id: '16',
    name: 'Soil Moisture Sensor',
    type: 'sensor',
    description: 'Capacitive soil sensor. A0 gives analog reading (lower = wetter).',
    pins: ['VCC', 'GND', 'A0'],
    quantity: 1,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/Soil-Moisture-Sensor-Pinout.png',
  },
  {
    id: '17',
    name: 'Flame Sensor Module',
    type: 'sensor',
    description: 'IR flame sensor. D0 for threshold detection, A0 for intensity.',
    pins: ['VCC', 'GND', 'D0', 'A0'],
    quantity: 1,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/Flame-Sensor-Module-Pinout.png',
  },
  {
    id: '18',
    name: 'Water Level Sensor',
    type: 'sensor',
    description: 'Conductive water level sensor. Power intermittently to reduce electrolysis.',
    pins: ['VCC', 'GND', 'SIG'],
    quantity: 1,
  },
  {
    id: '19',
    name: 'KY-038 Sound Sensor',
    type: 'sensor',
    description: 'Sound detection module. A0 for analog level, D0 for threshold detection.',
    pins: ['VCC', 'GND', 'A0', 'D0'],
    quantity: 1,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/KY-038-Sound-Sensor-Module.jpg',
  },
  {
    id: '20',
    name: 'IR Obstacle Avoidance Sensor',
    type: 'sensor',
    description: 'IR proximity sensor. Output LOW when obstacle in range. 2-30cm range.',
    pins: ['VCC', 'GND', 'OUT'],
    quantity: 2,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/IR-Sensor-Module-Pinout.jpg',
  },
  {
    id: '21',
    name: 'SW-520D Tilt Switch',
    type: 'sensor',
    description: 'Ball-type tilt switch. Use INPUT_PULLUP, reads LOW when tilted.',
    pins: ['VCC', 'GND'],
    quantity: 3,
  },
  {
    id: '22',
    name: 'SG90 Micro Servo',
    type: 'actuator',
    description: '180° micro servo, 9g. PWM control. Brown=GND, Red=VCC, Orange=Signal.',
    pins: ['VCC', 'GND', 'PWM'],
    quantity: 1,
    datasheetUrl: 'http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf',
    imageUrl: 'https://components101.com/sites/default/files/components/Servo-Motor-SG90.jpg',
  },
  {
    id: '23',
    name: '28BYJ-48 Stepper + ULN2003',
    type: 'actuator',
    description: '5V geared stepper, 4096 steps/rev. Requires 4 digital pins + driver.',
    pins: ['VCC', 'GND', 'IN1', 'IN2', 'IN3', 'IN4'],
    quantity: 1,
    datasheetUrl:
      'https://components101.com/sites/default/files/component_datasheet/28byj48-stepper-motor-datasheet.pdf',
    imageUrl:
      'https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-With-ULN2003-Driver.jpg',
  },
  {
    id: '24',
    name: 'L293D Motor Driver IC',
    type: 'actuator',
    description: 'Dual H-bridge motor driver IC. 600mA/channel. Gets hot - add heatsink.',
    pins: ['VCC', 'GND', 'EN1', 'IN1', 'IN2', 'OUT1', 'OUT2', 'EN2', 'IN3', 'IN4', 'OUT3', 'OUT4'],
    quantity: 4,
    datasheetUrl: 'https://www.ti.com/lit/ds/symlink/l293d.pdf',
    imageUrl: 'https://components101.com/sites/default/files/component_pin/L293D-Pinout.gif',
  },
  {
    id: '25',
    name: '5V Relay Module',
    type: 'actuator',
    description: '5V relay with optocoupler isolation. Active LOW trigger. COM/NO/NC terminals.',
    pins: ['VCC', 'GND', 'IN', 'COM', 'NO', 'NC'],
    quantity: 1,
    imageUrl: 'https://components101.com/sites/default/files/components/5V-Relay-Module.jpg',
  },
  {
    id: '26',
    name: 'LCD 1602 Module',
    type: 'other',
    description: '16x2 character LCD. I2C backpack needs only SDA/SCL. Adjust contrast pot.',
    pins: ['VCC', 'GND', 'SDA', 'SCL'],
    quantity: 2,
    datasheetUrl: 'https://www.sparkfun.com/datasheets/LCD/HD44780.pdf',
    imageUrl: 'https://components101.com/sites/default/files/components/16x2-LCD-Module.jpg',
  },
  {
    id: '27',
    name: 'MAX7219 8x8 LED Matrix',
    type: 'other',
    description: '8x8 LED matrix with MAX7219 driver. SPI interface, cascadable.',
    pins: ['VCC', 'GND', 'DIN', 'CS', 'CLK'],
    quantity: 1,
    datasheetUrl: 'https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf',
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/MAX7219-LED-Dot-Matrix.jpg',
  },
  {
    id: '28',
    name: 'HW-221 Logic Level Converter',
    type: 'other',
    description: '4-channel bidirectional level shifter. LV=3.3V, HV=5V, share GND.',
    pins: ['LV', 'HV', 'GND', 'LV1', 'LV2', 'LV3', 'LV4', 'HV1', 'HV2', 'HV3', 'HV4'],
    quantity: 2,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/Logic-Level-Converter-Pinout.png',
  },
  {
    id: '29',
    name: '74HC595 Shift Register',
    type: 'other',
    description: '8-bit serial-to-parallel shift register. Expands 3 pins to 8 outputs.',
    pins: ['VCC', 'GND', 'DS', 'SHCP', 'STCP', 'Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
    quantity: 1,
    datasheetUrl: 'https://www.ti.com/lit/ds/symlink/sn74hc595.pdf',
    imageUrl: 'https://components101.com/sites/default/files/component_pin/74HC595-Pinout.png',
  },
  {
    id: '30',
    name: 'MB102 Breadboard Power Supply',
    type: 'power',
    description: 'Breadboard power module with 3.3V/5V rails. Input: 6.5-12V or USB.',
    pins: ['VIN', 'GND', '3V3', '5V'],
    quantity: 2,
    imageUrl:
      'https://components101.com/sites/default/files/components/Breadboard-Power-Supply-Module.jpg',
  },
  {
    id: '31',
    name: '830-Point Breadboard',
    type: 'other',
    description: 'Standard 830-point breadboard. 4 power rails. Check rail continuity.',
    pins: [],
    quantity: 2,
    imageUrl: 'https://components101.com/sites/default/files/components/Breadboard.jpg',
  },
  {
    id: '32',
    name: '400-Point Mini Breadboard',
    type: 'other',
    description: 'Half-size 400-point breadboard for small circuits.',
    pins: [],
    quantity: 2,
    imageUrl: 'https://components101.com/sites/default/files/components/mini-breadboard.jpg',
  },
  {
    id: '33',
    name: 'Jumper Wire Assortment',
    type: 'other',
    description: 'M-M, M-F, and F-F jumper wires for prototyping.',
    pins: [],
    quantity: 1,
  },
  {
    id: '34',
    name: '9V Battery Barrel Jack Adapter',
    type: 'power',
    description: '9V battery clip with 2.1mm barrel plug. Center positive.',
    pins: ['VCC', 'GND'],
    quantity: 1,
  },
  {
    id: '35',
    name: 'L293D Motor Shield',
    type: 'other',
    description: 'Arduino motor shield. Drives 4 DC motors OR 2 steppers + 2 servos.',
    pins: [],
    quantity: 1,
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/L293D-Motor-Driver-Shield.png',
  },
  {
    id: '36',
    name: 'CNC Shield V3 (GRBL)',
    type: 'other',
    description: 'GRBL CNC shield for 3-4 axis control. Accepts A4988/DRV8825 drivers.',
    pins: [],
    quantity: 1,
    imageUrl:
      'https://blog.protoneer.co.nz/wp-content/uploads/2013/07/Arduino-CNC-Shield-V3.0-Parts.jpg',
  },
  {
    id: '37',
    name: 'Arduino Prototyping Shield',
    type: 'other',
    description: 'Proto shield with breadboard area for custom circuits.',
    pins: [],
    quantity: 1,
  },
  {
    id: '38',
    name: 'Screw Terminal Shield',
    type: 'other',
    description: 'Breaks out all Arduino Uno pins to screw terminals.',
    pins: [],
    quantity: 1,
  },
  {
    id: '39',
    name: '2.8" TFT LCD Shield (ILI9341)',
    type: 'other',
    description: '2.8" 240x320 color TFT. SPI interface. Touch + SD card optional.',
    pins: ['VCC', 'GND', 'CS', 'RST', 'DC', 'MOSI', 'SCK', 'LED', 'MISO'],
    quantity: 1,
    datasheetUrl: 'https://cdn-shop.adafruit.com/datasheets/ILI9341.pdf',
    imageUrl: 'https://cdn-shop.adafruit.com/970x728/1770-00.jpg',
  },
  {
    id: '40',
    name: 'Piezo Buzzer',
    type: 'other',
    description: 'Passive piezo buzzer. Use tone(pin, frequency) to play sounds.',
    pins: ['VCC', 'GND'],
    quantity: 3,
    imageUrl: 'https://components101.com/sites/default/files/components/Piezo-Buzzer.jpg',
  },
  {
    id: '41',
    name: '8Ω Mini Speaker',
    type: 'other',
    description: '8Ω 0.5W speaker. Requires amplifier - do NOT connect directly to MCU.',
    pins: ['VCC', 'GND'],
    quantity: 1,
  },
  {
    id: '42',
    name: 'TIP120 Darlington Transistor',
    type: 'other',
    description: 'NPN Darlington, 5A/60V. ALWAYS use flyback diode with motors.',
    pins: ['B', 'C', 'E'],
    quantity: 4,
    datasheetUrl: 'https://www.onsemi.com/pdf/datasheet/tip120-d.pdf',
    imageUrl: 'https://components101.com/sites/default/files/component_pin/TIP120-Pinout.png',
  },
  {
    id: '43',
    name: '2N2222 NPN Transistor',
    type: 'other',
    description: 'General purpose NPN transistor. TO-92 pinout: E-B-C.',
    pins: ['E', 'B', 'C'],
    quantity: 10,
    datasheetUrl: 'https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf',
  },
  {
    id: '44',
    name: 'IRF520 MOSFET Module',
    type: 'other',
    description: 'MOSFET module for PWM control of high-current loads up to 9A.',
    pins: ['VCC', 'GND', 'SIG'],
    quantity: 2,
    datasheetUrl: 'https://www.vishay.com/docs/91017/91017.pdf',
    imageUrl:
      'https://components101.com/sites/default/files/component_pin/IRF520-MOSFET-Driver-Module.jpg',
  },
  {
    id: '45',
    name: 'Electrolytic Capacitor Assortment',
    type: 'other',
    description: 'Electrolytic caps 1-470uF. POLARIZED - long leg is positive.',
    pins: [],
    quantity: 1,
  },
  {
    id: '46',
    name: 'Ceramic Capacitor Assortment',
    type: 'other',
    description: 'Ceramic caps. Non-polarized. 100nF most useful for decoupling.',
    pins: [],
    quantity: 1,
  },
  {
    id: '47',
    name: '5mm LED Assortment',
    type: 'other',
    description: '5mm LEDs. Long leg = positive. Use 150Ω for red/yellow/green at 5V.',
    pins: ['ANODE', 'CATHODE'],
    quantity: 1,
  },
  {
    id: '48',
    name: 'WS2812B LED Strip (60 LEDs/m)',
    type: 'other',
    description: 'Addressable RGB strip. 5V, 60mA per LED. Use FastLED library.',
    pins: ['VCC', 'GND', 'DIN'],
    quantity: 1,
    datasheetUrl: 'https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf',
  },
  {
    id: '49',
    name: 'RGB LED (Common Cathode)',
    type: 'other',
    description: '4-pin RGB LED. Longest leg = common cathode (GND). PWM each color.',
    pins: ['R', 'GND', 'G', 'B'],
    quantity: 5,
  },
  {
    id: '50',
    name: 'Resistor Assortment Kit',
    type: 'other',
    description: '1/4W resistor kit. Most used: 220Ω, 1K-10K, 4.7K.',
    pins: [],
    quantity: 1,
  },
  {
    id: '51',
    name: '10K Potentiometer',
    type: 'other',
    description: '10K linear pot. Outer pins to GND/VCC, wiper to analog pin.',
    pins: ['VCC', 'GND', 'SIG'],
    quantity: 5,
  },
  {
    id: '52',
    name: 'Tactile Pushbutton Assortment',
    type: 'other',
    description: 'Tactile buttons. Use INPUT_PULLUP, connect other side to GND.',
    pins: ['1', '2'],
    quantity: 1,
  },
  {
    id: '53',
    name: 'Header Pin Assortment',
    type: 'other',
    description: '2.54mm pitch headers. Break to length needed.',
    pins: [],
    quantity: 1,
  },
  {
    id: '54',
    name: 'Dupont Jumper Wires',
    type: 'other',
    description: 'Dupont jumper kit. M-M, M-F, F-F connectors.',
    pins: [],
    quantity: 1,
  },
  {
    id: '55',
    name: 'USB Cable Set',
    type: 'other',
    description: 'USB cables for programming. USB-B, Mini-USB, Micro-USB.',
    pins: [],
    quantity: 1,
  },
  {
    id: '56',
    name: 'DC Barrel Jack Connectors',
    type: 'other',
    description: '2.1mm barrel jacks. Center positive standard.',
    pins: ['VCC', 'GND'],
    quantity: 10,
  },
  {
    id: '57',
    name: 'Heat Shrink Tubing Assortment',
    type: 'other',
    description: 'Heat shrink tubing for insulating solder joints.',
    pins: [],
    quantity: 1,
  },
  {
    id: '58',
    name: 'M3 Standoff/Spacer Kit',
    type: 'other',
    description: 'M3 standoffs for mounting Arduino/PCBs.',
    pins: [],
    quantity: 1,
  },
  {
    id: '59',
    name: 'Prototype PCB Assortment',
    type: 'other',
    description: 'Perfboard PCBs for permanent projects. 2.54mm pitch.',
    pins: [],
    quantity: 1,
  },
  {
    id: '60',
    name: 'PCB Screw Terminal Blocks',
    type: 'other',
    description: 'Screw terminals for power and motor connections.',
    pins: [],
    quantity: 20,
  },
  {
    id: '61',
    name: 'Alligator Clip Test Leads',
    type: 'other',
    description: 'Alligator clips for temporary connections and testing.',
    pins: [],
    quantity: 10,
  },
  {
    id: '62',
    name: 'Multimeter Test Probes',
    type: 'other',
    description: 'Replacement/upgrade multimeter probes.',
    pins: [],
    quantity: 1,
  },
];

export default function App() {
  // Persistence: Inventory
  const [inventory, setInventory] = useState<ElectronicComponent[]>(() => {
    try {
      const saved = localStorage.getItem('cm_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Failed to load inventory');
      return INITIAL_INVENTORY;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Undo/Redo State & Persistence: Diagram
  const [history, setHistory] = useState<{
    past: WiringDiagram[];
    present: WiringDiagram | null;
    future: WiringDiagram[];
  }>(() => {
    let savedPresent = null;
    try {
      const saved = localStorage.getItem('cm_autosave');
      if (saved) savedPresent = JSON.parse(saved);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : 'Failed to load diagram');
    }
    return {
      past: [],
      present: savedPresent,
      future: [],
    };
  });

  // Auto-save Diagram
  useEffect(() => {
    if (history.present) {
      localStorage.setItem('cm_autosave', JSON.stringify(history.present));
    }
  }, [history.present]);

  const [isLoading, setIsLoading] = useState(false);
  const [_loadingText, setLoadingText] = useState('Processing...'); // Text used in _stopRecording
  const [isInventoryOpen, setIsInventoryOpen] = useState(() => {
    try {
      return localStorage.getItem('cm_inventory_open_default') === 'true';
    } catch {
      return false;
    }
  });
  const [inventoryPinnedDefault, setInventoryPinnedDefault] = useState(() => {
    try {
      return localStorage.getItem('cm_inventory_pinned_default') === 'true';
    } catch {
      return false;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [modalContent, setModalContent] = useState<string>('');

  // 3D Gen State
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [_generate3DError, setGenerate3DError] = useState<string | null>(null); // Value unused but setter used - TODO: Display 3D gen errors in UI

  // New State for Mode and Configuration
  const [generationMode, setGenerationMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [imageSize, _setImageSize] = useState<'1K' | '2K' | '4K'>('1K'); // Setter unused - TODO: Add image size selector to UI
  const [aspectRatio, _setAspectRatio] = useState<string>('16:9'); // Setter unused - TODO: Add aspect ratio selector to UI

  // Feature Toggles
  const [useDeepThinking, setUseDeepThinking] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup MediaRecorder stream on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        // Stop recording if active
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        // Stop all tracks to release the microphone
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  // Voice Mode State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState('disconnected');
  const liveSessionRef = useRef<LiveSession | null>(null);

  // Canvas ref for AI control
  const canvasRef = useRef<DiagramCanvasRef>(null);

  // Conversation management with persistent storage
  const conversationManager = useConversations();

  // AI context state
  const [aiContext, setAIContext] = useState<AIContext | null>(null);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);
  const inventoryDefaultWidth = 360;
  const assistantDefaultWidth = 380;
  const inventoryWidthRange = { min: 280, max: 520 };
  const assistantWidthRange = { min: 300, max: 560 };
  const clampWidth = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const [isAssistantOpen, setIsAssistantOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('cm_assistant_open_default');
      return stored ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isAssistantPinned, setIsAssistantPinned] = useState(() => {
    try {
      const stored = localStorage.getItem('cm_assistant_pinned_default');
      return stored ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [inventoryWidth, setInventoryWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_inventory_width');
      const parsed = saved ? Number.parseInt(saved, 10) : inventoryDefaultWidth;
      if (!Number.isFinite(parsed)) return inventoryDefaultWidth;
      return clampWidth(parsed, inventoryWidthRange.min, inventoryWidthRange.max);
    } catch {
      return inventoryDefaultWidth;
    }
  });
  const [assistantWidth, setAssistantWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_assistant_width');
      const parsed = saved ? Number.parseInt(saved, 10) : assistantDefaultWidth;
      if (!Number.isFinite(parsed)) return assistantDefaultWidth;
      return clampWidth(parsed, assistantWidthRange.min, assistantWidthRange.max);
    } catch {
      return assistantDefaultWidth;
    }
  });

  // AI autonomy settings with localStorage persistence
  const [autonomySettings, setAutonomySettings] = useState<AIAutonomySettings>(() => {
    try {
      const saved = localStorage.getItem('cm_autonomy_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load autonomy settings:', e);
    }
    return {
      autoExecuteSafeActions: true,
      customSafeActions: [],
      customUnsafeActions: [],
    };
  });

  // Persist autonomy settings
  useEffect(() => {
    try {
      localStorage.setItem('cm_autonomy_settings', JSON.stringify(autonomySettings));
    } catch (e) {
      console.error('Failed to save autonomy settings:', e);
    }
  }, [autonomySettings]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_inventory_open_default', String(isInventoryOpen));
    } catch (e) {
      console.error('Failed to save inventory open default:', e);
    }
  }, [isInventoryOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_inventory_pinned_default', String(inventoryPinnedDefault));
    } catch (e) {
      console.error('Failed to save inventory pinned default:', e);
    }
  }, [inventoryPinnedDefault]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_assistant_open_default', String(isAssistantOpen));
    } catch (e) {
      console.error('Failed to save assistant open default:', e);
    }
  }, [isAssistantOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_assistant_pinned_default', String(isAssistantPinned));
    } catch (e) {
      console.error('Failed to save assistant pinned default:', e);
    }
  }, [isAssistantPinned]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_inventory_width', String(inventoryWidth));
    } catch (e) {
      console.error('Failed to save inventory width:', e);
    }
  }, [inventoryWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_assistant_width', String(assistantWidth));
    } catch (e) {
      console.error('Failed to save assistant width:', e);
    }
  }, [assistantWidth]);

  // Update AI context when state changes
  useEffect(() => {
    const updateContext = async () => {
      const context = await buildAIContext({
        diagram: history.present,
        inventory,
        selectedComponentId: selectedComponent?.id,
        activeView: selectedComponent
          ? 'component-editor'
          : isInventoryOpen
            ? 'inventory'
            : isSettingsOpen
              ? 'settings'
              : 'canvas',
      });
      setAIContext(context);
    };
    updateContext();
  }, [history.present, inventory, selectedComponent, isInventoryOpen, isSettingsOpen]);

  // Generate proactive suggestions periodically
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!aiContext || !history.present) return;
      try {
        const suggestions = await generateProactiveSuggestions(
          aiContext,
          history.present.components,
          history.present.connections
        );
        setProactiveSuggestions(suggestions);
      } catch {
        // Ignore errors
      }
    };

    // Generate suggestions after diagram changes
    const timeout = setTimeout(generateSuggestions, 2000);
    return () => clearTimeout(timeout);
  }, [aiContext, history.present]);

  // Clean up live session on unmount
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  const toggleLiveMode = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.disconnect();
      setIsLiveActive(false);
    } else {
      setIsLiveActive(true);
      liveSessionRef.current = new LiveSession((status) => {
        setLiveStatus(status);
        if (status === 'disconnected' || status === 'error') {
          setIsLiveActive(false);
        }
      });
      await liveSessionRef.current.connect();
    }
  };

  const updateDiagram = useCallback((newDiagram: WiringDiagram | null) => {
    setHistory((curr) => {
      if (curr.present === newDiagram) return curr;
      return {
        past: curr.present ? [...curr.past, curr.present] : curr.past,
        present: newDiagram,
        future: [],
      };
    });
  }, []);

  // AI actions system - must be after updateDiagram definition
  const aiActions = useAIActions({
    canvasRef,
    inventory,
    diagram: history.present,
    setInventory,
    setIsInventoryOpen,
    setIsSettingsOpen,
    setSelectedComponent,
    setGenerationMode,
    updateDiagram,
    activeConversationId: conversationManager.activeConversationId,
  });

  const handleDiagramChange = (updatedDiagram: WiringDiagram) => {
    updateDiagram(updatedDiagram);
  };

  const handleUndo = () => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: curr.present ? [curr.present, ...curr.future] : curr.future,
      };
    });
  };

  const handleRedo = () => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: curr.present ? [...curr.past, curr.present] : curr.past,
        present: next,
        future: newFuture,
      };
    });
  };

  // Drag and Drop Logic: Inventory -> Canvas
  const handleComponentDrop = (component: ElectronicComponent, _x: number, _y: number) => {
    // 1. Create a unique copy for the diagram
    const newInstance: ElectronicComponent = {
      ...component,
      id: `${component.id}-${Date.now()}`, // Ensure unique ID in diagram
    };

    // 2. Initialize diagram if empty, or append
    const currentDiagram = history.present || {
      title: 'Untitled Circuit',
      components: [],
      connections: [],
      explanation: 'Start connecting components!',
    };

    const newDiagram = {
      ...currentDiagram,
      components: [...currentDiagram.components, newInstance],
    };

    updateDiagram(newDiagram);
  };

  // TODO: Implement file attachment feature - requires adding attachment state
  const _handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        // TODO: Add attachment state: const [attachment, setAttachment] = useState<{data: string, type: string} | null>(null);
        console.log('File attachment not implemented:', { type, size: file.size });
        if (generationMode !== 'image' && generationMode !== 'video') {
          setGenerationMode('chat');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // TODO: Implement voice input feature - requires adding input state prop
  const _startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(message);
      alert('Could not access microphone.');
    }
  };

  const _stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsRecording(false);
        setLoadingText('Transcribing...');
        setIsLoading(true);

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const transcription = await transcribeAudio(base64Audio);
            // TODO: Add input state prop to pass transcription to ChatPanel
            console.log('Transcription:', transcription);
            setIsLoading(false);
          };
        } catch (_e: unknown) {
          console.error('Transcription failed');
          setIsLoading(false);
        }
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.stop();
    }
  };

  const saveDiagram = () => {
    if (!history.present) return;
    const data = {
      diagram: history.present,
      timestamp: Date.now(),
    };
    // Manual save still uses the 'savedDiagram' key as a "Quick Save" slot
    localStorage.setItem('savedDiagram', JSON.stringify(data));
    conversationManager.addMessage({
      role: 'system',
      content: '✅ Diagram saved to Quick Save slot.',
      linkedComponents: [],
      suggestedActions: [],
    });
  };

  const loadDiagram = () => {
    const saved = localStorage.getItem('savedDiagram');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.diagram) {
          updateDiagram(parsed.diagram);
          conversationManager.addMessage({
            role: 'system',
            content: `✅ Loaded diagram from ${new Date(parsed.timestamp).toLocaleTimeString()}`,
            linkedComponents: [],
            suggestedActions: [],
          });
        }
      } catch (e) {
        console.error('Failed to load', e);
      }
    }
  };

  const handleComponentClick = async (component: ElectronicComponent) => {
    setSelectedComponent(component);
    const explain = await explainComponent(component.name);
    setModalContent(explain);
  };

  const handleGenerate3D = async () => {
    if (!selectedComponent) return;
    setIsGenerating3D(true);
    setGenerate3DError(null);
    try {
      // Fix: Passed selectedComponent.type as 2nd argument
      const code = await generateComponent3DCode(selectedComponent.name, selectedComponent.type);
      const updated = { ...selectedComponent, threeCode: code };
      setSelectedComponent(updated);
      setInventory((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e: unknown) {
      setGenerate3DError(e instanceof Error ? e.message : '3D generation failed');
    } finally {
      setIsGenerating3D(false);
    }
  };

  // Handle sending messages through the enhanced chat system
  const handleSendEnhancedMessage = async (
    content: string,
    attachment?: { base64: string; type: 'image' | 'video' }
  ) => {
    if ((!content.trim() && !attachment) || isLoading) return;

    // Normalize attachment format
    const attachmentData = attachment?.base64;

    // Create user message for conversation
    const userEnhancedMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
      role: 'user',
      content,
      linkedComponents: [],
      suggestedActions: [],
      image: attachment?.type === 'image' ? attachmentData : undefined,
      video: attachment?.type === 'video' ? attachmentData : undefined,
    };

    // Add to conversation
    const sentUserMessage = await conversationManager.addMessage(userEnhancedMsg);

    setIsLoading(true);
    setLoadingText('Thinking...');

    try {
      const conversationMessages = conversationManager.messages.filter(
        (msg) => msg.conversationId === sentUserMessage.conversationId
      );
      const historyMessages = conversationMessages.some((msg) => msg.id === sentUserMessage.id)
        ? conversationMessages
        : [...conversationMessages, sentUserMessage];
      const chatHistory = historyMessages
        .filter((msg) => msg.role === 'user' || msg.role === 'model')
        .map((msg) => ({
          role: msg.role as 'user' | 'model',
          parts: [{ text: msg.content }],
        }));

      // Handle based on generation mode
      if (generationMode === 'image') {
        setLoadingText('Generating Image...');
        let imgData = '';
        if (attachment?.type === 'image' && attachmentData) {
          imgData = await generateEditedImage(attachmentData, content);
        } else {
          imgData = await generateConceptImage(content, imageSize, aspectRatio);
        }

        const modelMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
          role: 'model',
          content: `Generated image for "${content}"`,
          linkedComponents: [],
          suggestedActions: [],
          image: imgData,
        };
        await conversationManager.addMessage(modelMsg);
      } else if (generationMode === 'video') {
        setLoadingText('Generating Video...');
        const videoAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
        const videoUrl = await generateCircuitVideo(content, videoAspect, attachmentData);

        const modelMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
          role: 'model',
          content: `Video generated for "${content}"`,
          linkedComponents: [],
          suggestedActions: [],
          video: videoUrl,
        };
        await conversationManager.addMessage(modelMsg);
      } else {
        // Chat mode - use context-aware chat if context available
        const isDiagramRequest =
          content.toLowerCase().includes('diagram') || content.toLowerCase().includes('circuit');

        if (isDiagramRequest) {
          setLoadingText('Designing Circuit...');
          const diagram = await generateWiringDiagram(content, inventory);
          updateDiagram(diagram);

          const modelMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
            role: 'model',
            content: `Here is the wiring diagram for: ${diagram.title}.`,
            linkedComponents: diagram.components.map((c) => ({
              componentId: c.id,
              componentName: c.name,
              mentionStart: 0,
              mentionEnd: 0,
            })),
            suggestedActions: [
              { type: 'highlight', payload: {}, label: 'Highlight all components', safe: true },
              { type: 'zoomTo', payload: { level: 1 }, label: 'Fit diagram to view', safe: true },
            ],
            diagramData: diagram,
          };
          await conversationManager.addMessage(modelMsg);
        } else if (aiContext) {
          // Use context-aware chat
          setLoadingText('Analyzing...');
          const response = await chatWithContext(content, chatHistory, aiContext, {
            enableProactive: true,
            attachmentBase64: attachmentData,
            attachmentType: attachment?.type,
          });

          const modelMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
            role: 'model',
            content: response.text,
            linkedComponents: response.componentMentions,
            suggestedActions: response.suggestedActions,
            groundingSources: response.groundingSources,
          };
          await conversationManager.addMessage(modelMsg);

          // Auto-execute safe actions if enabled in settings
          if (autonomySettings.autoExecuteSafeActions) {
            for (const action of response.suggestedActions) {
              // Determine if action is safe based on settings
              const isSafe = autonomySettings.customSafeActions.includes(action.type)
                ? true
                : autonomySettings.customUnsafeActions.includes(action.type)
                  ? false
                  : (ACTION_SAFETY[action.type] ?? false);

              if (isSafe) {
                await aiActions.execute(action);
              }
            }
          }
        } else {
          // Fallback to regular chat
          setLoadingText('Analyzing...');
          const { text, groundingSources } = await chatWithAI(
            content,
            chatHistory,
            attachmentData,
            attachment?.type === 'video' ? 'video' : 'image',
            useDeepThinking
          );

          const modelMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
            role: 'model',
            content: text,
            linkedComponents: [],
            suggestedActions: [],
            groundingSources,
          };
          await conversationManager.addMessage(modelMsg);
        }
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
        role: 'system',
        content: `Error: ${errorMessage}`,
        linkedComponents: [],
        suggestedActions: [],
      };
      await conversationManager.addMessage(errorMsg);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // Handle component click from chat messages
  const handleChatComponentClick = (componentId: string) => {
    // Highlight the component on canvas
    canvasRef.current?.highlightComponent(componentId, {
      color: '#00f3ff',
      duration: 3000,
      pulse: true,
    });
    canvasRef.current?.centerOnComponent(componentId, 1.2);

    // Also find and select the component
    const component =
      inventory.find((c) => c.id === componentId) ||
      history.present?.components.find((c) => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
    }
  };

  // Handle action click from chat messages
  const handleChatActionClick = async (action: ActionIntent) => {
    try {
      await aiActions.execute(action);
    } catch (error: unknown) {
      console.error('Action failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const totalInventoryUnits = inventory.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const diagramComponentCount = history.present?.components?.length ?? 0;
  const diagramConnectionCount = history.present?.connections?.length ?? 0;
  const activeConversation = conversationManager.conversations.find(
    (conversation) => conversation.id === conversationManager.activeConversationId
  );

  return (
    <div className="relative h-screen w-screen bg-cyber-dark text-slate-200 overflow-hidden font-sans">
      {/* Sidebar: Inventory */}
      <Inventory
        items={inventory}
        onAddItem={(item) => setInventory([...inventory, item])}
        onRemoveItem={(id) => setInventory(inventory.filter((i) => i.id !== id))}
        onSelect={handleComponentClick}
        onUpdateItem={(item) => setInventory(inventory.map((i) => (i.id === item.id ? item : i)))}
        isOpen={isInventoryOpen}
        toggleOpen={() => setIsInventoryOpen(!isInventoryOpen)}
        onOpen={() => setIsInventoryOpen(true)}
        onClose={() => setIsInventoryOpen(false)}
        onDeleteMany={(ids) => setInventory(inventory.filter((i) => !ids.includes(i.id)))}
        onUpdateMany={(items) => {
          const updates = new Map(items.map((i) => [i.id, i]));
          setInventory(inventory.map((i) => updates.get(i.id) || i));
        }}
        sidebarWidth={inventoryWidth}
        onSidebarWidthChange={setInventoryWidth}
        defaultSidebarWidth={inventoryDefaultWidth}
        defaultPinned={inventoryPinnedDefault}
        onPinnedChange={(pinned) => setInventoryPinnedDefault(pinned)}
      />

      {/* Main Area */}
      <div
        className="absolute inset-y-0 left-0 right-0 flex flex-col transition-all duration-300 md:left-[var(--inventory-width)] md:right-[var(--assistant-width)]"
        style={
          {
            '--inventory-width': isInventoryOpen ? `${inventoryWidth}px` : '0px',
            '--assistant-width': isAssistantOpen ? `${assistantWidth}px` : '0px',
          } as React.CSSProperties
        }
      >
        {/* Toolbar */}
        <div className="h-12 panel-header panel-rail panel-frame cut-corner-md border-b border-slate-800/80 flex items-center justify-between px-3 shrink-0 z-20 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-semibold tracking-[0.22em] text-white flex items-center gap-2 panel-title">
              <span className="text-neon-cyan text-lg">⚡</span>
              CIRCUIT<span className="text-neon-cyan">MIND</span>
            </h1>

            <div className="h-4 w-px bg-slate-800/80 mx-1"></div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.past.length === 0}
                className="h-8 w-8 inline-flex items-center justify-center bg-slate-950/60 border border-slate-700 text-slate-300 hover:text-white hover:border-neon-cyan/60 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 cut-corner-sm"
                title="Undo"
                aria-label="Undo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={history.future.length === 0}
                className="h-8 w-8 inline-flex items-center justify-center bg-slate-950/60 border border-slate-700 text-slate-300 hover:text-white hover:border-neon-cyan/60 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 cut-corner-sm"
                title="Redo"
                aria-label="Redo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                  />
                </svg>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800/80 mx-1"></div>

            <div className="flex gap-2">
              <button
                onClick={saveDiagram}
                className="px-3 py-1.5 bg-neon-cyan text-black text-[10px] font-bold tracking-[0.28em] hover:bg-white transition-colors shadow-[0_0_14px_rgba(0,243,255,0.35)] cut-corner-sm"
              >
                SAVE
              </button>
              <button
                onClick={loadDiagram}
                className="px-3 py-1.5 border border-neon-purple/60 text-[10px] font-bold tracking-[0.24em] text-neon-purple hover:bg-neon-purple/10 transition-colors cut-corner-sm"
              >
                LOAD
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLiveActive && (
              <div className="flex items-center gap-2 text-red-500 animate-pulse bg-red-900/20 px-2 py-0.5 border border-red-500/50 text-[8px] uppercase tracking-[0.24em] cut-corner-sm">
                <div className="w-1.5 h-1.5 bg-red-500"></div>
                <span className="font-bold">{liveStatus}</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleLiveMode}
              className={`h-8 w-8 inline-flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 cut-corner-sm ${isLiveActive ? 'bg-red-500 text-white border-red-400' : 'bg-slate-950/60 text-slate-400 border-slate-700 hover:text-white hover:border-neon-cyan/60'}`}
              title="Live Voice Mode"
              aria-label="Toggle live voice mode"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="h-8 w-8 inline-flex items-center justify-center border bg-slate-950/60 text-slate-400 border-slate-700 hover:text-white hover:border-neon-cyan/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 cut-corner-sm"
              title="Settings"
              aria-label="Open settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Diagram Canvas */}
        <div className="flex-1 relative overflow-hidden bg-cyber-dark canvas-surface canvas-grid">
          <DiagramCanvas
            ref={canvasRef}
            diagram={history.present}
            onComponentClick={handleComponentClick}
            onDiagramUpdate={handleDiagramChange}
            onComponentDrop={handleComponentDrop}
          />
        </div>

        {/* Status Bar */}
        <div className="h-5 panel-rail panel-frame cut-corner-sm border-t border-slate-800/80 px-2.5 flex items-center justify-between text-[8px] uppercase tracking-[0.16em] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-neon-cyan">Inv {totalInventoryUnits}</span>
            <span className="h-3 w-px bg-slate-800/80" />
            <span>
              Diagram {diagramComponentCount}c / {diagramConnectionCount}w
            </span>
            <span className="h-3 w-px bg-slate-800/80" />
            <span>Mode {generationMode.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Session</span>
            <span className="text-slate-300 max-w-[180px] truncate" title={activeConversation?.title || 'Untitled'}>
              {activeConversation?.title || 'Untitled'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="uppercase">{isLiveActive ? liveStatus : 'standby'}</span>
            <span className={`h-1.5 w-1.5 ${isLiveActive ? 'bg-red-500' : 'bg-slate-600'}`} />
          </div>
        </div>
      </div>

      <AssistantSidebar
        isOpen={isAssistantOpen}
        isPinned={isAssistantPinned}
        onOpen={() => setIsAssistantOpen(true)}
        onClose={() => setIsAssistantOpen(false)}
        onPinnedChange={(pinned) => {
          setIsAssistantPinned(pinned);
          if (pinned) setIsAssistantOpen(true);
        }}
        sidebarWidth={assistantWidth}
        onSidebarWidthChange={setAssistantWidth}
        defaultSidebarWidth={assistantDefaultWidth}
      >
        <ChatPanel
          conversations={conversationManager.conversations}
          activeConversationId={conversationManager.activeConversationId}
          messages={conversationManager.messages.map((m) => ({
            ...m,
            linkedComponents: m.linkedComponents || [],
            suggestedActions: m.suggestedActions || [],
          }))}
          onSwitchConversation={conversationManager.switchConversation}
          onCreateConversation={conversationManager.createConversation}
          onDeleteConversation={conversationManager.deleteConversation}
          onRenameConversation={conversationManager.renameConversation}
          onSendMessage={handleSendEnhancedMessage}
          isLoading={isLoading}
          onComponentClick={handleChatComponentClick}
          onActionClick={handleChatActionClick}
          context={aiContext || undefined}
          proactiveSuggestions={proactiveSuggestions}
          onSuggestionClick={(suggestion) => handleSendEnhancedMessage(suggestion)}
          generationMode={generationMode}
          onModeChange={setGenerationMode}
          useDeepThinking={useDeepThinking}
          onDeepThinkingChange={setUseDeepThinking}
          className="bg-slate-950/80 border-slate-800 rounded-l-2xl rounded-r-none h-full"
          headerActions={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsAssistantPinned(!isAssistantPinned);
                  if (!isAssistantOpen) setIsAssistantOpen(true);
                }}
                className={`h-10 w-10 inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${
                  isAssistantPinned ? 'text-neon-green' : 'text-slate-400 hover:text-neon-cyan'
                }`}
                title={isAssistantPinned ? 'Unpin to auto-hide' : 'Auto-hide assistant'}
                aria-label={isAssistantPinned ? 'Unpin assistant sidebar' : 'Enable auto-hide for assistant'}
              >
                {isAssistantPinned ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAssistantPinned(false);
                  setIsAssistantOpen(false);
                }}
                className="h-10 w-10 inline-flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
                title="Hide assistant sidebar"
                aria-label="Hide assistant sidebar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          }
        />
      </AssistantSidebar>

      {/* Modal - Lazy loaded */}
      {selectedComponent && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="text-neon-cyan">Loading...</div>
            </div>
          }
        >
          <ComponentEditorModal
            component={selectedComponent}
            onClose={() => setSelectedComponent(null)}
            onSave={(updated) => {
              setInventory(inventory.map((i) => (i.id === updated.id ? updated : i)));
              updateDiagram(
                history.present
                  ? {
                      ...history.present,
                      components: history.present.components.map((c) =>
                        c.id === updated.id ? updated : c
                      ),
                    }
                  : null
              );
              setSelectedComponent(null);
            }}
            explanation={modalContent}
            isGenerating3D={isGenerating3D}
            onGenerate3D={handleGenerate3D}
          />
        </Suspense>
      )}

      {/* Settings Panel - Lazy loaded */}
      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          autonomySettings={autonomySettings}
          onAutonomySettingsChange={setAutonomySettings}
          layoutSettings={{
            inventoryOpen: isInventoryOpen,
            inventoryPinned: inventoryPinnedDefault,
            assistantOpen: isAssistantOpen,
            assistantPinned: isAssistantPinned,
            inventoryWidth,
            assistantWidth,
          }}
          onLayoutSettingsChange={(updates) => {
            if (updates.inventoryOpen !== undefined) {
              setIsInventoryOpen(updates.inventoryOpen);
            }
            if (updates.inventoryPinned !== undefined) {
              setInventoryPinnedDefault(updates.inventoryPinned);
            }
            if (updates.assistantOpen !== undefined) {
              setIsAssistantOpen(updates.assistantOpen);
            }
            if (updates.assistantPinned !== undefined) {
              setIsAssistantPinned(updates.assistantPinned);
              if (updates.assistantPinned) setIsAssistantOpen(true);
            }
            if (updates.inventoryWidth !== undefined) {
              setInventoryWidth(
                clampWidth(updates.inventoryWidth, inventoryWidthRange.min, inventoryWidthRange.max)
              );
            }
            if (updates.assistantWidth !== undefined) {
              setAssistantWidth(
                clampWidth(updates.assistantWidth, assistantWidthRange.min, assistantWidthRange.max)
              );
            }
          }}
        />
      </Suspense>
    </div>
  );
}
