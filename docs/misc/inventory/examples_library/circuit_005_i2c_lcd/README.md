# I2C LCD Display

**Difficulty:** beginner
**Description:** 16x2 LCD with I2C backpack

## Bill of Materials
- `mcu-arduino-uno-r3` — Arduino Uno R3
- `display-lcd1602` — LCD 1602 Module

**Consumables / value-specific parts (not uniquely tracked in inventory):**
- `lcd1602-i2c`

## Power
- Power source: `usb`
- Estimated current: 70 mA

## Validation Notes
Address usually 0x27 or 0x3F. Run I2C scanner if display blank.

## Quick Wiring Table
See `wiring.csv` and `wiring_table.md`.

## Code
- Snippet key: `lcd1602_i2c`
- File: `sketch.ino`
