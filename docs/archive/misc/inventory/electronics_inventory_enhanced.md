# Electronics Component Inventory - Enhanced Edition

## Hyperdetailed Specifications with Dimensions, Pinouts & Image References

### Optimized for AI Parsing (Gemini/Google AI Studio)

---

## Microcontrollers & Development Boards

### Arduino Uno R3 (Qty: 2)

**Image Reference**: https://content.arduino.cc/assets/Pinout-UNOrev3_latest.pdf

- **Dimensions**: 68.6mm × 53.4mm × 15mm (with headers), Weight: 25g
- **Microcontroller**: ATmega328P (DIP-28 socket, removable)
- **USB-to-Serial**: ATmega16U2
- **Clock**: 16MHz ceramic resonator (CSTCE16M0V53-R0)
- **Flash Memory**: 32KB (0.5KB bootloader)
- **SRAM**: 2KB
- **EEPROM**: 1KB
- **Digital I/O**: 14 pins (6 PWM: D3, D5, D6, D9, D10, D11)
- **Analog Inputs**: 6 pins (A0-A5, 10-bit ADC)
- **I/O Current**: 20mA per pin, 200mA total max
- **Power Input**: USB-B, 2.1mm barrel jack (5.5mm OD, center-positive), Vin pin
- **Voltage**: 7-12V recommended via barrel jack, 6-12V via Vin
- **Regulated Outputs**: 5V (500mA via USB), 3.3V (50mA max)
- **ICSP Header**: 6-pin for direct programming
- **Built-in LED**: Pin 13
- **Datasheet**: https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf

**Pinout Reference**:

```
Digital Pins: D0(RX), D1(TX), D2, D3(PWM), D4, D5(PWM), D6(PWM), D7
              D8, D9(PWM), D10(PWM/SS), D11(PWM/MOSI), D12(MISO), D13(SCK/LED)
Analog Pins:  A0, A1, A2, A3, A4(SDA), A5(SCL)
Power Pins:   Vin, GND, GND, 5V, 3.3V, RESET, IOREF, NC
ICSP:         MISO, VCC, SCK, MOSI, RESET, GND
```

---

### Arduino Mega 2560 R3 (Qty: 1)

**Image Reference**: https://content.arduino.cc/assets/Pinout-Mega2560rev3_latest.pdf

- **Dimensions**: 101.52mm × 53.3mm × 15mm (with headers), Weight: 37g
- **Microcontroller**: ATmega2560 (TQFP-100 package)
- **USB-to-Serial**: ATmega16U2
- **Clock**: 16MHz crystal oscillator
- **Flash Memory**: 256KB (8KB bootloader)
- **SRAM**: 8KB
- **EEPROM**: 4KB
- **Digital I/O**: 54 pins (15 PWM)
- **Analog Inputs**: 16 pins (A0-A15, 10-bit ADC)
- **I/O Current**: 20mA per pin
- **Power Input**: USB-B, 2.1mm barrel jack (center-positive)
- **Voltage**: 7-12V recommended, 6-20V limits
- **UARTs**: 4 hardware serial ports (Serial, Serial1, Serial2, Serial3)
- **SPI**: MOSI(51), MISO(50), SCK(52), SS(53)
- **I2C**: SDA(20), SCL(21)
- **Datasheet**: https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf

**Pinout Reference**:

```
PWM Pins: 2-13, 44-46
Serial1: TX1(18), RX1(19)
Serial2: TX2(16), RX2(17)
Serial3: TX3(14), RX3(15)
External Interrupts: 2, 3, 18, 19, 20, 21
```

---

### ESP32 DevKit 38-Pin (Qty: 1)

**Image Reference**: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitC-v4-pinout.png

- **Dimensions**: ~55mm × 28mm × 12mm (varies by manufacturer)
- **Module**: ESP-WROOM-32
- **Processor**: Dual-core Xtensa LX6 @ 240MHz
- **Flash**: 4MB external SPI flash
- **SRAM**: 520KB
- **Wireless**: WiFi 802.11 b/g/n + Bluetooth 4.2 BLE + BR/EDR
- **GPIO**: 34 programmable pins (32 available, 6 input-only)
- **ADC**: 18 channels × 12-bit SAR (ADC1: 8ch, ADC2: 10ch - unavailable when WiFi active)
- **DAC**: 2 × 8-bit (GPIO25, GPIO26)
- **Touch**: 10 capacitive touch pins (TOUCH0-TOUCH9)
- **Interfaces**: 3× UART, 2× I2C, 3× SPI (flexible pin assignment)
- **Default I2C**: SDA(GPIO21), SCL(GPIO22)
- **Default SPI**: MOSI(23), MISO(19), SCK(18), CS(5)
- **Power**: 5V via USB/Vin, 3.3V logic levels
- **Current**: 80mA avg, 500mA peak (WiFi TX)
- **Datasheet**: https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf

**CRITICAL PIN WARNINGS**:

```
DO NOT USE: GPIO6-11 (connected to internal SPI flash)
INPUT ONLY: GPIO34, 35, 36, 39 (no pull-up/down, no output)
STRAPPING PINS (use with caution): GPIO0, 2, 5, 12, 15
```

---

### NodeMCU ESP8266 Amica V2 (Qty: 2)

**Image Reference**: https://mischianti.org/nodemcu-v2-and-v2-1-high-resolution-pinout-and-specs/

- **Dimensions**: 48mm × 26mm × 13mm (Amica V2)
- **Module**: ESP-12E/ESP-12F (ESP8266EX)
- **Processor**: Tensilica Xtensa LX106 @ 80/160MHz
- **Flash**: 4MB
- **SRAM**: 80KB user, 32KB instruction
- **Wireless**: WiFi 802.11 b/g/n
- **GPIO**: 17 pins total, 11 safely usable
- **ADC**: 1 × 10-bit (A0, 0-1V input, scaled to 0-3.3V on module)
- **PWM**: 4 channels
- **USB-UART**: CP2102 (Amica) or CH340G
- **Power**: 5V via USB/Vin, 3.3V logic
- **Row Spacing**: 23mm (0.9") - breadboard compatible

**Safe GPIO Pins**:

```
Best for I/O: GPIO4(D2), GPIO5(D1), GPIO12(D6), GPIO13(D7), GPIO14(D5)
Usable with care: GPIO0(D3), GPIO2(D4), GPIO15(D8), GPIO16(D0)
Reserved: GPIO1(TX), GPIO3(RX), GPIO6-11(flash)
I2C Default: SDA(GPIO4/D2), SCL(GPIO5/D1)
SPI: MOSI(GPIO13), MISO(GPIO12), SCK(GPIO14), CS(GPIO15)
```

---

### SparkFun Blynk Board (Qty: 2)

**Image Reference**: https://cdn.sparkfun.com/assets/learn_tutorials/4/9/4/Blynk_Board_Graphical_Datasheet_v01.png

- **Dimensions**: ~51mm × 23mm
- **SKU**: WRL-13794
- **Module**: ESP8266
- **Flash**: 4MB
- **Pre-loaded**: Blynk firmware
- **Onboard Features**:
  - WS2812 RGB LED (GPIO4)
  - 10KΩ NTC Thermistor (ADC)
  - Status LED
- **GPIO Breakout**: 9 pins (GPIO0, 2, 4, 5, 12, 13, 14, 15, 16)
- **Power**: Micro-USB, 3.3V regulated output
- **Guide**: https://learn.sparkfun.com/tutorials/blynk-board-project-guide

---

### OSEPP Uno R3 Plus (Qty: 1)

- **Dimensions**: ~68.6mm × 53.4mm (Arduino Uno form factor)
- **Model**: OSEPP UNO-03 Rev3.0
- **Microcontroller**: ATmega328P
- **Compatibility**: Full Arduino Uno R3 compatible
- **Enhanced Features**: Additional I/O header breakouts
- **Clock**: 16MHz
- **Memory**: 32KB Flash, 2KB SRAM, 1KB EEPROM

---

### DCCduino Nano (Qty: 1)

- **Dimensions**: 45mm × 18mm × 8mm
- **Microcontroller**: ATmega328P (SMD)
- **USB-UART**: CH340G (requires driver)
- **Clock**: 16MHz
- **Memory**: 32KB Flash, 2KB SRAM, 1KB EEPROM
- **Digital I/O**: 14 pins (6 PWM)
- **Analog Inputs**: 8 pins (A0-A7)
- **Power**: Mini-USB, Vin (7-12V)
- **Pin Spacing**: 0.1" (2.54mm), fits mini breadboard

---

## Shields & Expansion Boards

### Adafruit MONSTER M4SK (Qty: 1)

**Image Reference**: https://cdn-learn.adafruit.com/assets/assets/000/082/103/original/adafruit_products_M4SK_Pinout.png

- **Product ID**: Adafruit 4343
- **Processor**: ATSAMD51G19 Cortex-M4 @ 120MHz
- **Memory**: 512KB Flash, 192KB RAM, 8MB QSPI Flash
- **Displays**: 2× 240×240 IPS TFT (ST7789 driver)
- **Audio**: PDM microphone, Class D amplifier
- **Sensors**: Light sensor, 3× capacitive touch pads
- **Buttons**: 3 tactile buttons
- **Connectors**: STEMMA QT/Qwiic I2C, JST battery
- **Battery**: PKCELL LP552535 3.7V 400mAh LiPo (included)

---

### L293D Motor Shield HW-130 (Qty: 4)

**Image Reference**: https://cdn.shopify.com/s/files/1/0013/7203/3781/files/L293D_Motor_Shield_Pinout.jpg

- **Dimensions**: ~68mm × 55mm (Arduino shield form factor)
- **Driver ICs**: 2× L293D H-bridge + 74HC595 shift register
- **Motor Channels**: 4× DC motors OR 2× stepper motors + 2× servos
- **Motor Voltage**: 4.5-25V (separate from logic)
- **Current**: 600mA per channel continuous, 1.2A peak
- **Logic Voltage**: 5V (from Arduino)
- **Servo Connectors**: 2× 3-pin headers
- **Library**: AFMotor (Adafruit Motor Shield Library)

**Pin Usage on Arduino**:

```
Shift Register: D4(Latch), D7(Enable), D8(Data), D12(Clock)
PWM Motors: D3(M2), D5(M3), D6(M4), D11(M1)
Servos: D9, D10
```

---

### Velleman Ethernet Shield VMA04 (Qty: 1)

- **Dimensions**: ~68mm × 55mm (Arduino shield form factor)
- **Controller**: ENC28J60
- **Speed**: 10Mbps
- **Buffer**: 8KB TX/RX
- **Interface**: SPI
- **MAC**: Integrated
- **RJ45**: With integrated magnetics

**Pin Usage**:

```
SPI: D10(CS), D11(MOSI), D12(MISO), D13(SCK)
Interrupt: D2
```

---

### OSEPP TB6612 Motor Shield (Qty: 1)

- **Model**: OSEPP TBSHD-01
- **Driver**: TB6612FNG dual H-bridge
- **Current**: 1.2A continuous per channel, 3.2A peak
- **Motor Voltage**: 2.5-13.5V
- **Features**: PWM speed control, standby mode
- **Channels**: 2× DC motors or 1× stepper

---

## Sensors & Input Modules

### HC-SR04 Ultrasonic Sensor (Qty: 2)

**Image Reference**: https://cdn.sparkfun.com/assets/b/5/5/9/b/513ad482ce395fee3c000000.png

- **Dimensions**: 45mm × 20mm × 15mm (PCB)
- **Transducer Spacing**: ~25mm center-to-center
- **Operating Voltage**: 5V DC
- **Operating Current**: <15mA
- **Frequency**: 40kHz ultrasonic burst (8 cycles)
- **Range**: 2cm - 400cm
- **Effective Angle**: <15° cone
- **Accuracy**: ±3mm
- **Trigger**: 10μs HIGH pulse required
- **Echo**: Pulse width proportional to distance (150μs - 25ms)

**Pinout (left to right)**:

```
VCC - Trig - Echo - GND
```

**Distance Calculation**:

```
Distance(cm) = Echo_duration(μs) / 58
Distance(inch) = Echo_duration(μs) / 148
Minimum cycle: 60ms between measurements
```

---

### HC-SR501 PIR Motion Sensor (Qty: 1)

**Image Reference**: https://cdn-learn.adafruit.com/assets/assets/000/000/544/original/proximity_pir.png

- **Dimensions**: 32mm × 24mm (PCB), 50mm × 40mm × 18mm (with lens)
- **Sensing Element**: RE200B pyroelectric sensor
- **Controller IC**: BISS0001
- **Lens**: Fresnel (white dome)
- **Operating Voltage**: 4.5-20V DC (5V typical)
- **Quiescent Current**: <50μA
- **Output**: 3.3V TTL HIGH when motion detected
- **Detection Range**: 3-7m (adjustable via potentiometer)
- **Detection Angle**: 110° cone
- **Delay Time**: 5sec - 5min (adjustable via potentiometer)
- **Trigger Mode**: Single (L) or Repeatable (H) via jumper
- **Warm-up Time**: 30-60 seconds after power-on
- **Lock Time**: ~2.5 seconds after output goes LOW

**Pinout**:

```
VCC - OUT - GND (marked on PCB)
```

---

### DHT11 Temperature & Humidity Module (Qty: 1)

**Image Reference**: https://components101.com/sites/default/files/component_pin/DHT11-Pinout.jpg

- **Sensor Dimensions**: 15.5mm × 12mm × 5.5mm (bare sensor)
- **Module Dimensions**: ~30mm × 15mm (breakout with pull-up)
- **Operating Voltage**: 3.3-5.5V DC
- **Operating Current**: <2.5mA (measuring), <0.3mA (standby)
- **Temperature Range**: 0-50°C (±2°C accuracy)
- **Humidity Range**: 20-90% RH (±5% RH accuracy)
- **Resolution**: 1°C, 1% RH (8-bit integer + 8-bit decimal)
- **Sampling Rate**: 1Hz max (1 second between readings minimum)
- **Interface**: Single-wire proprietary protocol (NOT I2C)
- **Response Time**: <5s (temperature), <6s (humidity)
- **Pull-up Required**: 4.7K-10KΩ (built-in on module)
- **Datasheet**: https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-1143054.pdf

**Module Pinout (3-pin)**:

```
VCC (or +) - DATA (or S) - GND (or -)
```

---

### GY-521 MPU6050 6-DOF IMU (Qty: 1)

**Image Reference**: https://components101.com/sites/default/files/component_pin/MPU6050-Module-Pinout.jpg

- **Dimensions**: 21mm × 16mm × 3mm
- **Sensor IC**: MPU-6050 (InvenSense)
- **Operating Voltage**: 3-5V (onboard 3.3V regulator)
- **Logic Level**: 3.3V (5V tolerant inputs)
- **Interface**: I2C @ 400kHz
- **I2C Address**: 0x68 (default), 0x69 (AD0 HIGH)
- **ADC Resolution**: 16-bit per axis
- **Gyroscope Range**: ±250, ±500, ±1000, ±2000°/s (selectable)
- **Accelerometer Range**: ±2g, ±4g, ±8g, ±16g (selectable)
- **Built-in**: Temperature sensor, DMP (Digital Motion Processor)
- **FIFO Buffer**: 1024 bytes
- **Current**: ~3.9mA normal, 10μA sleep

**Pinout**:

```
VCC - GND - SCL - SDA - XDA - XCL - AD0 - INT
```

```
XDA/XCL: Auxiliary I2C for external magnetometer
AD0: I2C address select (LOW=0x68, HIGH=0x69)
INT: Interrupt output (data ready, FIFO overflow, etc.)
```

---

### DS3231 RTC Module with AT24C32 EEPROM (Qty: 1)

**Image Reference**: https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module-Pinout.png

- **Dimensions**: 38mm × 22mm × 14mm (with battery holder)
- **RTC IC**: DS3231 (Maxim/Analog Devices)
- **EEPROM**: AT24C32 (32Kbit / 4KB)
- **Oscillator**: Built-in TCXO (no external crystal)
- **Accuracy**: ±2ppm (0°C to +40°C), ±3.5ppm (-40°C to +85°C)
- **Operating Voltage**: 2.3-5.5V
- **Interface**: I2C @ 400kHz
- **RTC I2C Address**: 0x68 (fixed)
- **EEPROM I2C Address**: 0x57 (configurable 0x50-0x57 via A0-A2)
- **Battery**: CR2032 (or LIR2032 rechargeable)
- **Features**: 2× programmable alarms, temperature sensor (±3°C), 32.768kHz output
- **Backup Current**: <3μA

**Pinout (6-pin header)**:

```
32K - SQW - SCL - SDA - VCC - GND
```

```
32K: 32.768kHz output (open-drain, needs pull-up)
SQW: Square wave / Interrupt output (1Hz, 4kHz, 8kHz, 32kHz)
```

---

### RC522 RFID Module (Qty: 1)

- **Dimensions**: 40mm × 60mm
- **Controller IC**: MFRC522 (NXP)
- **Frequency**: 13.56MHz (MIFARE)
- **Interface**: SPI (up to 10MHz)
- **Operating Voltage**: 3.3V
- **Read Range**: ~50mm (card-dependent)
- **Supported Cards**: MIFARE S50, S70, Ultralight, DesFire
- **Includes**: S50 1KB card + keychain fob

**Pinout**:

```
SDA(CS) - SCK - MOSI - MISO - IRQ - GND - RST - 3.3V
```

---

### KY-023 Joystick Module (Qty: 2)

- **Dimensions**: ~34mm × 26mm × 32mm (with knob)
- **Potentiometers**: 2× 10KΩ (X and Y axes)
- **Button**: Center-push tactile switch (active LOW)
- **Operating Voltage**: 5V (3.3V compatible)
- **Output**: Analog X, Analog Y, Digital SW
- **Self-centering**: Spring return

**Pinout**:

```
GND - +5V - VRx - VRy - SW
```

---

### KY-040 Rotary Encoder (Qty: 1)

- **Dimensions**: ~18mm × 26mm × 32mm (with knob)
- **Detents**: 20 per revolution
- **Pulses**: 20 per revolution
- **Output**: Quadrature (A/B/SW)
- **Operating Voltage**: 5V
- **Button**: Integrated push switch

**Pinout**:

```
CLK(A) - DT(B) - SW - + - GND
```

---

### SG90 Micro Servo (Qty: 1)

**Image Reference**: https://components101.com/sites/default/files/component_pin/Servo-Motor-Dimensions.png

- **Dimensions**: 22.2mm × 11.8mm × 28.5mm (body)
- **Weight**: 9g
- **Torque**: 1.8 kg·cm @ 4.8V, 2.2 kg·cm @ 6V
- **Speed**: 0.1 sec/60° @ 4.8V
- **Rotation**: 180° (±90° from center)
- **Operating Voltage**: 4.8-6V
- **Stall Current**: ~500mA - 2A
- **PWM Frequency**: 50Hz (20ms period)
- **Pulse Width**: 1000-2000μs (some variants 500-2400μs)
- **Neutral Position**: 1500μs
- **Gear Type**: Nylon/plastic
- **Includes**: 3× servo horns/arms

**Wire Colors**:

```
Brown/Black: GND
Red: VCC (4.8-6V)
Orange/Yellow: Signal (PWM)
```

---

### 28BYJ-48 Stepper Motor + ULN2003 Driver (Qty: 1)

**Image Reference**: https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-Pinout.png

- **Motor Dimensions**: 28mm diameter × 20mm (body), 9mm shaft
- **Motor Weight**: ~37g
- **Driver Board Dimensions**: 28mm × 28mm × 20mm
- **Motor Type**: 4-phase, 5-wire unipolar
- **Operating Voltage**: 5V DC
- **Step Angle**: 5.625° (internal), 5.625°/64 (output shaft)
- **Gear Ratio**: 1:64
- **Steps per Revolution**: 64 (internal), 4096 (output shaft with half-stepping)
- **Current**: ~200mA per phase
- **Torque**: 0.3-0.35 kg·cm
- **Max Speed**: ~15 RPM
- **Driver IC**: ULN2003A (7× Darlington array)
- **Driver Features**: 4× LED step indicators, JST motor connector

**Motor Wire Colors**:

```
Blue: Coil 1 (IN1)
Pink: Coil 2 (IN2)
Yellow: Coil 3 (IN3)
Orange: Coil 4 (IN4)
Red: Common (VCC)
```

**Driver Pinout**:

```
IN1 - IN2 - IN3 - IN4 - GND - VCC (+ / -)
```

---

### LCD 1602 Module (Qty: 2)

**Image Reference**: https://components101.com/sites/default/files/component_pin/16x2-LCD-Module-Pinout.png

- **Dimensions**: 80mm × 36mm × 12.5mm
- **Display Area**: 56mm × 12mm
- **Characters**: 16 columns × 2 rows
- **Character Size**: 5×8 dot matrix
- **Controller**: HD44780 compatible
- **Operating Voltage**: 5V DC
- **Backlight**: Blue with white characters (or green with black)
- **Interface**: 4-bit or 8-bit parallel
- **Pin Count**: 16

**Pinout (left to right)**:

```
1-VSS(GND) 2-VDD(5V) 3-V0(Contrast) 4-RS 5-RW 6-E
7-D0 8-D1 9-D2 10-D3 11-D4 12-D5 13-D6 14-D7
15-LED+(5V) 16-LED-(GND)
```

**4-bit Mode Connections**:

```
RS, E, D4, D5, D6, D7 (RW tied to GND)
V0: 10K potentiometer wiper for contrast
```

---

### 2.8" TFT LCD Touch Shield ILI9341 (Qty: 1)

- **Display Size**: 2.8" diagonal
- **Resolution**: 240×320 RGB pixels
- **Colors**: 262K (18-bit) or 65K (16-bit)
- **Controller**: ILI9341
- **Display Area**: ~36.72mm × 48.96mm
- **Interface**: 8-bit parallel (shield) or SPI
- **Touch**: Resistive touchscreen
- **Card Slot**: microSD
- **Operating Voltage**: 3.3V logic (5V via onboard regulator)
- **Libraries**: MCUFRIEND_kbv, Adafruit GFX, Adafruit ILI9341

---

### MAX7219 8×8 LED Matrix Module (Qty: 1)

- **Dimensions**: ~32mm × 32mm × 13mm
- **Display**: 8×8 red LED dot matrix (64 LEDs)
- **Controller**: MAX7219
- **Interface**: SPI (cascadable)
- **Operating Voltage**: 5V
- **Features**: Built-in BCD decoder, adjustable brightness (16 levels)

**Pinout**:

```
VCC - GND - DIN - CS - CLK
```

---

### 4-Digit 7-Segment Display HS420561K-32 (Qty: 2)

- **Dimensions**: ~42mm × 24mm × 10mm
- **Digit Height**: 0.56" (14.2mm)
- **Type**: Common cathode
- **Color**: Red LED
- **Package**: 12-pin DIP
- **Forward Voltage**: 2.1V per segment
- **Forward Current**: 20mA per segment (recommended)
- **Display**: Multiplexed (requires external driver)

---

## Logic & Interface Components

### HW-221 Logic Level Converter (Qty: 2)

- **Dimensions**: ~15mm × 13mm
- **Channels**: 4 bidirectional
- **MOSFET**: BSS138 N-channel (per channel)
- **LV Side**: 1.8-3.3V logic
- **HV Side**: 3.3-5V logic
- **Speed**: I2C @ 400kHz, SPI @ 10MHz, UART @ 115200+
- **Applications**: ESP32/ESP8266 to 5V sensors

**Pinout**:

```
LV Side: LV, LV1, LV2, LV3, LV4, GND
HV Side: HV, HV1, HV2, HV3, HV4, GND
```

---

### 74HC595 Shift Register (Qty: 1)

- **Package**: 16-pin DIP
- **Type**: 8-bit serial-in, parallel-out
- **Operating Voltage**: 2-6V
- **Interface**: SPI-like (3-wire)
- **Features**: Output enable, latch, serial cascade out
- **Output Current**: 35mA per pin (source/sink)

**Pinout**:

```
Pin 1-7, 15: Q0-Q7 (parallel outputs)
Pin 8: GND
Pin 9: Q7' (serial out for cascading)
Pin 10: MR (master reset, active LOW)
Pin 11: SH_CP (shift clock)
Pin 12: ST_CP (storage/latch clock)
Pin 13: OE (output enable, active LOW)
Pin 14: DS (serial data input)
Pin 16: VCC
```

---

### 4×4 Membrane Keypad (Qty: 2)

- **Dimensions**: ~77mm × 69mm × 1mm
- **Keys**: 16 (0-9, A-D, \*, #)
- **Interface**: 8-pin matrix (4 rows × 4 columns)
- **Connector**: 8-pin ribbon cable (2.54mm pitch)
- **Mounting**: Adhesive backing
- **Operation**: Matrix scanning

---

## Actuators & Output

### L293D Motor Driver IC (Qty: 4)

- **Package**: 16-pin DIP
- **Channels**: 4 half-H bridges (2 full H-bridges)
- **Output Current**: 600mA continuous per channel, 1.2A peak
- **Motor Supply (VSS)**: 4.5-36V
- **Logic Supply (VS)**: 5V
- **Internal Clamp Diodes**: Yes (flyback protection)
- **Enable Pins**: 2 (controls 2 channels each)

**Pinout**:

```
1-Enable1,2  2-Input1  3-Output1  4-GND  5-GND  6-Output2  7-Input2  8-VSS
9-Enable3,4  10-Input3  11-Output3  12-GND  13-GND  14-Output4  15-Input4  16-VS
```

---

### 5V Relay Module (Qty: 1)

- **Dimensions**: ~50mm × 26mm × 18.5mm
- **Relay**: SRD-05VDC-SL-C
- **Contacts**: 10A @ 250VAC, 10A @ 30VDC
- **Coil Voltage**: 5V DC
- **Isolation**: Optocoupler
- **Trigger**: Active-LOW (configurable)
- **LED**: Status indicator

**Terminals**:

```
Control: VCC, GND, IN (signal)
Load: COM, NO (normally open), NC (normally closed)
```

---

## Power & Prototyping

### MB102 Breadboard Power Supply (Qty: 2)

- **Dimensions**: ~52mm × 33mm × 25mm
- **Input**: DC barrel jack (6.5-12V) OR USB
- **Outputs**: 3.3V and 5V (selectable per rail via jumpers)
- **Max Current**: 700mA total
- **Features**: On/off switch, power LED
- **Mounting**: Plugs directly into breadboard power rails

---

### 830-Point Breadboard (Qty: 6)

- **Dimensions**: ~165mm × 55mm × 10mm
- **Tie Points**: 830 (630 terminal + 200 power rail)
- **Pitch**: 2.54mm (0.1")
- **Wire Gauge**: 20-29 AWG
- **Power Rails**: 2 per side (4 total)

---

### 400-Point Mini Breadboard (Qty: 1)

- **Dimensions**: ~85mm × 55mm × 10mm
- **Tie Points**: 400
- **Features**: Interlockable with other mini boards

---

## Discrete Components

### PN2222A NPN Transistor (Qty: 1)

- **Package**: TO-92
- **Type**: NPN BJT
- **Vceo**: 40V
- **Ic max**: 600mA
- **hFE**: 100-300
- **Application**: General purpose switching/amplification

### S8050 NPN Transistor (Qty: 1)

- **Package**: TO-92
- **Type**: NPN BJT
- **Vceo**: 25V
- **Ic max**: 500mA
- **hFE**: 40-400
- **Application**: Medium power switching

### 10KΩ Potentiometer (Qty: 2)

- **Value**: 10KΩ (B10K linear taper)
- **Type**: Single-turn, panel mount
- **Pins**: 3
- **Shaft**: Knurled, 6mm diameter
- **Tolerance**: ±20%

---

## Capacitors

### 22pF Ceramic Capacitor (Qty: 3)

- **Value**: 22pF
- **Dielectric**: NPO/C0G (stable)
- **Voltage**: 50V
- **Tolerance**: ±5%
- **Application**: Crystal oscillator load capacitors (16MHz ATmega)

### 100nF Ceramic Capacitor (Qty: 3)

- **Value**: 100nF (0.1μF)
- **Marking**: "104" (10 × 10^4 pF)
- **Dielectric**: X7R or Y5V
- **Voltage**: 50V typical
- **Application**: Decoupling/bypass

---

## LEDs

| Type       | Qty | Wavelength | Vf             | Current   | Intensity |
| ---------- | --- | ---------- | -------------- | --------- | --------- |
| 5mm Red    | 5   | 625nm      | 1.8-2.2V       | 20mA      | ~200mcd   |
| 5mm Green  | 5   | 520-525nm  | 2.0-2.4V       | 20mA      | ~200mcd   |
| 5mm Blue   | 5   | 465-470nm  | 3.0-3.4V       | 20mA      | ~150mcd   |
| 5mm Yellow | 5   | 585-590nm  | 1.8-2.2V       | 20mA      | ~200mcd   |
| 5mm White  | 5   | 6000-6500K | 3.0-3.4V       | 20mA      | ~300mcd   |
| 5mm Clear  | 5   | Various    | Various        | 20mA      | High      |
| 5mm RGB    | 5   | Multi      | R:2V G:3V B:3V | 20mA each | Variable  |

---

## Audio Components

### Active Piezo Buzzer (Qty: 1)

- **Operating Voltage**: 5V DC
- **Frequency**: ~2.5kHz (built-in oscillator)
- **Pins**: 2 (+ marked)
- **Operation**: Apply DC voltage = continuous tone

### Passive Piezo Buzzer (Qty: 1)

- **Operating Voltage**: 3-5V
- **Frequency**: Determined by input signal
- **Pins**: 2
- **Operation**: Requires PWM/square wave input

---

## Common Interface Pin Reference

### I2C Devices (SDA, SCL):

- GY-521 MPU6050 @ 0x68
- DS3231 RTC @ 0x68
- AT24C32 EEPROM @ 0x57
- LCD 1602 (with I2C backpack) @ 0x27 or 0x3F

### SPI Devices (MOSI, MISO, SCK, CS):

- RC522 RFID
- MAX7219 LED Matrix
- ENC28J60 Ethernet
- ILI9341 TFT Display

### Single-Wire:

- DHT11 (proprietary protocol)

### PWM Outputs:

- SG90 Servo (50Hz, 1-2ms pulse)
- Passive Buzzer (frequency = pitch)
- Motor Speed Control (L293D enable pins)

### Analog Inputs:

- Potentiometers, Joysticks
- Photoresistor (voltage divider)
- Water sensor, Sound sensor
- NTC Thermistors

---

## Voltage Quick Reference

| Device           | Logic | Power  | Notes             |
| ---------------- | ----- | ------ | ----------------- |
| Arduino Uno/Mega | 5V    | 7-12V  | 5V tolerant       |
| ESP32            | 3.3V  | 5V USB | NOT 5V tolerant!  |
| ESP8266/NodeMCU  | 3.3V  | 5V USB | NOT 5V tolerant!  |
| RC522 RFID       | 3.3V  | 3.3V   | Use level shifter |
| ILI9341 TFT      | 3.3V  | 3.3V   | Use level shifter |
| Most sensors     | 5V    | 5V     | Check datasheet   |

**CRITICAL**: Use HW-221 level shifters when connecting 3.3V devices (ESP32, ESP8266) to 5V sensors/displays!

---

_Last Updated: December 2024_  
_Inventory Owner: Tyler_  
_For use with: Google AI Studio Wiring Diagram Application_
