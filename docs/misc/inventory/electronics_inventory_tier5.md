# ⚡ Electronics Inventory - Tier 5 Complete (Production Ready)

**Version:** 3.4-tier5-enhanced
**Last Updated:** 2025-12-31
**Total Components:** 63
**Purpose:** Complete AI-Powered Wiring Diagram Generation System

## 📊 Complete Enhancement Summary (Tiers 1-5)

| Tier  | Focus      | Key Enhancements                                                              |
| ----- | ---------- | ----------------------------------------------------------------------------- |
| **1** | Foundation | Datasheets, images, wiring rules, libraries, tags, AI summaries               |
| **2** | Content    | Project bundles, relationships, ASCII pinouts, code snippets                  |
| **3** | Advanced   | Calibration, testing, taxonomy, failure modes, ESD, storage                   |
| **4** | Validation | Power budget, pin allocation, validation rules, protection                    |
| **5** | Physical   | Breadboard layout, complete circuits, signal characteristics, troubleshooting |

### Tier 5 New Enhancements

- ✅ **Breadboard Layout Data**
- ✅ **Complete Example Circuits**
- ✅ **Signal Characteristics**
- ✅ **Troubleshooting Trees**
- ✅ **Breadboard Zone Rules**

---

## 🔌 Complete Validated Circuits

Every wire specified, tested, and verified working:

### LED Blink (Hello World)

**Difficulty:** beginner | **Power:** usb | **Current:** 65mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.D13 | resistor-220ohm.1 | yellow |
| resistor-220ohm.2 | led-red.anode | yellow |
| led-red.cathode | arduino-uno.GND | black |

✅ **Tested:** Verified working. 220Ω gives ~13mA through LED.

### Ultrasonic Distance Sensor

**Difficulty:** beginner | **Power:** usb | **Current:** 60mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.5V | hc-sr04.VCC | red |
| arduino-uno.GND | hc-sr04.GND | black |
| arduino-uno.D9 | hc-sr04.TRIG | green |
| arduino-uno.D10 | hc-sr04.ECHO | yellow |

✅ **Tested:** Verified. Echo returns 5V signal, safe for Arduino.

### Temperature & Humidity Monitor

**Difficulty:** beginner | **Power:** usb | **Current:** 48mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.5V | dht11.VCC | red |
| arduino-uno.GND | dht11.GND | black |
| arduino-uno.D2 | dht11.DATA | yellow |
| dht11.DATA | resistor-10k.1 | yellow (pullup) |
| resistor-10k.2 | arduino-uno.5V | red (pullup to VCC) |

✅ **Tested:** 10K pullup may be built into module. Test without first.

### Servo Motor Control

**Difficulty:** beginner | **Power:** usb_marginal | **Current:** 200mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.5V | sg90.VCC-red | red |
| arduino-uno.GND | sg90.GND-brown | black |
| arduino-uno.D9 | sg90.SIGNAL-orange | orange |

✅ **Tested:** Works on USB for single servo. Add 100uF cap for stability.

### I2C LCD Display

**Difficulty:** beginner | **Power:** usb | **Current:** 70mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.5V | lcd1602-i2c.VCC | red |
| arduino-uno.GND | lcd1602-i2c.GND | black |
| arduino-uno.A4 | lcd1602-i2c.SDA | blue |
| arduino-uno.A5 | lcd1602-i2c.SCL | yellow |

✅ **Tested:** Address usually 0x27 or 0x3F. Run I2C scanner if display blank.

### 6-Axis Motion Sensor

**Difficulty:** intermediate | **Power:** usb | **Current:** 49mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.3.3V | mpu6050.VCC | orange (or 5V if module has regulator) |
| arduino-uno.GND | mpu6050.GND | black |
| arduino-uno.A4 | mpu6050.SDA | blue |
| arduino-uno.A5 | mpu6050.SCL | yellow |

✅ **Tested:** Default I2C address 0x68. Set AD0 HIGH for 0x69.

### ESP32 Ultrasonic (3.3V MCU)

**Difficulty:** intermediate | **Power:** usb | **Current:** 100mA

⚠️ **WARNING:** ESP32 is 3.3V! HC-SR04 Echo outputs 5V! MUST use voltage divider!

**Connections:**
| From | To | Wire |
|------|-----|------|
| esp32.VIN/5V | hc-sr04.VCC | red |
| esp32.GND | hc-sr04.GND | black |
| esp32.GPIO5 | hc-sr04.TRIG | green (3.3V OK for trigger) |
| hc-sr04.ECHO | resistor-1k.1 | yellow |
| resistor-1k.2 | esp32.GPIO18 | yellow |
| esp32.GPIO18 | resistor-2k.1 | yellow |
| ... | (1 more connections) | ... |

✅ **Tested:** TESTED - voltage divider essential to prevent GPIO damage

### WS2812B LED Strip

**Difficulty:** intermediate | **Power:** external_5v_required | **Current:** 60 per LED at full whitemA

**Connections:**
| From | To | Wire |
|------|-----|------|
| power-supply-5v.+ | capacitor-1000uf.+ | red |
| power-supply-5v.- | capacitor-1000uf.- | black |
| power-supply-5v.+ | ws2812b.5V | red |
| power-supply-5v.- | ws2812b.GND | black |
| arduino-uno.GND | power-supply-5v.- | black (COMMON GROUND) |
| arduino-uno.D6 | resistor-330ohm.1 | green |
| ... | (1 more connections) | ... |

✅ **Tested:** TESTED - protection components prevent first-LED failure

### RFID Card Reader

**Difficulty:** intermediate | **Power:** usb | **Current:** 75mA

⚠️ **WARNING:** RC522 is 3.3V ONLY! Use Arduino 3.3V pin, NOT 5V!

**Connections:**
| From | To | Wire |
|------|-----|------|
| arduino-uno.3.3V | rc522.3.3V | orange |
| arduino-uno.GND | rc522.GND | black |
| arduino-uno.D10 | rc522.SDA/SS | purple |
| arduino-uno.D13 | rc522.SCK | blue |
| arduino-uno.D11 | rc522.MOSI | green |
| arduino-uno.D12 | rc522.MISO | yellow |
| ... | (1 more connections) | ... |

✅ **Tested:** TESTED - 3.3V power essential, Arduino 5V GPIO works for signals

### Stepper Motor Control

**Difficulty:** intermediate | **Power:** external_5v_required | **Current:** 290mA

**Connections:**
| From | To | Wire |
|------|-----|------|
| power-supply-5v.+ | uln2003.VCC | red |
| power-supply-5v.- | uln2003.GND | black |
| arduino-uno.GND | uln2003.GND | black (COMMON GROUND) |
| arduino-uno.D8 | uln2003.IN1 | yellow |
| arduino-uno.D9 | uln2003.IN2 | orange |
| arduino-uno.D10 | uln2003.IN3 | green |
| ... | (2 more connections) | ... |

✅ **Tested:** TESTED - pin order in Stepper library is IN1,IN3,IN2,IN4 (not sequential!)

---

## 📐 Breadboard Layout Data

**Arduino Uno R3:**

- Placement: beside breadboard, use jumper wires

**ESP32 DevKit 38-Pin:**

- Footprint: 10×19 holes
- Straddles gap: Yes
- Placement: straddles center gap, leaves 0 holes on each side
- ⚠️ Fills entire breadboard width - no adjacent holes available

**NodeMCU ESP8266 Amica V2:**

- Footprint: 10×15 holes
- Straddles gap: Yes
- Placement: straddles center gap, may need offset placement
- ⚠️ Very wide - leaves 0 holes on each side

**DCCduino Nano:**

- Footprint: 6×15 holes
- Straddles gap: Yes
- Placement: straddles center gap, pins in rows D and G

**HC-SR04 Ultrasonic Sensor:**

- Footprint: 4×1 holes
- Straddles gap: No
- Placement: insert in any 4 adjacent holes in same row

---

## 📡 Signal Characteristics

Pin-by-pin signal specifications for smart routing:

### HC-SR04 Ultrasonic Sensor

| Pin  | Type        | Voltage | Notes                                              |
| ---- | ----------- | ------- | -------------------------------------------------- |
| VCC  | power_in    | 5.0V    | -                                                  |
| GND  | ground      | N/AV    | -                                                  |
| TRIG | digital_in  | N/AV    | max 50cm                                           |
| ECHO | digital_out | N/AV    | max 30cm, noise sensitive, ⚠️ level shift for 3.3V |

### HC-SR501 PIR Motion Sensor

| Pin | Type        | Voltage    | Notes     |
| --- | ----------- | ---------- | --------- |
| VCC | power_in    | [4.5, 20]V | -         |
| GND | ground      | N/AV       | -         |
| OUT | digital_out | N/AV       | max 200cm |

### DHT11 Temperature & Humidity Module

| Pin  | Type                  | Voltage      | Notes                                  |
| ---- | --------------------- | ------------ | -------------------------------------- |
| VCC  | power_in              | [3.3, 5.5]V  | -                                      |
| GND  | ground                | N/AV         | -                                      |
| DATA | bidirectional_digital | matches VCCV | max 100cm, noise sensitive, pullup req |

### GY-521 MPU6050 6-DOF IMU

| Pin | Type        | Voltage     | Notes                                 |
| --- | ----------- | ----------- | ------------------------------------- |
| VCC | power_in    | [3.0, 5.0]V | -                                     |
| GND | ground      | N/AV        | -                                     |
| SCL | i2c_clock   | 3.3V        | max 50cm, noise sensitive, pullup req |
| SDA | i2c_data    | 3.3V        | max 50cm, noise sensitive, pullup req |
| INT | digital_out | 3.3V        | max 30cm                              |
| AD0 | digital_in  | 3.3V        | -                                     |

---

## 🔧 Troubleshooting Trees

### Circuit completely dead, no response

**Step 1:** Is MCU powered?

- How: Check power LED on board, measure 5V/3.3V with multimeter
- If fail (high): USB cable is charge-only (no data) → Try different USB cable
- If fail (medium): USB port insufficient power → Try different port or powered hub

**Step 2:** Does blink sketch work?

- How: Upload basic blink, verify LED D13 blinks
- If fail (high): Wrong board selected in IDE → Check Tools > Board menu
- If fail (high): Wrong COM port → Check Tools > Port, try different ports

**Step 3:** Are all grounds connected?

- How: Verify continuity between all GND points with multimeter
- If fail (high): Missing ground wire → Add ground connection
- If fail (high): Loose breadboard connection → Reseat wires, check breadboard contacts

### Circuit works sometimes, fails randomly

**Step 1:** Wiggle test - does touching wires affect behavior?

- How: Gently push on each wire connection while running
- If fail (high): Loose breadboard connection → Reseat wire, use fresh breadboard row
- If fail (medium): Oxidized jumper wire ends → Clean with fine sandpaper or replace

**Step 2:** Power stability - measure VCC during operation

- How: Watch multimeter while circuit operates
- If fail (high): Insufficient power supply current → Use external power supply
- If fail (medium): Missing decoupling capacitor → Add 100nF ceramic + 100µF electrolytic near component

**Step 3:** Electrical noise interference

- How: Move motor/relay away from sensor, add shielding
- If fail (high): Motor EMI affecting sensors → Add 0.1µF across motor, use shielded cables
- If fail (medium): Long signal wires acting as antenna → Shorten wires, use twisted pairs for signals

### Sensor returns data but values are incorrect

**Step 1:** Is sensor within operating range?

- How: Check datasheet for min/max measurement range
- If fail (high): Target too close/far (ultrasonic) → Move target to valid range (2-400cm for HC-SR04)
- If fail (medium): Temperature/humidity out of range → DHT11: 0-50°C, 20-90%RH

**Step 2:** Calibration needed?

- How: Compare against known reference (ruler, thermometer)
- If fail (high): Sensor needs calibration offset → Calculate offset from known value, apply in code
- If fail (medium): Clone/cheap sensor has different specs → Adjust formula constants for actual sensor

**Step 3:** Correct voltage/logic level?

- How: Verify sensor VCC matches expected, check signal levels
- If fail (medium): Running 3.3V sensor on 5V → Check sensor voltage rating
- If fail (medium): Signal level mismatch causing bit errors → Add level shifter if needed

### I2C scanner finds no devices or wrong address

**Step 1:** Correct SDA/SCL pins?

- How: Verify A4=SDA, A5=SCL on Uno; GPIO21=SDA, GPIO22=SCL on ESP32
- If fail (high): SDA and SCL swapped → Swap the two wires
- If fail (high): Wrong pins for this MCU → Check pinout for your specific board

**Step 2:** Pull-up resistors present?

- How: Measure resistance from SDA to VCC, SCL to VCC (should be 1K-10K)
- If fail (high): No pull-ups on bus → Add 4.7K resistors from SDA to VCC, SCL to VCC
- If fail (medium): Module missing pull-ups → Some bare modules need external pull-ups

**Step 3:** Address conflict or wrong address?

- How: Check if multiple devices share address, verify expected address
- If fail (medium): Two devices with same address → Change address via hardware pin (AD0 on MPU6050)
- If fail (medium): Device uses different address than expected → Common: LCD 0x27 or 0x3F, MPU6050 0x68 or 0x69

---

## 🗺️ Breadboard Zone Rules

### Zone Layout

**Power Rails Top:** 5V power distribution

- Best practice: Connect MCU 5V to red rail, GND to blue rail first

**Power Rails Bottom:** Additional power or second voltage

- Best practice: Always connect grounds together between rails

**Mcu Zone:** Microcontroller placement

- Location: Left side of breadboard, rows 1-20
- Best practice: Place MCU with USB port accessible at edge

**Sensor Zone:** Input sensors and modules

- Location: Center-right of breadboard
- Best practice: Group I2C sensors together (share SDA/SCL)

**Actuator Zone:** Motors, relays, high-current devices

- Location: Right side or separate breadboard
- Best practice: Use separate power supply for motors

**Output Zone:** LEDs, displays, indicators

- Location: Bottom area, easily visible
- Best practice: Orient displays for easy viewing

### Common Mistakes to Avoid

❌ **Forgetting center gap doesn't connect**

- Symptom: Half of IC pins don't work
- Fix: Place DIP ICs straddling the center gap

❌ **Not connecting power rail sections**

- Symptom: Components on one half don't power up
- Fix: Add jumper across power rail break point (if present)

❌ **Reversed electrolytic capacitor**

- Symptom: Cap gets hot, may bulge or pop
- Fix: Check polarity - stripe indicates negative

❌ **LED without current-limiting resistor**

- Symptom: LED burns out immediately or is very dim after
- Fix: Always use resistor - even 100Ω is better than none

❌ **Powering 3.3V device with 5V**

- Symptom: Device runs hot, erratic behavior, or immediate failure
- Fix: Check device voltage before connecting

---

## 📈 Complete Inventory Statistics

| Category               | Count |
| ---------------------- | ----- |
| Total Components       | 63    |
| Complete Circuits      | 10    |
| Breadboard Layouts     | 15    |
| Signal Characteristics | 9     |
| Troubleshooting Trees  | 7     |
| Validation Rules       | 20    |
| MCU Pin Maps           | 4     |
| Project Bundles        | 8     |
| Code Snippets          | 17    |
| ASCII Pinouts          | 9     |

### Top-Level Sections in JSON

```
├── $schema
├── ascii_pinouts
├── breadboard_zone_rules
├── code_snippets
├── complete_circuits
├── component_relationships
├── component_substitutes
├── inventory_metadata
├── pin_allocation_rules
├── power_budget_calculator
├── project_bundles
├── protection_requirements
├── quick_lookup
├── quick_reference
├── schema_definition
├── spec_confidence_definitions
├── storage_template
├── taxonomy
├── troubleshooting_trees
├── wire_color_standards
├── wiring_validation_rules
└── components (63 items, 13 categories)
```
