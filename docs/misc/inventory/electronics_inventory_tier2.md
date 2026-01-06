# 🔧 Electronics Inventory - Tier 2 Enhanced

**Version:** 3.1-tier2-enhanced
**Last Updated:** 2025-12-31
**Total Components:** 63
**Purpose:** Claude Code CLI Wiring Diagram Application

## ✅ Enhancements Applied

### Tier 1

| Enhancement              | Status |
| ------------------------ | ------ |
| Datasheet Urls           | ✅     |
| Product Images           | ✅     |
| Standardized Field Names | ✅     |
| Common Issues            | ✅     |
| Arduino Libraries        | ✅     |
| Wiring Rules             | ✅     |
| Tags And Use Cases       | ✅     |

### Tier 2 (NEW)

| Enhancement             | Status | Details                      |
| ----------------------- | ------ | ---------------------------- |
| Project Bundles         | ✅     | 8 ready-to-build projects    |
| Component Relationships | ✅     | Compatibility & pairing maps |
| ASCII Pinout Diagrams   | ✅     | 9 detailed diagrams          |
| Code Snippets           | ✅     | 17 working examples          |
| JSON Schema             | ✅     | Formal validation schema     |
| Accessories             | ✅     | 10 items                     |

---

## 📑 Table of Contents

### Components

- [Microcontrollers](#microcontrollers) (6)
- [Sensors](#sensors) (15)
- [Actuators](#actuators) (4)
- [Displays](#displays) (2)
- [Logic Interface](#logic-interface) (2)
- [Power Prototyping](#power-prototyping) (5)
- [Shields](#shields) (5)
- [Audio](#audio) (2)
- [Discrete Semiconductors](#discrete-semiconductors) (3)
- [Capacitors](#capacitors) (2)
- [Leds](#leds) (3)
- [Bulk Passives](#bulk-passives) (4)
- [Accessories](#accessories) (10)

### Special Sections

- [Project Bundles](#project-bundles)
- [ASCII Pinout Diagrams](#ascii-pinout-diagrams)
- [Code Snippets](#code-snippets)
- [Component Relationships](#component-relationships)
- [Quick Reference](#quick-reference)

---

## 🎯 Project Bundles

Pre-defined component sets for common projects:

### 🟢 Robot Obstacle Avoider

**Difficulty:** Beginner
**Est. Cost:** $25

> Simple robot that detects and avoids obstacles

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - main controller
- 2x `sensor-hcsr04` - front obstacle detection
- 1x `shield-motor-l293d` - motor driver
- 1x `actuator-sg90` - sensor pan (optional)

**Also needed:** 2x DC motors, chassis, wheels, battery pack

**Learn:** PWM motor control, ultrasonic sensing, decision logic

---

### 🟡 WiFi Weather Station

**Difficulty:** Intermediate
**Est. Cost:** $15

> IoT weather monitor with web dashboard

**Components from inventory:**

- 1x `mcu-nodemcu-esp8266` - WiFi controller
- 1x `sensor-dht11` - temperature/humidity
- 1x `display-lcd1602` - local display

**Also needed:** I2C backpack for LCD, enclosure

**Learn:** I2C communication, WiFi connectivity, web servers

---

### 🟡 Basic Home Security System

**Difficulty:** Intermediate
**Est. Cost:** $30

> Motion-triggered alarm with RFID access

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - main controller
- 2x `sensor-hcsr501` - motion detection
- 1x `sensor-rc522` - RFID access control
- 1x `audio-piezo` - alarm buzzer
- 1x `actuator-relay-5v` - door lock control

**Also needed:** RFID cards/fobs, door sensor, power supply

**Learn:** SPI communication, interrupt handling, state machines

---

### 🟢 Smart Plant Watering System

**Difficulty:** Beginner
**Est. Cost:** $20

> Automated plant watering based on soil moisture

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - controller
- 1x `sensor-soil-moisture` - moisture sensing
- 1x `actuator-relay-5v` - pump control
- 1x `display-lcd1602` - status display

**Also needed:** 5V water pump, tubing, water reservoir

**Learn:** analog reading, threshold logic, relay control

---

### 🟡 USB Game Controller

**Difficulty:** Intermediate
**Est. Cost:** $15

> Custom game controller with joystick and buttons

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - USB HID device
- 2x `sensor-joystick-ky023` - analog sticks
- 1x `bulk_passives-pushbutton` - action buttons

**Also needed:** enclosure, USB cable

**Learn:** USB HID, analog input, debouncing

---

### 🟢 Addressable LED Art Display

**Difficulty:** Beginner
**Est. Cost:** $25

> Animated LED strip/matrix display

**Components from inventory:**

- 1x `mcu-esp32-devkit-38pin` - controller with WiFi
- 1x `led-ws2812b-strip` - addressable LEDs
- 1x `logic-level-shifter-hw221` - 3.3V to 5V data

**Also needed:** 5V 3A+ power supply, diffuser material

**Learn:** FastLED library, animation patterns, level shifting

---

### 🟡 Environmental Data Logger

**Difficulty:** Intermediate
**Est. Cost:** $20

> SD card data logger with timestamp

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - controller
- 1x `sensor-dht11` - temp/humidity
- 1x `sensor-mpu6050` - motion/vibration
- 1x `sensor-ds3231` - timestamp

**Also needed:** SD card module, SD card, enclosure

**Learn:** I2C bus, SD card writing, CSV formatting

---

### 🔴 Mini CNC Pen Plotter

**Difficulty:** Advanced
**Est. Cost:** $50

> 2-axis drawing machine using GRBL

**Components from inventory:**

- 1x `mcu-arduino-uno-r3` - GRBL controller
- 1x `shield-cnc-grbl` - stepper driver interface
- 2x `actuator-28byj48-uln2003` - X/Y axis motors
- 1x `actuator-sg90` - pen lift

**Also needed:** A4988 drivers x2, linear rails, belts, 12V PSU

**Learn:** GRBL firmware, G-code, stepper control

---

## 📌 ASCII Pinout Diagrams

Copy-paste ready pinout references:

### Arduino Uno

```
┌─────────────────────────────────────────┐
│                Arduino Uno R3            │
│  ┌─────┐                        ┌─────┐  │
│  │ USB │                        │ICSP │  │
│  │  B  │                        │     │  │
│  └─────┘                        └─────┘  │
│                                          │
│  DIGITAL (PWM~)                          │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│  │13│12│~11│~10│~9│ 8│ 7│~6│~5│ 4│~3│ 2│ 1│ 0│
│  │SCK│MISO│MOSI│SS│  │  │  │  │  │  │INT1│INT0│TX│RX│
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
│                                          │
│  POWER            ANALOG IN              │
│  ┌──┬──┬──┬──┬──┐ ┌──┬──┬──┬──┬──┬──┐    │
│  │5V│3.3│GND│GND│VIN│ │A0│A1│A2│A3│A4│A5│    │
│  │  │ V │   │   │  │ │  │  │  │  │SDA│SCL│   │
│  └──┴──┴──┴──┴──┘ └──┴──┴──┴──┴──┴──┘    │
└─────────────────────────────────────────┘
```

### Esp32 Devkit 38

```
┌───────────────────────────────────────────┐
│              ESP32 DevKit 38-Pin          │
│     ┌─────────────────────────────┐       │
│     │         ESP-WROOM-32        │       │
│     │      ┌─────────────┐        │       │
│     │      │   Antenna   │        │       │
│     └──────┴─────────────┴────────┘       │
│                                           │
│ LEFT SIDE              RIGHT SIDE         │
│ ┌────┬─────┐          ┌─────┬────┐        │
│ │3V3 │ 3.3V│          │ GND │ GND│        │
│ │EN  │Reset│          │IO23 │MOSI│        │
│ │VP  │ IO36│◄IN ONLY  │IO22 │ SCL│        │
│ │VN  │ IO39│◄IN ONLY  │TX0  │ IO1│        │
│ │IO34│◄────│IN ONLY   │RX0  │ IO3│        │
│ │IO35│◄────│IN ONLY   │IO21 │ SDA│        │
│ │IO32│     │          │GND  │ GND│        │
│ │IO33│     │          │IO19 │MISO│        │
│ │IO25│ DAC1│          │IO18 │ SCK│        │
│ │IO26│ DAC2│          │IO5  │ SS │ ⚠BOOT  │
│ │IO27│     │          │IO17 │    │        │
│ │IO14│     │          │IO16 │    │        │
│ │IO12│     │ ⚠BOOT    │IO4  │    │        │
│ │GND │ GND │          │IO0  │    │ ⚠BOOT  │
│ │IO13│     │          │IO2  │    │ ⚠BOOT  │
│ │D2  │FLASH│◄NO USE   │IO15 │    │ ⚠BOOT  │
│ │D3  │FLASH│◄NO USE   │D1   │FLASH◄NO USE│
│ │CMD │FLASH│◄NO USE   │D0   │FLASH◄NO USE│
│ │5V  │ VIN │          │CLK  │FLASH◄NO USE│
│ └────┴─────┘          └─────┴────┘        │
│                                           │
│ ⚠ = Strapping pin (affects boot mode)    │
│ ◄IN ONLY = Input only, no pull-up        │
│ ◄NO USE = Internal flash, DO NOT USE     │
└───────────────────────────────────────────┘
```

### Nodemcu Esp8266

```
┌─────────────────────────────────────┐
│        NodeMCU ESP8266 V2           │
│     ┌───────────────────┐           │
│     │    ESP-12E        │           │
│     │   ┌───────┐       │           │
│     │   │Antenna│       │           │
│     └───┴───────┴───────┘           │
│                                     │
│  D PIN  GPIO   FUNCTION   NOTES     │
│  ┌────┬─────┬──────────┬─────────┐  │
│  │ A0 │ ADC │ Analog   │ 0-1V!   │  │
│  │RSV │  -  │ Reserved │         │  │
│  │RSV │  -  │ Reserved │         │  │
│  │SD3 │ 10  │ FLASH    │ NO USE  │  │
│  │SD2 │  9  │ FLASH    │ NO USE  │  │
│  │SD1 │  8  │ FLASH    │ NO USE  │  │
│  │CMD │ 11  │ FLASH    │ NO USE  │  │
│  │SD0 │  7  │ FLASH    │ NO USE  │  │
│  │CLK │  6  │ FLASH    │ NO USE  │  │
│  │GND │  -  │ Ground   │         │  │
│  │3V3 │  -  │ 3.3V Out │ 500mA   │  │
│  │EN  │  -  │ Enable   │         │  │
│  │RST │  -  │ Reset    │         │  │
│  │GND │  -  │ Ground   │         │  │
│  │VIN │  -  │ 5V Input │         │  │
│  └────┴─────┴──────────┴─────────┘  │
│                                     │
│  ACTIVE PINS (other side):          │
│  ┌────┬─────┬──────────┬─────────┐  │
│  │ D0 │ 16  │ Wake     │ No PWM  │  │
│  │ D1 │  5  │ SCL      │ ✓ SAFE  │  │
│  │ D2 │  4  │ SDA      │ ✓ SAFE  │  │
│  │ D3 │  0  │ FLASH    │ ⚠ BOOT  │  │
│  │ D4 │  2  │ LED      │ ⚠ BOOT  │  │
│  │3V3 │  -  │ 3.3V     │         │  │
│  │GND │  -  │ Ground   │         │  │
│  │ D5 │ 14  │ SCK      │ ✓ SAFE  │  │
│  │ D6 │ 12  │ MISO     │ ✓ SAFE  │  │
│  │ D7 │ 13  │ MOSI     │ ✓ SAFE  │  │
│  │ D8 │ 15  │ SS       │ ⚠ BOOT  │  │
│  │RX  │  3  │ UART RX  │ Serial  │  │
│  │TX  │  1  │ UART TX  │ Serial  │  │
│  │GND │  -  │ Ground   │         │  │
│  │3V3 │  -  │ 3.3V     │         │  │
│  └────┴─────┴──────────┴─────────┘  │
│                                     │
│ ✓ SAFE = Best pins for general I/O │
│ ⚠ BOOT = Affects boot, use caution │
└─────────────────────────────────────┘
```

### Hcsr04

```
┌─────────────────────────────────┐
│     HC-SR04 Ultrasonic Sensor   │
│                                 │
│    ┌─────┐         ┌─────┐      │
│    │  T  │  40kHz  │  R  │      │
│    │ TX  │         │ RX  │      │
│    └─────┘         └─────┘      │
│                                 │
│   VCC   TRIG   ECHO   GND       │
│    │      │      │      │       │
│   ─┴─    ─┴─    ─┴─    ─┴─      │
│    ▼      ▼      ▼      ▼       │
│   5V    D9     D10    GND       │
│         (out)  (in)             │
│                 │               │
│    ⚠ For 3.3V MCU:              │
│    ECHO needs voltage divider:  │
│         ECHO ──┬── 1K ── MCU    │
│                └── 2K ── GND    │
└─────────────────────────────────┘
```

### L293D Ic

```
┌─────────────────────────────────────┐
│        L293D Motor Driver IC        │
│                                     │
│         ┌─────┬─┬─────┐             │
│  1,2EN ─┤1    └─┘   16├─ VCC1 (5V)  │
│    1A  ─┤2          15├─ 4A         │
│    1Y  ─┤3          14├─ 4Y         │
│   GND  ─┤4    ┌─┐   13├─ GND        │
│   GND  ─┤5    │ │   12├─ GND        │
│    2Y  ─┤6    └─┘   11├─ 3Y         │
│    2A  ─┤7          10├─ 3A         │
│VCC2(M)─┤8           9├─ 3,4EN      │
│         └───────────┘               │
│                                     │
│   MOTOR A: 1A/2A=direction, 1Y/2Y=motor
│   MOTOR B: 3A/4A=direction, 3Y/4Y=motor
│   Enable HIGH=on, PWM for speed     │
│                                     │
│   Pin 16: Logic power (5V)          │
│   Pin 8:  Motor power (4.5-36V)     │
│   Pins 4,5,12,13: GND (heatsink!)   │
└─────────────────────────────────────┘
```

### Dht11

```
┌────────────────────┐
│    DHT11 Module    │
│   ┌──────────┐     │
│   │  ▓▓▓▓▓▓  │     │
│   │  ▓▓▓▓▓▓  │     │
│   │  ▓▓▓▓▓▓  │     │
│   └──────────┘     │
│                    │
│   VCC  DATA  GND   │
│    │    │    │     │
│   ─┴─  ─┴─  ─┴─    │
│    ▼    ▼    ▼     │
│  3.3/5V D2  GND    │
│         │          │
│    (10K pullup     │
│     usually on     │
│     module)        │
└────────────────────┘
```

### Servo Sg90

```
┌─────────────────────────┐
│     SG90 Micro Servo    │
│                         │
│    ┌─────────────┐      │
│    │   ┌─────┐   │      │
│    │   │motor│   │      │
│    │   └─────┘   │      │
│    │     gear    │      │
│    └──────┬──────┘      │
│           │ wires       │
│     ┌─────┴─────┐       │
│     │  │  │  │  │       │
│     │  ▼  ▼  ▼  │       │
│     │ BRN RED ORG│      │
│     │ GND VCC SIG│      │
│     └───────────┘       │
│                         │
│   BROWN = GND           │
│   RED   = VCC (4.8-6V)  │
│   ORANGE= Signal (PWM)  │
│                         │
│   PWM: 1ms=0°           │
│        1.5ms=90°        │
│        2ms=180°         │
└─────────────────────────┘
```

### 74Hc595

```
┌───────────────────────────────┐
│      74HC595 Shift Register   │
│                               │
│      ┌─────┬─U─┬─────┐        │
│  QB ─┤1         16├─ VCC      │
│  QC ─┤2         15├─ QA       │
│  QD ─┤3         14├─ DS (SER) │
│  QE ─┤4   595   13├─ OE       │
│  QF ─┤5         12├─ STCP     │
│  QG ─┤6         11├─ SHCP     │
│  QH ─┤7         10├─ MR       │
│ GND ─┤8          9├─ QH'      │
│      └───────────┘            │
│                               │
│ Pin 14 (DS/SER)  = Data In    │
│ Pin 11 (SHCP)    = Shift Clock│
│ Pin 12 (STCP)    = Latch Clock│
│ Pin 13 (OE)      = Output En  │
│ Pin 10 (MR)      = Master Rst │
│ Pin 9  (QH')     = Serial Out │
│ Pins 1-7,15      = Outputs    │
│                               │
│ Typical: OE→GND, MR→VCC       │
└───────────────────────────────┘
```

### Pir Hcsr501

```
┌─────────────────────────────┐
│   HC-SR501 PIR Motion Sensor│
│                             │
│      ┌───────────┐          │
│      │  Fresnel  │          │
│      │   Lens    │          │
│      └───────────┘          │
│   ┌───────────────────┐     │
│   │ [POT1]   [POT2]   │     │
│   │  TIME    SENS     │     │
│   │                   │     │
│   │  [JUMPER H/L]     │     │
│   └───────────────────┘     │
│       │    │    │           │
│      VCC  OUT  GND          │
│       │    │    │           │
│      ─┴─  ─┴─  ─┴─          │
│       ▼    ▼    ▼           │
│    5-20V  D2  GND           │
│           │                 │
│     (Output is 3.3V -       │
│      safe for all MCUs)     │
│                             │
│ POT1: Delay time (5s-5min)  │
│ POT2: Sensitivity (3-7m)    │
│ Jumper: H=repeat, L=single  │
└─────────────────────────────┘
```

---

## 💻 Code Snippets

Working code examples for common tasks:

### Arduino Uno Blink

**Purpose:** Basic LED blink - verify board works

```cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

### Hcsr04 Distance

**Purpose:** HC-SR04 ultrasonic distance measurement
**Library:** `NewPing`

```cpp
#include <NewPing.h>
#define TRIG 9
#define ECHO 10
#define MAX_DIST 400

NewPing sonar(TRIG, ECHO, MAX_DIST);

void setup() {
  Serial.begin(9600);
}
void loop() {
  delay(50);
  int cm = sonar.ping_cm();
  Serial.print("Distance: ");
  Serial.print(cm);
  Serial.println(" cm");
}
```

### Dht11 Temp Humidity

**Purpose:** DHT11 temperature and humidity reading
**Library:** `DHT sensor library`

```cpp
#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}
void loop() {
  delay(2000);  // DHT11 needs 1s between reads
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read!");
    return;
  }
  Serial.print("Temp: "); Serial.print(t);
  Serial.print("C  Humidity: "); Serial.print(h);
  Serial.println("%");
}
```

### Servo Sweep

**Purpose:** SG90 servo sweep 0-180 degrees
**Library:** `Servo (built-in)`

```cpp
#include <Servo.h>

Servo myservo;

void setup() {
  myservo.attach(9);  // PWM pin
}
void loop() {
  for (int pos = 0; pos <= 180; pos++) {
    myservo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos--) {
    myservo.write(pos);
    delay(15);
  }
}
```

### Stepper 28Byj48

**Purpose:** 28BYJ-48 stepper motor control
**Library:** `Stepper (built-in)`

```cpp
#include <Stepper.h>

// 2048 steps = 1 revolution (with gear ratio)
const int stepsPerRev = 2048;

// Pins: IN1, IN3, IN2, IN4 (note order!)
Stepper myStepper(stepsPerRev, 8, 10, 9, 11);

void setup() {
  myStepper.setSpeed(10);  // 10 RPM max for 28BYJ-48
}
void loop() {
  myStepper.step(stepsPerRev);   // 1 revolution CW
  delay(500);
  myStepper.step(-stepsPerRev);  // 1 revolution CCW
  delay(500);
}
```

### Mpu6050 Basic

**Purpose:** MPU6050 IMU basic reading
**Library:** `MPU6050 by Electronic Cats`

```cpp
#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpu.initialize();

  if (!mpu.testConnection()) {
    Serial.println("MPU6050 not found!");
    while(1);
  }
}
void loop() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  Serial.print("Accel: ");
  Serial.print(ax); Serial.print(",");
  Serial.print(ay); Serial.print(",");
  Serial.println(az);
  delay(100);
}
```

### Ds3231 Rtc

**Purpose:** DS3231 RTC time reading
**Library:** `RTClib by Adafruit`

```cpp
#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;

void setup() {
  Serial.begin(9600);
  Wire.begin();

  if (!rtc.begin()) {
    Serial.println("RTC not found!");
    while(1);
  }
  // Uncomment to set time (only once):
  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
}
void loop() {
  DateTime now = rtc.now();
  Serial.print(now.year()); Serial.print('/');
  Serial.print(now.month()); Serial.print('/');
  Serial.print(now.day()); Serial.print(' ');
  Serial.print(now.hour()); Serial.print(':');
  Serial.print(now.minute()); Serial.print(':');
  Serial.println(now.second());
  delay(1000);
}
```

### Rc522 Rfid

**Purpose:** RC522 RFID card reading
**Library:** `MFRC522`

```cpp
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Scan RFID card...");
}
void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  Serial.print("UID: ");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();
  mfrc522.PICC_HaltA();
}
```

### Lcd1602 I2C

**Purpose:** LCD1602 with I2C backpack
**Library:** `LiquidCrystal_I2C`

```cpp
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Address 0x27 or 0x3F depending on backpack
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("Line 2 here");
}
void loop() {
  // Update display as needed
}
```

### Ws2812B Rainbow

**Purpose:** WS2812B LED strip rainbow effect
**Library:** `FastLED`

```cpp
#include <FastLED.h>

#define LED_PIN 6
#define NUM_LEDS 60

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(50);
}
void loop() {
  static uint8_t hue = 0;
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(hue + (i * 10), 255, 255);
  }
  FastLED.show();
  hue++;
  delay(20);
}
```

### Esp8266 Wifi Basic

**Purpose:** ESP8266 WiFi connection
**Library:** `ESP8266WiFi`

```cpp
#include <ESP8266WiFi.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}
void loop() {
  // Your code here
}
```

### Esp32 Wifi Basic

**Purpose:** ESP32 WiFi connection
**Library:** `WiFi (built-in)`

```cpp
#include <WiFi.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}
void loop() {
  // Your code here
}
```

### Pir Motion

**Purpose:** HC-SR501 PIR motion detection
**Library:** `None (digitalRead)`

```cpp
#define PIR_PIN 2
#define LED_PIN 13

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Warming up PIR (60s)...");
  delay(60000);  // PIR needs 60s warmup
  Serial.println("Ready!");
}
void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Motion detected!");
    delay(2000);  // Debounce
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}
```

### L293D Motor

**Purpose:** L293D DC motor control
**Library:** `None (digitalWrite/analogWrite)`

```cpp
// L293D pins
#define EN1 5   // PWM speed control
#define IN1 6   // Direction
#define IN2 7   // Direction

void setup() {
  pinMode(EN1, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void forward(int speed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(EN1, speed);  // 0-255
}

void backward(int speed) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(EN1, speed);
}

void stop() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(EN1, 0);
}

void loop() {
  forward(200);
  delay(2000);
  stop();
  delay(500);
  backward(200);
  delay(2000);
  stop();
  delay(500);
}
```

### 74Hc595 Shift

**Purpose:** 74HC595 shift register LED control
**Library:** `None (shiftOut built-in)`

```cpp
#define DATA  11  // DS
#define CLOCK 12  // SHCP
#define LATCH 8   // STCP

void setup() {
  pinMode(DATA, OUTPUT);
  pinMode(CLOCK, OUTPUT);
  pinMode(LATCH, OUTPUT);
}

void shiftWrite(byte data) {
  digitalWrite(LATCH, LOW);
  shiftOut(DATA, CLOCK, MSBFIRST, data);
  digitalWrite(LATCH, HIGH);
}

void loop() {
  // Light LEDs one by one
  for (int i = 0; i < 8; i++) {
    shiftWrite(1 << i);
    delay(100);
  }
  // All on
  shiftWrite(0xFF);
  delay(500);
  // All off
  shiftWrite(0x00);
  delay(500);
}
```

### Joystick Read

**Purpose:** KY-023 joystick reading
**Library:** `None (analogRead/digitalRead)`

```cpp
#define VRX A0
#define VRY A1
#define SW  2

void setup() {
  pinMode(SW, INPUT_PULLUP);
  Serial.begin(9600);
}
void loop() {
  int x = analogRead(VRX);  // 0-1023, center ~512
  int y = analogRead(VRY);
  int btn = digitalRead(SW);  // LOW when pressed

  Serial.print("X:"); Serial.print(x);
  Serial.print(" Y:"); Serial.print(y);
  Serial.print(" BTN:"); Serial.println(btn ? "UP" : "PRESSED");
  delay(100);
}
```

### I2C Scanner

**Purpose:** I2C address scanner utility
**Library:** `Wire (built-in)`

```cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("I2C Scanner");
}
void loop() {
  byte count = 0;
  Serial.println("Scanning...");

  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found: 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
      count++;
    }
  }
  Serial.print("Found "); Serial.print(count);
  Serial.println(" device(s)");
  delay(5000);
}
```

---

## 🔗 Component Relationships

### Voltage Compatibility

**5V Safe Components:**
`mcu-arduino-uno-r3, mcu-arduino-mega-2560, mcu-dccduino-nano, sensor-hcsr04, sensor-dht11, display-lcd1602, actuator-sg90...`

**⚠️ 3.3V ONLY (NOT 5V tolerant):**
`mcu-esp32-devkit-38pin, mcu-nodemcu-esp8266, sensor-rc522`

**Level Shifter Required:**
| From | To | Reason |
|------|-----|--------|
| mcu-esp32-devkit-38pin | sensor-hcsr04 | Echo outputs 5V |
| mcu-esp32-devkit-38pin | led-ws2812b-strip | Data needs 5V |
| mcu-nodemcu-esp8266 | sensor-hcsr04 | Echo outputs 5V |
| mcu-nodemcu-esp8266 | led-ws2812b-strip | Data needs 5V |

### Commonly Paired Components

| Component                | Pairs With                                        | Project Type     |
| ------------------------ | ------------------------------------------------- | ---------------- |
| sensor-hcsr04            | mcu-arduino-uno-r3                                | robot            |
| sensor-dht11             | mcu-nodemcu-esp8266, display-lcd1602              | weather station  |
| actuator-28byj48-uln2003 | mcu-arduino-uno-r3                                | stepper projects |
| sensor-mpu6050           | mcu-arduino-uno-r3, sensor-ds3231                 | motion logger    |
| led-ws2812b-strip        | mcu-esp32-devkit-38pin, logic-level-shifter-hw221 | LED art          |

### ⚡ External Power Required

| Component                | When               | Reason                |
| ------------------------ | ------------------ | --------------------- |
| actuator-sg90            | qty > 1            | 500mA+ per servo      |
| actuator-28byj48-uln2003 | always             | 240mA per motor       |
| led-ws2812b-strip        | always             | 60mA per LED          |
| shield-motor-l293d       | motor_voltage > 6V | separate motor supply |

### ⚠️ I2C Address Conflicts

- **sensor-mpu6050, sensor-ds3231** both use `0x68`
  - Resolution: Change MPU6050 AD0 to HIGH for 0x69

---

## Microcontrollers

### Arduino Uno R3

**Qty:** 2

> 💡 5V Arduino microcontroller with ATmega328P, 14 digital I/O (6 PWM), 6 analog inputs. Most widely supported, beginner-friendly. Use USB-B or 7-12V barrel jack for power.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf) | [🖼️ Image](https://store.arduino.cc/cdn/shop/products/A000066_03.front_934x700.jpg) | [📌 Pinout](https://content.arduino.cc/assets/Pinout-UNOrev3_latest.png)

**⚠️ Warnings:**

- Do not exceed 20mA per I/O pin
- Total current from all I/O pins should not exceed 200mA
- Vin must be 7-12V; lower causes instability, higher causes overheating

**🔧 Quick Fixes:**

- _Board not detected by computer_ → Try different USB cable with data lines
- _Sketch uploads but doesn't run_ → Add Serial.print debugging

**Tags:** `microcontroller` `arduino` `atmega328p` `5v` `beginner-friendly` `usb`

---

### Arduino Mega 2560 R3

**Qty:** 1

> 💡 5V Arduino with ATmega2560, 54 digital I/O (15 PWM), 16 analog inputs, 4 hardware serial ports. Use for projects needing many pins or multiple serial devices.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf) | [🖼️ Image](https://store.arduino.cc/cdn/shop/products/A000067_03.front_934x700.jpg) | [📌 Pinout](https://content.arduino.cc/assets/Pinout-Mega2560rev3_latest.png)

**🔧 Quick Fixes:**

- _SPI conflicts with pins 50-53_ → Reserve pins 50-53 for SPI devices only
- _Serial conflicts_ → Use Serial.begin() for USB, Serial1/2/3.begin() for hardware UARTs

**Tags:** `microcontroller` `arduino` `atmega2560` `5v` `many-pins` `4-serial`

---

### ESP32 DevKit 38-Pin

**Qty:** 1

> 💡 3.3V dual-core WiFi+Bluetooth MCU. NOT 5V tolerant - requires level shifter for 5V sensors. Avoid GPIO6-11 (flash). Input-only: GPIO34/35/36/39. Powerful but requires attention to pin selection.

[📄 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf) | [🖼️ Image](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitc-functional-overview.jpg) | [📌 Pinout](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitC-v4-pinout.png)

**⚠️ Warnings:**

- NOT 5V TOLERANT - use level shifter for 5V sensors
- GPIO6-11 are reserved for internal flash - DO NOT USE
- GPIO34/35/36/39 are input-only

**🔧 Quick Fixes:**

- _Won't enter upload mode_ → Hold BOOT button while pressing EN/RST
- _Brownout detector triggered_ → Use powered USB hub

**Tags:** `microcontroller` `esp32` `wifi` `bluetooth` `3.3v` `dual-core`

---

### NodeMCU ESP8266 Amica V2

**Qty:** 2

> 💡 3.3V WiFi MCU, breadboard-friendly (23mm row spacing). NOT 5V tolerant. Safe pins: D1/D2/D5/D6/D7. Avoid D3/D4/D8 for sensors (boot-sensitive). Only 1 ADC.

[📄 Datasheet](https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf) | [🖼️ Image](https://cdn.shopify.com/s/files/1/0672/9409/products/NodeMCU_ESP8266_Board_1024x1024.jpg) | [📌 Pinout](https://randomnerdtutorials.com/wp-content/uploads/2019/05/ESP8266-NodeMCU-kit-12-E-pinout-gpio-pin.png)

**⚠️ Warnings:**

- NOT 5V TOLERANT - 3.3V logic only
- D3/D4/D8 affect boot mode - don't pull LOW at startup
- GPIO6-11 reserved for flash - DO NOT USE

**🔧 Quick Fixes:**

- _Won't boot with sensor on D3/D4/D8_ → Move sensor to D1/D2/D5/D6/D7
- _CH340 driver not found_ → Download CH340 driver from manufacturer

**Tags:** `microcontroller` `esp8266` `wifi` `3.3v` `iot` `nodemcu`

---

### SparkFun Blynk Board

**Qty:** 2

> 💡 ESP8266 board with pre-loaded Blynk firmware, onboard WS2812 RGB LED on GPIO4, and 10K thermistor on ADC. Quick IoT prototyping.

[📄 Datasheet](https://cdn.sparkfun.com/assets/learn_tutorials/4/9/4/Blynk_Board_Graphical_Datasheet_v01.png) | [🖼️ Image](https://cdn.sparkfun.com/assets/parts/1/1/2/4/5/13794-01.jpg)

**Tags:** `esp8266` `blynk` `rgb-led` `iot` `preloaded`

---

### DCCduino Nano

**Qty:** 1

> 💡 Arduino Nano clone with CH340G USB chip. Requires CH340 driver. 5V logic, breadboard-friendly form factor.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000005-datasheet.pdf) | [🖼️ Image](https://www.electronicshub.org/wp-content/uploads/2021/01/Arduino-Nano-Pinout-1.jpg)

**⚠️ Warnings:**

- Requires CH340G driver installation

**🔧 Quick Fixes:**

- _Not recognized by computer_ → Install CH340G driver from WCH website

**Tags:** `arduino` `nano` `clone` `ch340` `breadboard`

---

## Sensors

### HC-SR04 Ultrasonic Sensor

**Qty:** 2

> 💡 5V ultrasonic distance sensor, 2-400cm range. Requires 2 digital pins (Trig output, Echo input). Use voltage divider on Echo for 3.3V MCUs. Min 60ms between readings.

[📄 Datasheet](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf) | [🖼️ Image](https://cdn.sparkfun.com/assets/parts/6/4/6/4/11308-01.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR04-Ultrasonic-Sensor-Pinout.png)

**⚠️ Warnings:**

- Echo pin outputs 5V - use voltage divider for 3.3V MCUs
- Minimum 60ms between measurements to avoid echo interference
- 10μs minimum trigger pulse required

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, trig→D9, echo→D10
- **Arduino Mega:** vcc→5V, gnd→GND, trig→D22, echo→D23
- **Esp32:** vcc→VIN (5V), gnd→GND, trig→GPIO23, echo→GPIO22 (via voltage divider: 1K+2K)
  - _ESP32 is 3.3V - Echo outputs 5V, needs divider!_

**🔧 Quick Fixes:**

- _Always reads 0 or max distance_ → Ensure 10μs HIGH trigger pulse
- _Inconsistent/jumping readings_ → Add 100nF decoupling cap

**📚 Library:** `NewPing`

**Tags:** `ultrasonic` `distance` `proximity` `ranging` `5v`

---

### HC-SR501 PIR Motion Sensor

**Qty:** 1

> 💡 PIR motion sensor, 3-7m adjustable range, 110° cone. Output is 3.3V (safe for all MCUs). Requires 60s warmup. Use interrupt pin for responsive detection.

[📄 Datasheet](https://www.mpja.com/download/31227sc.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR501-PIR-Motion-Sensor-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR501-PIR-Sensor-Pinout.png)

**⚠️ Warnings:**

- Allow 60 seconds warmup after power-on
- 2.5 second lockout after output goes LOW
- Avoid mounting near heat sources or AC vents

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, out→D2 (interrupt capable)
- **Esp32:** vcc→VIN (5V), gnd→GND, out→GPIO13 (any input pin)
- **Esp8266:** vcc→VIN (5V), gnd→GND, out→D1 (GPIO5)

**🔧 Quick Fixes:**

- _False triggers_ → Shield from air currents
- _Doesn't detect movement_ → Wait 60 seconds after power-on

**📚 Library:** `None required - simple digital read`

**Tags:** `pir` `motion` `infrared` `presence` `security`

---

### DHT11 Temperature & Humidity Module

**Qty:** 1

> 💡 Temperature (0-50°C ±2°C) and humidity (20-90% ±5%) sensor. Single-wire protocol (NOT I2C). Max 1 reading per second. Use DHT library.

[📄 Datasheet](https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-1143054.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/DHT11-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/DHT11-Pinout.jpg)

**⚠️ Warnings:**

- Minimum 1 second between readings (1Hz max)
- Use 3.3V power for 3.3V MCUs
- Pull-up resistor required if not on module

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, data→D2
- **Arduino Mega:** vcc→5V, gnd→GND, data→D2
- **Esp32:** vcc→3.3V, gnd→GND, data→GPIO4

**🔧 Quick Fixes:**

- _Always returns NaN or checksum errors_ → Add 10K pull-up to data line
- _Readings are wildly inaccurate_ → Read no more than once per 2 seconds

**📚 Library:** `DHT sensor library by Adafruit`

**Tags:** `temperature` `humidity` `environmental` `dht11` `1-wire`

---

### GY-521 MPU6050 6-DOF IMU

**Qty:** 1

> 💡 6-axis IMU (3-axis accel + 3-axis gyro) on I2C bus. Address 0x68 (AD0=GND) or 0x69 (AD0=HIGH). Has onboard DMP for sensor fusion. Use I2C scanner to verify connection.

[📄 Datasheet](https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/GY-521-MPU6050-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/MPU6050-Module-Pinout.jpg)

**⚠️ Warnings:**

- Module has onboard 3.3V regulator - safe for 5V VCC
- I2C lines are 3.3V - use level shifter if MCU needs 5V I2C
- AD0 pin selects address: GND=0x68, VCC=0x69

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, scl→A5, sda→A4
- **Arduino Mega:** vcc→5V, gnd→GND, scl→D21, sda→D20
- **Esp32:** vcc→3.3V, gnd→GND, scl→GPIO22, sda→GPIO21

**🔧 Quick Fixes:**

- _I2C device not found_ → Run I2C scanner
- _Gyro drift_ → Implement calibration routine

**📚 Library:** `MPU6050 by Electronic Cats or I2Cdevlib`

**Tags:** `imu` `accelerometer` `gyroscope` `6-dof` `motion` `i2c`

---

### DS3231 RTC Module

**Qty:** 1

> 💡 Precision RTC (±2ppm) with I2C at 0x68. Includes 4KB EEPROM at 0x57 and CR2032 backup. NOTE: Same I2C address as MPU6050 - change MPU AD0 if using both.

[📄 Datasheet](https://datasheets.maximintegrated.com/en/ds/DS3231.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module-Pinout.png)

**⚠️ Warnings:**

- RTC address 0x68 conflicts with MPU6050 default - change MPU AD0 if using both
- Install CR2032 battery for backup
- Some modules charge the battery - use non-rechargeable CR2032 or remove charging diode

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, scl→A5, sda→A4
- **Arduino Mega:** vcc→5V, gnd→GND, scl→D21, sda→D20
- **Esp32:** vcc→3.3V, gnd→GND, scl→GPIO22, sda→GPIO21

**🔧 Quick Fixes:**

- _Time resets after power loss_ → Install fresh CR2032 with + facing up
- _I2C address conflict with MPU6050_ → Change MPU6050 to 0x69 by connecting AD0 to VCC

**📚 Library:** `RTClib by Adafruit`

**Tags:** `rtc` `real-time-clock` `time` `i2c` `eeprom` `battery-backup`

---

### RC522 RFID Module

**Qty:** 1

> 💡 13.56MHz RFID reader on SPI bus. 3.3V ONLY - will be damaged by 5V! Includes card and keychain fob. Use MFRC522 library.

[📄 Datasheet](https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/RFID-Reader-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/RFID-RC522-Reader-Writer-Module-Pinout.png)

**⚠️ Warnings:**

- VCC is 3.3V ONLY - 5V will damage the module
- SPI pins are 3.3V tolerant
- Antenna coil is fragile - don't bend PCB

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→3.3V, gnd→GND, sck→D13, mosi→D11, miso→D12
  - _Module is 3.3V but most clones work with 5V Arduino SPI_
- **Esp32:** vcc→3.3V, gnd→GND, sck→GPIO18, mosi→GPIO23, miso→GPIO19

**🔧 Quick Fixes:**

- _Card not detected_ → Verify SPI connections
- _Module damaged/not responding_ → Replace module - 5V damage is permanent

**📚 Library:** `MFRC522 by GithubCommunity`

**Tags:** `rfid` `nfc` `13.56mhz` `mifare` `spi` `3.3v`

---

### KY-023 Joystick Module

**Qty:** 2

> 💡 Dual-axis analog joystick with center button. Uses 2 analog pins + 1 digital. Center position ~512 on Arduino. Button is active LOW.

[🖼️ Image](https://components101.com/sites/default/files/components/KY023-Joystick-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/KY-023-Joystick-Module-Pinout.png)

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, vrx→A0, vry→A1, sw→D2
- **Esp32:** vcc→3.3V, gnd→GND, vrx→GPIO34, vry→GPIO35, sw→GPIO13
  - _Use 3.3V for ESP32 - output will be 0-4095 (12-bit)_

**🔧 Quick Fixes:**

- _Center position not at 512_ → Calibrate in software - read center position at startup

**📚 Library:** `None required - use analogRead()`

**Tags:** `joystick` `analog` `input` `game-controller`

---

### KY-040 Rotary Encoder

**Qty:** 1

> 💡 20-detent rotary encoder with quadrature output and push button. Use interrupt pins for CLK/DT for reliable counting.

[🖼️ Image](https://components101.com/sites/default/files/components/KY040-Rotary-Encoder.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/KY-040-Rotary-Encoder-Pinout.png)

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, clk→D2, dt→D3, sw→D4
- **Esp32:** vcc→3.3V, gnd→GND, clk→GPIO25, dt→GPIO26, sw→GPIO27

**📚 Library:** `Encoder by PJRC or RotaryEncoder`

**Tags:** `rotary` `encoder` `quadrature` `input` `menu`

---

### Photoresistor (LDR)

**Qty:** 5

> 💡 Light sensor using voltage divider. Higher light = lower resistance = higher analog reading. Use 10K resistor to GND.

[🖼️ Image](https://components101.com/sites/default/files/components/LDR.jpg)

**📚 Library:** `None - use analogRead()`

**Tags:** `light` `ldr` `photoresistor` `analog`

---

### Soil Moisture Sensor

**Qty:** 1

> 💡 Capacitive soil sensor. A0 gives analog reading (lower = wetter). Power only when reading to extend probe life.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/Soil-Moisture-Sensor-Pinout.png)

**⚠️ Warnings:**

- Probes corrode quickly in wet soil - don't leave powered constantly

**Tags:** `soil` `moisture` `plant` `garden`

---

### Flame Sensor Module

**Qty:** 1

> 💡 IR flame sensor. Detects 760-1100nm wavelength (fire). D0 for threshold detection, A0 for intensity.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/Flame-Sensor-Module-Pinout.png)

**Tags:** `flame` `fire` `ir` `safety`

---

### Water Level Sensor

**Qty:** 1

> 💡 Conductive water level sensor. Analog output proportional to water height. Power intermittently to reduce electrolysis.

**Tags:** `water` `level` `liquid` `analog`

---

### KY-038 Sound Sensor

**Qty:** 1

> 💡 Sound detection module. A0 for analog level, D0 for threshold detection (clap sensor). Adjust sensitivity with pot.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/KY-038-Sound-Sensor-Module.jpg)

**Tags:** `sound` `microphone` `audio` `clap`

---

### IR Obstacle Avoidance Sensor

**Qty:** 2

> 💡 IR proximity sensor. Output LOW when obstacle in range. Adjust range with pot. Works 2-30cm typical.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/IR-Sensor-Module-Pinout.jpg)

**Tags:** `ir` `obstacle` `proximity` `digital`

---

### SW-520D Tilt Switch

**Qty:** 3

> 💡 Ball-type tilt switch. Closes circuit when tilted past threshold. Use INPUT_PULLUP, reads LOW when tilted.

**Tags:** `tilt` `switch` `orientation` `angle`

---

## Actuators

### SG90 Micro Servo

**Qty:** 1

> 💡 180° micro servo, 9g. PWM control: 1ms=0°, 1.5ms=90°, 2ms=180°. Use external 5V supply for multiple servos. Brown=GND, Red=VCC, Orange=Signal.

[📄 Datasheet](http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/Servo-Motor-SG90.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/Servo-Motor-Dimensions.png)

**⚠️ Warnings:**

- Stall current can exceed 500mA - use external power for multiple servos
- Never power from MCU 5V pin if using more than 1 servo
- Common GND between servo power supply and MCU required

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V (or external), gnd→GND, signal→D9 (PWM)
- **Arduino Mega:** vcc→5V (or external), gnd→GND, signal→D9 (PWM)
- **Esp32:** vcc→5V external, gnd→common GND, signal→GPIO13

**🔧 Quick Fixes:**

- _Servo jitters or doesn't hold position_ → Use separate 5V 1A+ supply
- _Arduino resets when servo moves_ → Power servo from external 5V supply, share GND with Arduino

**📚 Library:** `Servo.h (built-in)`

**Tags:** `servo` `motor` `pwm` `position-control` `actuator`

---

### 28BYJ-48 Stepper Motor with ULN2003 Driver

**Qty:** 1

> 💡 5V geared stepper, 4096 steps/rev, ~15 RPM max. Requires 4 digital pins + ULN2003 driver. Use external 5V power. AccelStepper library for smooth motion.

[📄 Datasheet](https://components101.com/sites/default/files/component_datasheet/28byj48-stepper-motor-datasheet.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-With-ULN2003-Driver.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-Pinout.png)

**⚠️ Warnings:**

- Motor draws ~240mA - use external power supply
- Driver LEDs show which coil is active
- Gear train makes motor slow but high torque

**🔌 Connection Templates:**

- **Arduino Uno:** driver_vcc→External 5V (not Arduino 5V!), driver_gnd→GND (common), in1→D8, in2→D9, in3→D10
- **Esp32:** driver_vcc→5V external, driver_gnd→common GND, in1→GPIO13, in2→GPIO12, in3→GPIO14

**🔧 Quick Fixes:**

- _Motor vibrates but doesn't turn_ → Use Stepper library with correct pin order
- _Motor gets hot_ → Disable motor when not moving (call stepper.release())

**📚 Library:** `Stepper (built-in) or AccelStepper`

**Tags:** `stepper` `motor` `uln2003` `gear-motor` `position-control`

---

### L293D Motor Driver IC

**Qty:** 4

> 💡 Dual H-bridge motor driver IC. 600mA/channel. Pin 16=5V logic, Pin 8=motor voltage (4.5-36V). Enable pins control on/off or PWM speed. Gets hot - add heatsink.

[📄 Datasheet](https://www.ti.com/lit/ds/symlink/l293d.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/L293D-Pinout.gif) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/L293D-Pinout.gif)

**⚠️ Warnings:**

- Chip gets HOT - heatsink recommended above 400mA
- Ground pins (4,5,12,13) also act as heatsink - solder to large copper area
- Internal diodes protect against back-EMF but add voltage drop

**🔧 Quick Fixes:**

- _IC overheating_ → Add heatsink or copper pour under chip
- _Motor doesn't run in both directions_ → Connect enable pins to 5V or PWM pin

**Tags:** `motor-driver` `h-bridge` `dc-motor` `ic` `l293d`

---

### 5V Relay Module

**Qty:** 1

> 💡 5V relay module with optocoupler isolation. Active LOW trigger. Load terminals: COM (common), NO (normally open), NC (normally closed). CAUTION: Can switch mains voltage.

[🖼️ Image](https://components101.com/sites/default/files/components/5V-Relay-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/1-Channel-Relay-Module-Pinout.png)

**⚠️ Warnings:**

- DANGER: Load side can carry mains voltage - use extreme caution
- Keep high voltage wiring away from low voltage Arduino circuits
- Active LOW: digitalWrite(pin, LOW) turns relay ON

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, in→D7

**🔧 Quick Fixes:**

- _Relay clicks but doesn't switch load_ → Wire load between COM and NO or NC as needed
- _Arduino resets when relay switches_ → Module has built-in protection but add 100uF cap on Arduino 5V

**Tags:** `relay` `switch` `high-voltage` `ac-control` `isolation`

---

## Displays

### LCD 1602 Module

**Qty:** 2

> 💡 16x2 character LCD. Parallel mode needs 6+ pins; I2C backpack needs only 2 (SDA/SCL). MUST adjust contrast pot (V0) or display appears blank.

[📄 Datasheet](https://www.sparkfun.com/datasheets/LCD/HD44780.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/16x2-LCD-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/16x2-LCD-Module-Pinout.png)

**⚠️ Warnings:**

- Contrast (V0) must be adjusted - display may appear blank without it
- Use 10K potentiometer between VDD and VSS, wiper to V0
- I2C backpack reduces wiring from 12+ pins to 4 pins

**🔌 Connection Templates:**

- **Arduino Uno I2C:** vcc→5V, gnd→GND, sda→A4, scl→A5, addr→0x27
- **Arduino Mega I2C:** vcc→5V, gnd→GND, sda→D20, scl→D21, addr→0x27
- **Esp32 I2C:** vcc→5V, gnd→GND, sda→GPIO21, scl→GPIO22, addr→0x27

**🔧 Quick Fixes:**

- _Display shows boxes or is blank_ → Adjust V0 potentiometer until text visible
- _Random characters or garbled display_ → Check wiring matches code

**Tags:** `lcd` `display` `16x2` `hd44780` `text-display`

---

### MAX7219 8x8 LED Matrix Module

**Qty:** 1

> 💡 8x8 LED matrix with MAX7219 driver. SPI interface, cascadable for larger displays. 5V operation, 16 brightness levels.

[📄 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/MAX7219-LED-Dot-Matrix.jpg)

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, din→D11, cs→D10, clk→D13
- **Esp32:** vcc→5V, gnd→GND, din→GPIO23, cs→GPIO5, clk→GPIO18

**📚 Library:** `MD_MAX72XX or LedControl`

**Tags:** `led-matrix` `max7219` `8x8` `spi` `cascadable`

---

## Logic Interface

### HW-221 Logic Level Converter

**Qty:** 2

> 💡 4-channel bidirectional level shifter. Connect LV to 3.3V reference, HV to 5V reference, share GND. Works for I2C, SPI, UART up to ~400kHz.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/Logic-Level-Converter-Pinout.png)

**Tags:** `level-shifter` `3.3v-to-5v` `bidirectional` `i2c` `spi`

---

### 74HC595 Shift Register

**Qty:** 1

> 💡 8-bit serial-to-parallel shift register. Expands 3 pins to 8 outputs. Cascadable for more outputs. Use shiftOut() function.

[📄 Datasheet](https://www.ti.com/lit/ds/symlink/sn74hc595.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/74HC595-Pinout.png)

**🔌 Connection Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, ds→D11 (data), shcp→D12 (clock), stcp→D8 (latch)

**📚 Library:** `ShiftRegister74HC595 or built-in shiftOut()`

**Tags:** `shift-register` `74hc595` `serial-to-parallel` `io-expander`

---

## Power Prototyping

### MB102 Breadboard Power Supply

**Qty:** 2

> 💡 Breadboard power module with independent 3.3V/5V rails. Input: 6.5-12V barrel jack or USB. Max 700mA total. Use jumpers to select voltage per rail.

[🖼️ Image](https://components101.com/sites/default/files/components/Breadboard-Power-Supply-Module.jpg)

**⚠️ Warnings:**

- Do not use barrel jack and USB simultaneously
- Max 700mA total - don't overload

**🔧 Quick Fixes:**

- _No output_ → Check power switch

**Tags:** `power-supply` `breadboard` `3.3v` `5v` `prototyping`

---

### 830-Point Solderless Breadboard

**Qty:** 2

> 💡 Standard 830-point breadboard. Center channel for DIP ICs. 4 power rails (2 per side). Check rail continuity - some boards have breaks in the middle.

[🖼️ Image](https://components101.com/sites/default/files/components/Breadboard.jpg)

**Tags:** `breadboard` `prototyping` `solderless`

---

### 400-Point Mini Breadboard

**Qty:** 2

> 💡 Half-size 400-point breadboard. Good for small circuits or mounting on project bases.

[🖼️ Image](https://components101.com/sites/default/files/components/mini-breadboard.jpg)

**Tags:** `breadboard` `mini` `prototyping`

---

### Jumper Wire Assortment

**Qty:** 1

> 💡 Jumper wire kit with M-M, M-F, and F-F connectors. M-M for breadboard, M-F for Arduino headers to breadboard, F-F for sensor modules.

**Tags:** `jumper-wires` `prototyping` `connections`

---

### 9V Battery Barrel Jack Adapter

**Qty:** 1

> 💡 9V battery clip with 2.1mm barrel plug. Center positive - compatible with Arduino barrel jack. ~500mAh capacity typical.

**Tags:** `battery` `power` `portable`

---

## Shields

### L293D Motor Shield

**Qty:** 1

> 💡 Arduino motor shield with 2x L293D. Drives 4 DC motors OR 2 steppers + 2 servos. Uses pins 3-12. Use external power for motors >6V.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/L293D-Motor-Driver-Shield.png)

**🔧 Quick Fixes:**

- _Motors don't run_ → Check EXT_PWR jumper
- _Shield gets hot_ → Add heatsink

**📚 Library:** `Adafruit Motor Shield library (AFMotor)`

**Tags:** `shield` `motor-driver` `l293d` `dc-motor` `stepper`

---

### CNC Shield V3 (GRBL)

**Qty:** 1

> 💡 GRBL CNC shield for 3-4 axis control. Accepts A4988/DRV8825 drivers. Use with GRBL firmware for G-code control.

[🖼️ Image](https://blog.protoneer.co.nz/wp-content/uploads/2013/07/Arduino-CNC-Shield-V3.0-Parts.jpg)

**Tags:** `shield` `cnc` `grbl` `stepper` `3d-printer`

---

### Arduino Prototyping Shield

**Qty:** 1

> 💡 Proto shield with small breadboard area for custom circuits. Good for making permanent Arduino add-ons.

**Tags:** `shield` `prototyping` `breadboard`

---

### Screw Terminal Shield

**Qty:** 1

> 💡 Breaks out all Arduino Uno pins to screw terminals for secure, solderless connections.

**Tags:** `shield` `screw-terminal` `wiring`

---

### 2.8" TFT LCD Shield (ILI9341)

**Qty:** 1

> 💡 2.8" 240x320 color TFT with ILI9341 controller. SPI interface. Use Adafruit_GFX + Adafruit_ILI9341 libraries. Optional touch + SD card.

[📄 Datasheet](https://cdn-shop.adafruit.com/datasheets/ILI9341.pdf) | [🖼️ Image](https://cdn-shop.adafruit.com/970x728/1770-00.jpg)

**📚 Library:** `['Adafruit_ILI9341', 'Adafruit_GFX', 'MCUFRIEND_kbv']`

**Tags:** `shield` `tft` `display` `ili9341` `touchscreen`

---

## Audio

### Piezo Buzzer

**Qty:** 3

> 💡 Passive piezo buzzer. Use tone(pin, frequency) to play sounds. Loudest at resonant frequency (~2.4kHz).

[🖼️ Image](https://components101.com/sites/default/files/components/Piezo-Buzzer.jpg)

**📚 Library:** `tone() function built-in`

**Tags:** `buzzer` `piezo` `audio` `alarm`

---

### 8Ω Mini Speaker

**Qty:** 1

> 💡 8Ω 0.5W speaker. Requires amplifier - do NOT connect directly to MCU pins. Use PAM8403 module or transistor driver.

**Tags:** `speaker` `audio` `8ohm`

---

## Discrete Semiconductors

### TIP120 Darlington Transistor

**Qty:** 4

> 💡 NPN Darlington, 5A/60V. High gain (1000) - can drive from MCU pin via 1K resistor. ALWAYS use flyback diode with motors/solenoids.

[📄 Datasheet](https://www.onsemi.com/pdf/datasheet/tip120-d.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/TIP120-Pinout.png)

**🔧 Quick Fixes:**

- _Gets very hot_ → Add heatsink
- _Motor doesn't stop_ → Add flyback diode across motor

**Tags:** `transistor` `darlington` `tip120` `switching` `motor-control`

---

### 2N2222 NPN Transistor

**Qty:** 10

> 💡 General purpose NPN transistor. TO-92 pinout: E-B-C (flat side facing you). Good for switching up to 800mA loads.

[📄 Datasheet](https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf)

**Tags:** `transistor` `npn` `2n2222` `switching` `amplifier`

---

### IRF520 MOSFET Module

**Qty:** 2

> 💡 MOSFET module for PWM control of high-current loads. Works with 5V logic. Use for LED strips, motors up to 9A. Not ideal for 3.3V MCUs.

[📄 Datasheet](https://www.vishay.com/docs/91017/91017.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/IRF520-MOSFET-Driver-Module.jpg)

**⚠️ Warnings:**

- Not fully ON at 3.3V gate - use 5V MCU or logic level MOSFET
- Module handles gate drive, not bare MOSFET

**Tags:** `mosfet` `irf520` `pwm` `high-current` `led-strip`

---

## Capacitors

### Electrolytic Capacitor Assortment

**Qty:** 1

> 💡 Electrolytic caps 1-470uF. POLARIZED - long leg is positive. Common uses: 100uF on power rails, 10uF on sensor modules.

**Tags:** `capacitor` `electrolytic` `assortment`

---

### Ceramic Capacitor Assortment

**Qty:** 1

> 💡 Ceramic caps. Non-polarized. 100nF (104) most useful - place near every IC VCC pin for decoupling.

**Tags:** `capacitor` `ceramic` `assortment` `decoupling`

---

## Leds

### 5mm LED Assortment

**Qty:** 1

> 💡 5mm LEDs. Long leg = positive. Use resistor: 150Ω for red/yellow/green at 5V, 68Ω for blue/white at 5V.

**Tags:** `led` `5mm` `indicator`

---

### WS2812B Addressable LED Strip

**Qty:** 1

> 💡 60 LEDs/m addressable RGB strip. 5V power (60mA per LED = 3.6A for 60 LEDs!). Use FastLED library. Add 1000uF cap + 470Ω data resistor.

[📄 Datasheet](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf)

**🔧 Quick Fixes:**

- _First LED wrong color or flickering_ → Add 470Ω resistor
- _Random colors/glitching_ → Use level shifter

**📚 Library:** `['FastLED', 'Adafruit_NeoPixel']`

**Tags:** `led` `ws2812b` `neopixel` `addressable` `rgb`

---

### RGB LED (Common Cathode)

**Qty:** 5

> 💡 4-pin RGB LED. Longest leg = common cathode (GND). Use PWM on each color pin for mixing. analogWrite(pin, 0-255) for each color.

**Tags:** `led` `rgb` `common-cathode`

---

## Bulk Passives

### Resistor Assortment Kit

**Qty:** 1

> 💡 1/4W resistor kit. Most used: 220Ω (LEDs), 1K-10K (pull-ups, base resistors), 4.7K (I2C). Use color code calculator if unsure.

**Tags:** `resistor` `assortment` `passive`

---

### 10K Potentiometer

**Qty:** 5

> 💡 10K linear pot. As voltage divider: outer pins to GND/VCC, wiper to analog pin. Reads 0-1023 on Arduino.

**Tags:** `potentiometer` `variable-resistor` `analog-input`

---

### Tactile Pushbutton Assortment

**Qty:** 1

> 💡 Tactile buttons. Use INPUT_PULLUP mode, connect other side to GND. Button pressed = LOW. Add debounce (10-50ms delay).

**🔧 Quick Fixes:**

- _Multiple triggers per press_ → Add 10ms debounce delay

**📚 Library:** `Bounce2`

**Tags:** `button` `switch` `tactile` `input`

---

### Header Pin Assortment

**Qty:** 1

> 💡 2.54mm pitch headers. Break to length needed. Male for breadboard insertion, female for module sockets.

**Tags:** `headers` `connectors` `prototyping`

---

## Accessories

### Dupont Jumper Wires

**Qty:** 1

> 💡 Dupont jumper kit. M-M for breadboard, M-F for Arduino headers to breadboard, F-F for connecting modules with male headers.

**Tags:** `wires` `jumper` `dupont` `prototyping`

---

### USB Cable Set

**Qty:** 1

> 💡 USB cables for programming. USB-B for Uno/Mega, Mini-USB for Nano, Micro-USB for ESP boards.

**Tags:** `usb` `cable` `programming`

---

### DC Barrel Jack Connectors

**Qty:** 10

> 💡 2.1mm barrel jacks for Arduino-compatible power. Center positive standard.

**Tags:** `power` `barrel-jack` `connector`

---

### Heat Shrink Tubing Assortment

**Qty:** 1

> 💡 Heat shrink tubing kit. Use heat gun or lighter to shrink. Insulates solder joints and wire splices.

**Tags:** `heatshrink` `insulation` `protection`

---

### M3 Standoff/Spacer Kit

**Qty:** 1

> 💡 M3 standoff kit for mounting Arduino/PCBs. Standard Arduino hole spacing uses M3.

**Tags:** `standoffs` `mounting` `hardware`

---

### Header Pin Assortment

**Qty:** 1

> 💡 2.54mm header pins. Break to length. Male for breadboard insertion, female for socket connections.

**Tags:** `headers` `pins` `connectors`

---

### Prototype PCB Assortment

**Qty:** 1

> 💡 Perfboard PCBs for permanent projects. 2.54mm pitch matches headers and DIP ICs.

**Tags:** `pcb` `prototype` `perfboard`

---

### PCB Screw Terminal Blocks

**Qty:** 20

> 💡 Screw terminals for power and motor connections. Solder to PCB, accept bare wire.

**Tags:** `terminals` `screw` `connector`

---

### Alligator Clip Test Leads

**Qty:** 10

> 💡 Alligator clip leads for temporary connections and testing. Don't use for permanent wiring.

**Tags:** `clips` `test` `temporary`

---

### Multimeter Test Probes

**Qty:** 1

> 💡 Replacement/upgrade multimeter probes with interchangeable tips.

**Tags:** `probes` `multimeter` `testing`

---

## 📋 Quick Reference

### I2C Address Map

| Address | Device                         |
| ------- | ------------------------------ |
| `0x27`  | LCD1602 I2C (common)           |
| `0x3F`  | LCD1602 I2C (alternate)        |
| `0x57`  | AT24C32 EEPROM (DS3231 module) |
| `0x68`  | DS3231 RTC, MPU6050 (default)  |
| `0x69`  | MPU6050 (AD0=HIGH)             |

### Voltage Quick Check

**🔴 3.3V ONLY:** ESP32, ESP8266, RC522 RFID

### Library Quick Reference

| Use          | Library                                  |
| ------------ | ---------------------------------------- |
| servo        | `Servo.h (Arduino) / ESP32Servo (ESP32)` |
| stepper      | `AccelStepper`                           |
| lcd_parallel | `LiquidCrystal`                          |
| lcd_i2c      | `LiquidCrystal_I2C`                      |
| dht          | `DHT sensor library (Adafruit)`          |
| ultrasonic   | `NewPing`                                |
| mpu6050      | `MPU6050 by Electronic Cats`             |
| rtc          | `RTClib (Adafruit)`                      |
| rfid         | `MFRC522`                                |
