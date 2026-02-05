# Stepper Motor Control

**Difficulty:** intermediate
**Description:** 28BYJ-48 with ULN2003 driver

## Bill of Materials
- `mcu-arduino-uno-r3` — Arduino Uno R3
- `actuator-28byj48-uln2003` — 28BYJ-48 Stepper Motor with ULN2003 Driver

**Consumables / value-specific parts (not uniquely tracked in inventory):**
- `power-supply-5v`

## Power
- Power source: `external_5v_required`
- Estimated current: 290 mA

## Validation Notes
TESTED - pin order in Stepper library is IN1,IN3,IN2,IN4 (not sequential!)

## Quick Wiring Table
See `wiring.csv` and `wiring_table.md`.

## Code
- Snippet key: `stepper_28byj48`
- File: `sketch.ino`
