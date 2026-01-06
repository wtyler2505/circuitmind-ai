# 🔧 Electronics Inventory - Tier 1 Enhanced

**Version:** 3.0-tier1-enhanced
**Last Updated:** 2025-12-31
**Total Components:** 53
**Purpose:** Claude Code CLI Wiring Diagram Application

## ✅ Tier 1 Enhancements Applied

| Enhancement               | Status |
| ------------------------- | ------ |
| Datasheet URLs            | ✅     |
| Product/Pinout Images     | ✅     |
| Standardized Field Names  | ✅     |
| Common Issues & Solutions | ✅     |
| Arduino Libraries         | ✅     |
| Wiring Rules + Templates  | ✅     |
| Tags & Use Cases          | ✅     |
| AI Summaries              | ✅     |

---

## 📑 Table of Contents

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

---

## Microcontrollers

### Arduino Uno R3

**Qty:** 2

> 💡 5V Arduino microcontroller with ATmega328P, 14 digital I/O (6 PWM), 6 analog inputs. Most widely supported, beginner-friendly. Use USB-B or 7-12V barrel jack for power.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf) | [🖼️ Image](https://store.arduino.cc/cdn/shop/products/A000066_03.front_934x700.jpg) | [📌 Pinout](https://content.arduino.cc/assets/Pinout-UNOrev3_latest.png)

| Spec    | Value      |
| ------- | ---------- |
| Voltage | 5V         |
| MCU     | ATmega328P |

**⚠️ Warnings:**

- Do not exceed 20mA per I/O pin
- Total current from all I/O pins should not exceed 200mA
- Vin must be 7-12V; lower causes instability, higher causes overheating

**🔧 Troubleshooting:**

- _Board not detected by computer_ → Try different USB cable with data lines
- _Sketch uploads but doesn't run_ → Add Serial.print debugging

**Tags:** `microcontroller` `arduino` `atmega328p` `5v` `beginner-friendly` `usb`

---

### Arduino Mega 2560 R3

**Qty:** 1

> 💡 5V Arduino with ATmega2560, 54 digital I/O (15 PWM), 16 analog inputs, 4 hardware serial ports. Use for projects needing many pins or multiple serial devices.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf) | [🖼️ Image](https://store.arduino.cc/cdn/shop/products/A000067_03.front_934x700.jpg) | [📌 Pinout](https://content.arduino.cc/assets/Pinout-Mega2560rev3_latest.png)

| Spec    | Value      |
| ------- | ---------- |
| Voltage | 5V         |
| MCU     | ATmega2560 |

**🔧 Troubleshooting:**

- _SPI conflicts with pins 50-53_ → Reserve pins 50-53 for SPI devices only
- _Serial conflicts_ → Use Serial.begin() for USB, Serial1/2/3.begin() for hardware UARTs

**Tags:** `microcontroller` `arduino` `atmega2560` `5v` `many-pins` `4-serial`

---

### ESP32 DevKit 38-Pin

**Qty:** 1

> 💡 3.3V dual-core WiFi+Bluetooth MCU. NOT 5V tolerant - requires level shifter for 5V sensors. Avoid GPIO6-11 (flash). Input-only: GPIO34/35/36/39. Powerful but requires attention to pin selection.

[📄 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf) | [🖼️ Image](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitc-functional-overview.jpg) | [📌 Pinout](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_images/esp32-devkitC-v4-pinout.png)

| Spec     | Value     |
| -------- | --------- |
| Voltage  | 3.3V      |
| Wireless | WiFi + BT |

**⚠️ Warnings:**

- NOT 5V TOLERANT - use level shifter for 5V sensors
- GPIO6-11 are reserved for internal flash - DO NOT USE
- GPIO34/35/36/39 are input-only

**🔧 Troubleshooting:**

- _Won't enter upload mode_ → Hold BOOT button while pressing EN/RST
- _Brownout detector triggered_ → Use powered USB hub

**Tags:** `microcontroller` `esp32` `wifi` `bluetooth` `3.3v` `dual-core`

---

### NodeMCU ESP8266 Amica V2

**Qty:** 2

> 💡 3.3V WiFi MCU, breadboard-friendly (23mm row spacing). NOT 5V tolerant. Safe pins: D1/D2/D5/D6/D7. Avoid D3/D4/D8 for sensors (boot-sensitive). Only 1 ADC.

[📄 Datasheet](https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf) | [🖼️ Image](https://cdn.shopify.com/s/files/1/0672/9409/products/NodeMCU_ESP8266_Board_1024x1024.jpg) | [📌 Pinout](https://randomnerdtutorials.com/wp-content/uploads/2019/05/ESP8266-NodeMCU-kit-12-E-pinout-gpio-pin.png)

| Spec     | Value             |
| -------- | ----------------- |
| Voltage  | 3.3V              |
| Wireless | WiFi 802.11 b/g/n |

**⚠️ Warnings:**

- NOT 5V TOLERANT - 3.3V logic only
- D3/D4/D8 affect boot mode - don't pull LOW at startup
- GPIO6-11 reserved for flash - DO NOT USE

**🔧 Troubleshooting:**

- _Won't boot with sensor on D3/D4/D8_ → Move sensor to D1/D2/D5/D6/D7
- _CH340 driver not found_ → Download CH340 driver from manufacturer

**Tags:** `microcontroller` `esp8266` `wifi` `3.3v` `iot` `nodemcu`

---

### SparkFun Blynk Board

**Qty:** 2

> 💡 ESP8266 board with pre-loaded Blynk firmware, onboard WS2812 RGB LED on GPIO4, and 10K thermistor on ADC. Quick IoT prototyping.

[📄 Datasheet](https://cdn.sparkfun.com/assets/learn_tutorials/4/9/4/Blynk_Board_Graphical_Datasheet_v01.png) | [🖼️ Image](https://cdn.sparkfun.com/assets/parts/1/1/2/4/5/13794-01.jpg)

| Spec    | Value |
| ------- | ----- |
| Voltage | 3.3V  |

**Tags:** `esp8266` `blynk` `rgb-led` `iot` `preloaded`

---

### DCCduino Nano

**Qty:** 1

> 💡 Arduino Nano clone with CH340G USB chip. Requires CH340 driver. 5V logic, breadboard-friendly form factor.

[📄 Datasheet](https://docs.arduino.cc/resources/datasheets/A000005-datasheet.pdf) | [🖼️ Image](https://www.electronicshub.org/wp-content/uploads/2021/01/Arduino-Nano-Pinout-1.jpg)

| Spec    | Value      |
| ------- | ---------- |
| Voltage | 5V         |
| MCU     | ATmega328P |

**⚠️ Warnings:**

- Requires CH340G driver installation

**🔧 Troubleshooting:**

- _Not recognized by computer_ → Install CH340G driver from WCH website

**Tags:** `arduino` `nano` `clone` `ch340` `breadboard`

---

## Sensors

### HC-SR04 Ultrasonic Sensor

**Qty:** 2

> 💡 5V ultrasonic distance sensor, 2-400cm range. Requires 2 digital pins (Trig output, Echo input). Use voltage divider on Echo for 3.3V MCUs. Min 60ms between readings.

[📄 Datasheet](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf) | [🖼️ Image](https://cdn.sparkfun.com/assets/parts/6/4/6/4/11308-01.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR04-Ultrasonic-Sensor-Pinout.png)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**⚠️ Warnings:**

- Echo pin outputs 5V - use voltage divider for 3.3V MCUs
- Minimum 60ms between measurements to avoid echo interference
- 10μs minimum trigger pulse required

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, trig→D9, echo→D10
- **Esp32:** vcc→VIN (5V), gnd→GND, trig→GPIO23, echo→GPIO22 via voltage divider (Echo outputs 5V!)

**🔧 Troubleshooting:**

- _Always reads 0 or max distance_ → Ensure 10μs HIGH trigger pulse
- _Inconsistent/jumping readings_ → Add 100nF decoupling cap

**📚 Library:** `NewPing`

**Tags:** `ultrasonic` `distance` `proximity` `ranging` `5v`

---

### HC-SR501 PIR Motion Sensor

**Qty:** 1

> 💡 PIR motion sensor, 3-7m adjustable range, 110° cone. Output is 3.3V (safe for all MCUs). Requires 60s warmup. Use interrupt pin for responsive detection.

[📄 Datasheet](https://www.mpja.com/download/31227sc.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR501-PIR-Motion-Sensor-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/HC-SR501-PIR-Sensor-Pinout.png)

| Spec    | Value   |
| ------- | ------- |
| Voltage | 4.5-20V |

**⚠️ Warnings:**

- Allow 60 seconds warmup after power-on
- 2.5 second lockout after output goes LOW
- Avoid mounting near heat sources or AC vents

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, out→D2 (interrupt capable)
- **Esp32:** vcc→VIN (5V), gnd→GND, out→GPIO13 (any input pin)

**🔧 Troubleshooting:**

- _False triggers_ → Shield from air currents
- _Doesn't detect movement_ → Wait 60 seconds after power-on

**📚 Library:** `None required - simple digital read`

**Tags:** `pir` `motion` `infrared` `presence` `security`

---

### DHT11 Temperature & Humidity Module

**Qty:** 1

> 💡 Temperature (0-50°C ±2°C) and humidity (20-90% ±5%) sensor. Single-wire protocol (NOT I2C). Max 1 reading per second. Use DHT library.

[📄 Datasheet](https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-1143054.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/DHT11-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/DHT11-Pinout.jpg)

| Spec      | Value                 |
| --------- | --------------------- |
| Voltage   | 3.3-5.5V              |
| Interface | single-wire (NOT I2C) |

**⚠️ Warnings:**

- Minimum 1 second between readings (1Hz max)
- Use 3.3V power for 3.3V MCUs
- Pull-up resistor required if not on module

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, data→D2
- **Esp32:** vcc→3.3V, gnd→GND, data→GPIO4

**🔧 Troubleshooting:**

- _Always returns NaN or checksum errors_ → Add 10K pull-up to data line
- _Readings are wildly inaccurate_ → Read no more than once per 2 seconds

**📚 Library:** `DHT sensor library by Adafruit`

**Tags:** `temperature` `humidity` `environmental` `dht11` `1-wire`

---

### GY-521 MPU6050 6-DOF IMU

**Qty:** 1

> 💡 6-axis IMU (3-axis accel + 3-axis gyro) on I2C bus. Address 0x68 (AD0=GND) or 0x69 (AD0=HIGH). Has onboard DMP for sensor fusion. Use I2C scanner to verify connection.

[📄 Datasheet](https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/GY-521-MPU6050-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/MPU6050-Module-Pinout.jpg)

| Spec      | Value |
| --------- | ----- |
| Voltage   | 3-5V  |
| Interface | I2C   |

**⚠️ Warnings:**

- Module has onboard 3.3V regulator - safe for 5V VCC
- I2C lines are 3.3V - use level shifter if MCU needs 5V I2C
- AD0 pin selects address: GND=0x68, VCC=0x69

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, scl→A5, sda→A4
- **Esp32:** vcc→3.3V, gnd→GND, scl→GPIO22, sda→GPIO21

**🔧 Troubleshooting:**

- _I2C device not found_ → Run I2C scanner
- _Gyro drift_ → Implement calibration routine

**📚 Library:** `MPU6050 by Electronic Cats or I2Cdevlib`

**Tags:** `imu` `accelerometer` `gyroscope` `6-dof` `motion` `i2c`

---

### DS3231 RTC Module

**Qty:** 1

> 💡 Precision RTC (±2ppm) with I2C at 0x68. Includes 4KB EEPROM at 0x57 and CR2032 backup. NOTE: Same I2C address as MPU6050 - change MPU AD0 if using both.

[📄 Datasheet](https://datasheets.maximintegrated.com/en/ds/DS3231.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/DS3231-RTC-Module-Pinout.png)

| Spec      | Value    |
| --------- | -------- |
| Voltage   | 2.3-5.5V |
| Interface | I2C      |

**⚠️ Warnings:**

- RTC address 0x68 conflicts with MPU6050 default - change MPU AD0 if using both
- Install CR2032 battery for backup
- Some modules charge the battery - use non-rechargeable CR2032 or remove charging diode

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, scl→A5, sda→A4
- **Esp32:** vcc→3.3V, gnd→GND, scl→GPIO22, sda→GPIO21

**🔧 Troubleshooting:**

- _Time resets after power loss_ → Install fresh CR2032 with + facing up
- _I2C address conflict with MPU6050_ → Change MPU6050 to 0x69 by connecting AD0 to VCC

**📚 Library:** `RTClib by Adafruit`

**Tags:** `rtc` `real-time-clock` `time` `i2c` `eeprom` `battery-backup`

---

### RC522 RFID Module

**Qty:** 1

> 💡 13.56MHz RFID reader on SPI bus. 3.3V ONLY - will be damaged by 5V! Includes card and keychain fob. Use MFRC522 library.

[📄 Datasheet](https://www.nxp.com/docs/en/data-sheet/MFRC522.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/RFID-Reader-Module.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/RFID-RC522-Reader-Writer-Module-Pinout.png)

| Spec      | Value |
| --------- | ----- |
| Voltage   | 3.3V  |
| Interface | SPI   |

**⚠️ Warnings:**

- VCC is 3.3V ONLY - 5V will damage the module
- SPI pins are 3.3V tolerant
- Antenna coil is fragile - don't bend PCB

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→3.3V, gnd→GND, sck→D13, mosi→D11, miso→D12
- **Esp32:** vcc→3.3V, gnd→GND, sck→GPIO18, mosi→GPIO23, miso→GPIO19

**🔧 Troubleshooting:**

- _Card not detected_ → Verify SPI connections
- _Module damaged/not responding_ → Replace module - 5V damage is permanent

**📚 Library:** `MFRC522 by GithubCommunity`

**Tags:** `rfid` `nfc` `13.56mhz` `mifare` `spi` `3.3v`

---

### KY-023 Joystick Module

**Qty:** 2

> 💡 Dual-axis analog joystick with center button. Uses 2 analog pins + 1 digital. Center position ~512 on Arduino. Button is active LOW.

[🖼️ Image](https://components101.com/sites/default/files/components/KY023-Joystick-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/KY-023-Joystick-Module-Pinout.png)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, vrx→A0, vry→A1, sw→D2
- **Esp32:** vcc→3.3V, gnd→GND, vrx→GPIO34, vry→GPIO35, sw→GPIO13

**🔧 Troubleshooting:**

- _Center position not at 512_ → Calibrate in software - read center position at startup

**📚 Library:** `None required - use analogRead()`

**Tags:** `joystick` `analog` `input` `game-controller`

---

### KY-040 Rotary Encoder

**Qty:** 1

> 💡 20-detent rotary encoder with quadrature output and push button. Use interrupt pins for CLK/DT for reliable counting.

[🖼️ Image](https://components101.com/sites/default/files/components/KY040-Rotary-Encoder.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/KY-040-Rotary-Encoder-Pinout.png)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**🔌 Wiring Templates:**

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

| Spec    | Value  |
| ------- | ------ |
| Voltage | 3.3-5V |

**⚠️ Warnings:**

- Probes corrode quickly in wet soil - don't leave powered constantly

**Tags:** `soil` `moisture` `plant` `garden`

---

### Flame Sensor Module

**Qty:** 1

> 💡 IR flame sensor. Detects 760-1100nm wavelength (fire). D0 for threshold detection, A0 for intensity.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/Flame-Sensor-Module-Pinout.png)

| Spec    | Value  |
| ------- | ------ |
| Voltage | 3.3-5V |

**Tags:** `flame` `fire` `ir` `safety`

---

### Water Level Sensor

**Qty:** 1

> 💡 Conductive water level sensor. Analog output proportional to water height. Power intermittently to reduce electrolysis.

| Spec    | Value |
| ------- | ----- |
| Voltage | 3-5V  |

**Tags:** `water` `level` `liquid` `analog`

---

### KY-038 Sound Sensor

**Qty:** 1

> 💡 Sound detection module. A0 for analog level, D0 for threshold detection (clap sensor). Adjust sensitivity with pot.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/KY-038-Sound-Sensor-Module.jpg)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**Tags:** `sound` `microphone` `audio` `clap`

---

### IR Obstacle Avoidance Sensor

**Qty:** 2

> 💡 IR proximity sensor. Output LOW when obstacle in range. Adjust range with pot. Works 2-30cm typical.

[🖼️ Image](https://components101.com/sites/default/files/component_pin/IR-Sensor-Module-Pinout.jpg)

| Spec    | Value  |
| ------- | ------ |
| Voltage | 3.3-5V |

**Tags:** `ir` `obstacle` `proximity` `digital`

---

### SW-520D Tilt Switch

**Qty:** 3

> 💡 Ball-type tilt switch. Closes circuit when tilted past threshold. Use INPUT_PULLUP, reads LOW when tilted.

| Spec    | Value |
| ------- | ----- |
| Voltage | 12V   |

**Tags:** `tilt` `switch` `orientation` `angle`

---

## Actuators

### SG90 Micro Servo

**Qty:** 1

> 💡 180° micro servo, 9g. PWM control: 1ms=0°, 1.5ms=90°, 2ms=180°. Use external 5V supply for multiple servos. Brown=GND, Red=VCC, Orange=Signal.

[📄 Datasheet](http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/Servo-Motor-SG90.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/Servo-Motor-Dimensions.png)

| Spec    | Value  |
| ------- | ------ |
| Voltage | 4.8-6V |

**⚠️ Warnings:**

- Stall current can exceed 500mA - use external power for multiple servos
- Never power from MCU 5V pin if using more than 1 servo
- Common GND between servo power supply and MCU required

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, signal→D9 (PWM)
- **Esp32:** vcc→5V external, gnd→common GND, signal→GPIO13

**🔧 Troubleshooting:**

- _Servo jitters or doesn't hold position_ → Use separate 5V 1A+ supply
- _Arduino resets when servo moves_ → Power servo from external 5V supply, share GND with Arduino

**📚 Library:** `Servo.h (built-in)`

**Tags:** `servo` `motor` `pwm` `position-control` `actuator`

---

### 28BYJ-48 Stepper Motor with ULN2003 Driver

**Qty:** 1

> 💡 5V geared stepper, 4096 steps/rev, ~15 RPM max. Requires 4 digital pins + ULN2003 driver. Use external 5V power. AccelStepper library for smooth motion.

[📄 Datasheet](https://components101.com/sites/default/files/component_datasheet/28byj48-stepper-motor-datasheet.pdf) | [🖼️ Image](https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-With-ULN2003-Driver.jpg) | [📌 Pinout](https://lastminuteengineers.com/wp-content/uploads/arduino/28BYJ-48-Stepper-Motor-Pinout.png)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**⚠️ Warnings:**

- Motor draws ~240mA - use external power supply
- Driver LEDs show which coil is active
- Gear train makes motor slow but high torque

**🔌 Wiring Templates:**

- **Arduino Uno:** driver_vcc→External 5V (not Arduino 5V!), driver_gnd→GND (common), in1→D8, in2→D9, in3→D10
- **Esp32:** driver_vcc→5V external, driver_gnd→common GND, in1→GPIO13, in2→GPIO12, in3→GPIO14

**🔧 Troubleshooting:**

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

**🔧 Troubleshooting:**

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

**🔌 Wiring Templates:**

- **Arduino Uno:** vcc→5V, gnd→GND, in→D7

**🔧 Troubleshooting:**

- _Relay clicks but doesn't switch load_ → Wire load between COM and NO or NC as needed
- _Arduino resets when relay switches_ → Module has built-in protection but add 100uF cap on Arduino 5V

**Tags:** `relay` `switch` `high-voltage` `ac-control` `isolation`

---

## Displays

### LCD 1602 Module

**Qty:** 2

> 💡 16x2 character LCD. Parallel mode needs 6+ pins; I2C backpack needs only 2 (SDA/SCL). MUST adjust contrast pot (V0) or display appears blank.

[📄 Datasheet](https://www.sparkfun.com/datasheets/LCD/HD44780.pdf) | [🖼️ Image](https://components101.com/sites/default/files/components/16x2-LCD-Module.jpg) | [📌 Pinout](https://components101.com/sites/default/files/component_pin/16x2-LCD-Module-Pinout.png)

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**⚠️ Warnings:**

- Contrast (V0) must be adjusted - display may appear blank without it
- Use 10K potentiometer between VDD and VSS, wiper to V0
- I2C backpack reduces wiring from 12+ pins to 4 pins

**🔌 Wiring Templates:**

- **Arduino Uno 4Bit:** vss→GND, vdd→5V, v0→10K pot to GND, rs→D12, rw→GND
- **With I2C Backpack:** vcc→5V, gnd→GND, sda→A4, scl→A5, i2c_address→0x27 or 0x3F

**🔧 Troubleshooting:**

- _Display shows boxes or is blank_ → Adjust V0 potentiometer until text visible
- _Random characters or garbled display_ → Check wiring matches code

**Tags:** `lcd` `display` `16x2` `hd44780` `text-display`

---

### MAX7219 8x8 LED Matrix Module

**Qty:** 1

> 💡 8x8 LED matrix with MAX7219 driver. SPI interface, cascadable for larger displays. 5V operation, 16 brightness levels.

[📄 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf) | [🖼️ Image](https://components101.com/sites/default/files/component_pin/MAX7219-LED-Dot-Matrix.jpg)

| Spec      | Value |
| --------- | ----- |
| Voltage   | 5V    |
| Interface | SPI   |

**🔌 Wiring Templates:**

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

| Spec    | Value |
| ------- | ----- |
| Voltage | 2-6V  |

**🔌 Wiring Templates:**

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

**🔧 Troubleshooting:**

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

**🔧 Troubleshooting:**

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

| Spec      | Value                 |
| --------- | --------------------- |
| Interface | SPI or 8-bit parallel |

**📚 Library:** `['Adafruit_ILI9341', 'Adafruit_GFX', 'MCUFRIEND_kbv']`

**Tags:** `shield` `tft` `display` `ili9341` `touchscreen`

---

## Audio

### Piezo Buzzer

**Qty:** 3

> 💡 Passive piezo buzzer. Use tone(pin, frequency) to play sounds. Loudest at resonant frequency (~2.4kHz).

[🖼️ Image](https://components101.com/sites/default/files/components/Piezo-Buzzer.jpg)

| Spec    | Value |
| ------- | ----- |
| Voltage | 3-24V |

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

**🔧 Troubleshooting:**

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

| Spec    | Value |
| ------- | ----- |
| Voltage | 5V    |

**🔧 Troubleshooting:**

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

**🔧 Troubleshooting:**

- _Multiple triggers per press_ → Add 10ms debounce delay

**📚 Library:** `Bounce2`

**Tags:** `button` `switch` `tactile` `input`

---

### Header Pin Assortment

**Qty:** 1

> 💡 2.54mm pitch headers. Break to length needed. Male for breadboard insertion, female for module sockets.

**Tags:** `headers` `connectors` `prototyping`

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

### ⚠️ Voltage Warnings

**3.3V ONLY:** ESP32, ESP8266, RC522 RFID

### 📚 Library Quick Reference

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
