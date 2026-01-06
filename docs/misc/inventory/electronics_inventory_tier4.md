# ⚡ Electronics Inventory - Tier 4 Complete

**Version:** 3.3-tier4-enhanced
**Last Updated:** 2025-12-31
**Total Components:** 63
**Purpose:** AI-Powered Wiring Diagram Generation System

## 📊 Complete Enhancement Summary

| Tier       | Focus      | Enhancements                                                                         |
| ---------- | ---------- | ------------------------------------------------------------------------------------ |
| **Tier 1** | Foundation | Datasheets, images, wiring rules, issues, libraries, tags, AI summaries              |
| **Tier 2** | Content    | Project bundles, relationships, ASCII pinouts, code snippets, templates              |
| **Tier 3** | Advanced   | Calibration, testing, taxonomy, failure modes, ESD, confidence, storage              |
| **Tier 4** | Validation | Power budget, pin allocation, validation rules, wire colors, substitutes, protection |

### Tier 4 Enhancements Applied

| Enhancement             | Details     |
| ----------------------- | ----------- |
| Power Budget Data       | ✅ Complete |
| Pin Allocation Rules    | ✅ Complete |
| Wiring Validation Rules | ✅ Complete |
| Wire Color Standards    | ✅ Complete |
| Component Substitutes   | ✅ Complete |
| Protection Requirements | ✅ Complete |

---

## ⚡ Power Budget Data

### MCU Power Supply Limits

| MCU                  | USB Max | Per GPIO | Total GPIO | 5V Rail | 3.3V Rail |
| -------------------- | ------- | -------- | ---------- | ------- | --------- |
| Arduino Uno R3       | 500mA   | 20mA     | 200mA      | 500mA   | 50mA      |
| Arduino Mega 2560 R3 | 500mA   | 20mA     | 400mA      | 500mA   | 50mA      |
| ESP32 DevKit 38-Pin  | 500mA   | 12mA     | 1200mA     | N/AmA   | 600mA     |
| NodeMCU ESP8266 Amic | 500mA   | 12mA     | 200mA      | N/AmA   | 500mA     |
| DCCduino Nano        | 500mA   | 20mA     | 200mA      | 500mA   | 50mA      |

### Component Power Consumption

| Component                 | Idle   | Active  | Peak  | Voltage  | Power Source    |
| ------------------------- | ------ | ------- | ----- | -------- | --------------- |
| HC-SR04 Ultrasonic Sensor | 2mA    | 15mA    | 15mA  | 5.0V     | mcu 5v rail     |
| HC-SR501 PIR Motion Senso | 0.05mA | 0.065mA | 0.1mA | 4.5-20V  | mcu 5v rail     |
| DHT11 Temperature & Humid | 0.5mA  | 2.5mA   | 2.5mA | 3.3-5.5V | mcu 5v rail or  |
| GY-521 MPU6050 6-DOF IMU  | 0.01mA | 3.8mA   | 4.0mA | 3.0-5.0V | mcu 3v3 rail pr |
| DS3231 RTC Module         | 0.1mA  | 0.2mA   | ?mA   | 3.3-5.5V | mcu 5v rail or  |
| RC522 RFID Module         | 10mA   | 26mA    | 30mA  | 3.3V     | mcu 3v3 rail    |
| KY-023 Joystick Module    | 0mA    | 0.1mA   | 0.2mA | 5.0V     | mcu 5v rail     |
| Soil Moisture Sensor      | 0mA    | 35mA    | 40mA  | 3.3-5.0V | mcu 5v rail     |
| SG90 Micro Servo          | 10mA   | 150mA   | 700mA | 4.8-6.0V | external 5v     |
| 28BYJ-48 Stepper Motor wi | 0mA    | 240mA   | 300mA | 5.0V     | external 5v     |
| 5V Relay Module           | 0mA    | ?mA     | 90mA  | 5.0V     | external 5v pre |
| LCD 1602 Module           | ?mA    | ?mA     | 30mA  | 5.0V     | mcu 5v rail     |
| 5mm LED Assortment        | ?mA    | ?mA     | ?mA   | 2.0-3.3V | mcu gpio with r |
| WS2812B Addressable LED S | ?mA    | ?mA     | ?mA   | 5.0V     | external 5v     |

### Power Budget Calculator Rules

**usb_power_check** (error)

- Total current ({total_ma}mA) exceeds USB limit (500mA)
- Solution: Use external power supply or reduce load

**gpio_pin_overload** (error)

- Component draws {component_ma}mA but GPIO max is {mcu_per_pin_ma}mA
- Solution: Use transistor/MOSFET to switch load, or external power

**total_gpio_overload** (error)

- Total GPIO load ({sum}mA) exceeds MCU limit ({limit}mA)
- Solution: Use external power for high-current devices

**servo_power_warning** (warning)

- Servos should use external 5V power
- Solution: Connect servo VCC to external 5V, share GND with MCU

**ws2812b_power_calculation** (info)

- {led_count} WS2812B LEDs need {power_ma}mA at full white
- Solution: Use adequate external power supply (5V {amps}A minimum)

---

## 📍 Pin Allocation Rules

### Arduino Uno

**PWM Pins:** `[3, 5, 6, 9, 10, 11]`
**I2C:** SDA=A4, SCL=A5
**Interrupt Pins:** `[2, 3]`

**Best Practices:**

- Use pins 2-9 for general purpose I/O
- Reserve 0,1 for Serial communication
- Use PWM pins (3,5,6,9,10,11) for motor/LED control

---

### Arduino Mega

**PWM Pins:** `[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46]`
**I2C:** SDA=20, SCL=21
**Interrupt Pins:** `[2, 3, 18, 19, 20, 21]`

**Best Practices:**

- Plenty of pins - use 22-49 for general I/O
- 4 hardware serial ports available
- 6 external interrupt pins

---

### Esp32 Devkit 38Pin

**✅ Safe Pins:** `[4, 13, 14, 16, 17]...[27, 32, 33]`
**PWM:** all GPIO can do PWM via LEDC
**I2C:** SDA=21, SCL=22

**⚠️ Critical Warnings:**

- 🔴 ALL GPIO ARE 3.3V ONLY - 5V DESTROYS THE CHIP
- 🔴 ADC2 cannot be used while WiFi is active
- 🔴 Input-only pins (34,35,36,39) cannot output

**Best Practices:**

- Use safe pins: 4, 13-19, 21-27, 32, 33
- Use 34, 35, 36, 39 for inputs only (ADC1)
- Avoid strapping pins for critical boot-time signals

---

### Esp8266 Nodemcu

**✅ Safe Pins:** `['D1/GPIO5', 'D2/GPIO4', 'D5/GPIO14', 'D6/GPIO12', 'D7/GPIO13']`
**PWM:** all GPIO except GPIO16
**I2C:** SDA=4, SCL=5

**⚠️ Critical Warnings:**

- 🔴 ALL GPIO ARE 3.3V ONLY - 5V DESTROYS THE CHIP
- 🔴 Very limited pins - plan carefully
- 🔴 D3, D4, D8 affect boot - avoid sensors that pull at startup

**Best Practices:**

- Use D1, D2, D5, D6, D7 for most projects
- D0 can't do PWM and has special wake function
- Don't connect anything to D3, D4, D8 that pulls during boot

---

## ✅ Wiring Validation Rules

Machine-readable rules for AI validation:

### Voltage Rules

**🟠 VR001: voltage_level_mismatch**

- Voltage mismatch: {mcu} is {mcu_voltage}V logic but {component} requires {comp_voltage}V
- Fix: Add level shifter between MCU and component

**🔴 VR002: 5v_to_3v3_gpio**

- 5V signal {component}.{pin} will DESTROY 3.3V GPIO on {mcu}
- Fix: Use voltage divider (1KΩ + 2KΩ) or level shifter

### Current Rules

**🟠 VR003: gpio_current_exceeded**

- {component} draws {current}mA but {mcu} GPIO max is {limit}mA
- Fix: Use transistor (TIP120/2N2222) or MOSFET (IRF520) to switch load

**🟠 VR004: total_current_exceeded**

- Total current {total}mA exceeds USB power limit 500mA
- Fix: Use external power supply, connect GND to MCU

### Power Rules

**🟡 VR005: servo_direct_power**

- Servo powered from MCU can cause brownout/reset
- Fix: Use external 5V supply for servo VCC, share GND with MCU

**🟠 VR006: stepper_direct_power**

- Stepper motors MUST use external power (240mA+ each)
- Fix: Connect ULN2003 VCC to external 5V, share GND

### Bus Rules

**🟠 VR007: i2c_address_conflict**

- I2C address conflict: {components} both use address {address}
- Fix: Change address via hardware pin (if available) or use I2C multiplexer

**🟠 VR008: spi_ss_conflict**

- Multiple SPI devices need unique SS/CS pins
- Fix: Assign different GPIO to each device SS pin

### Pin Conflict Rules

**🔴 VR009: esp32_flash_pins**

- GPIO {pin} is connected to flash memory - NEVER USE
- Fix: Use safe pins: 4, 13-19, 21-27, 32, 33

**🟠 VR010: esp8266_boot_pins**

- {pin} affects boot - {component} may prevent boot
- Fix: Move sensor to safe pin (D1, D2, D5, D6, D7)

**🟠 VR020: input_only_pin_output**

- GPIO {pin} is INPUT ONLY - cannot be used for output
- Fix: Use different pin for output signals

### Functionality Rules

**🟠 VR011: pwm_required**

- {component} needs PWM but pin {pin} is not PWM capable
- Fix: Move to PWM pin: {pwm_pins}

**🟡 VR012: interrupt_required**

- {component} works best with interrupt but pin {pin} is not interrupt capable
- Fix: For better performance, use interrupt pin: {interrupt_pins}

**🟠 VR013: analog_required**

- {component} outputs analog signal but pin {pin} cannot read analog
- Fix: Connect to analog pin: {analog_pins}

**🟠 VR019: esp_adc2_wifi_conflict**

- ADC2 pins cannot be used while WiFi is active
- Fix: Use ADC1 pins (32, 33, 34, 35, 36, 39) for analog when using WiFi

### Signal Rules

**🟡 VR014: pullup_required**

- {component} data line needs pull-up resistor
- Fix: Add 4.7KΩ-10KΩ resistor from data pin to VCC

### Protection Rules

**🟡 VR015: flyback_diode_required**

- Inductive load {component} needs flyback diode for protection
- Fix: Add 1N4007 diode across coil (cathode to positive)

**🟠 VR016: led_resistor_required**

- LED needs current limiting resistor or will burn out
- Fix: Add 220Ω-330Ω resistor in series with LED

**🟡 VR017: ws2812b_data_resistor**

- WS2812B data line should have series resistor
- Fix: Add 300-500Ω resistor on data line near MCU

**🟡 VR018: ws2812b_capacitor**

- WS2812B power should have bulk capacitor
- Fix: Add 1000µF capacitor across power rails near LEDs

---

## 🎨 Wire Color Standards

### Power Wires

| Signal  | Color    | Hex       |
| ------- | -------- | --------- |
| VCC 5V  | red      | `#FF0000` |
| VCC 3V3 | orange   | `#FFA500` |
| VCC VIN | dark_red | `#8B0000` |
| GND     | black    | `#000000` |
| GND ALT | brown    | `#8B4513` |

### Interface Wires

| Interface | Signal | Color  |
| --------- | ------ | ------ |
| I2C       | SDA    | blue   |
| I2C       | SCL    | yellow |
| SPI       | MOSI   | green  |
| SPI       | MISO   | yellow |
| SPI       | SCK    | blue   |
| SPI       | SS     | orange |
| UART      | TX     | green  |
| UART      | RX     | yellow |
| PWM       | signal | cyan   |

---

## 🔄 Component Substitutes

### DHT11

**Pin Compatible:**

- **DHT22/AM2302**: Better accuracy (±0.5°C vs ±2°C), wider range

### HCSR04

**Pin Compatible:**

- **HC-SR04P**: 3.3V compatible version

### SG90

**Pin Compatible:**

- **MG90S**: Metal gears, more torque (2.2kg vs 1.8kg)
- **SG92R**: Slightly more torque (2.5kg)
  **Upgrades:**
- **MG996R**: Much stronger (10kg), larger, needs more power

### 28BYJ48-ULN2003

### ARDUINO-UNO-R3

**Pin Compatible:**

- **Arduino Uno R4 Minima**: Faster (48MHz vs 16MHz), more RAM, same pinout
- **Elegoo Uno R3**: Clone, same functionality

### ESP32-DEVKIT-38PIN

**Pin Compatible:**

- **ESP32-WROOM-32D DevKit**: Same chip, different board layout possible
  **Upgrades:**
- **ESP32-S3**: USB native, AI acceleration, more GPIO
- **ESP32-C3**: RISC-V core, lower power, fewer GPIO

---

## 🛡️ Protection Requirements

### Quick Reference

| Component | Protection Required                                 |
| --------- | --------------------------------------------------- |
| Relay     | Add flyback diode (1N4007)                          |
| Motor     | Add flyback diode + optional 0.1µF across terminals |
| Led       | Add resistor (220Ω for 5V red LED)                  |
| Ws2812B   | Add 1000µF cap + 330Ω data resistor                 |
| Button    | Add 10K pullup/pulldown or use INPUT_PULLUP         |
| 5V To 3V3 | Add voltage divider (1K + 2K) or level shifter      |

### Detailed Protection by Component Type

**Inductive Loads:**

- Flyback Diode: `1N4007 or 1N4148`
  - Suppresses voltage spike when coil turns off

**Leds:**

**Ws2812B Neopixel:**

- Bulk Capacitor: `1000µF 6.3V electrolytic`
  - Absorbs power-on surge, stabilizes voltage
- Data Resistor: `300Ω-500Ω`
  - Prevents reflections, protects data line
- Level Shifter: `74HCT125 or dedicated level shifter`
  - WS2812B expects 5V data signal

**Motors Dc:**

- Flyback Diode: `1N4007`
- Decoupling Capacitor: `0.1µF ceramic`
  - Reduces electrical noise/EMI
- Snubber Circuit: `0.1µF + 47Ω in series across motor`

**I2C Bus:**

- Pullup Resistors: `4.7KΩ typical (2.2KΩ-10KΩ range)`
  - I2C is open-drain, needs pullups to work

---

## 📈 Inventory Statistics

- **Total Components:** 63
- **Validation Rules:** 20
- **MCU Pin Maps:** 4
- **Substitution Entries:** 9
- **Protection Categories:** 8
- **Project Bundles:** 8
- **Code Snippets:** 17
