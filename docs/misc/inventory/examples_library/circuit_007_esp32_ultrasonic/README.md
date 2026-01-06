# ESP32 Ultrasonic (3.3V MCU)

**Difficulty:** intermediate
**Description:** HC-SR04 with ESP32 - REQUIRES LEVEL SHIFTING

## Bill of Materials
- `mcu-esp32-devkit-38pin` — ESP32 DevKit 38-Pin
- `sensor-hcsr04` — HC-SR04 Ultrasonic Sensor
- `resistor-assortment` — Resistor Assortment Kit

**Consumables / value-specific parts (not uniquely tracked in inventory):**
- `resistor-1k`
- `resistor-2k`

## Power
- Power source: `usb`
- Estimated current: 100 mA

## Validation Notes
TESTED - voltage divider essential to prevent GPIO damage

## Quick Wiring Table
See `wiring.csv` and `wiring_table.md`.

## Code
- Snippet key: `esp32_ultrasonic`
- File: `sketch.ino`
