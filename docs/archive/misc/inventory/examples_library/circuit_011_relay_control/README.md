# Relay Control Example

**Difficulty:** intermediate
**Description:** Control a 5 V relay module from an Arduino Uno to switch an external load (shown as an LED with a separate power source).

## Bill of Materials
- `mcu-arduino-uno-r3` — Arduino Uno R3
- `actuator-relay-5v` — 5 V Relay Module
- `led-5mm-assortment` — Generic 5 mm LED (used as a low‑power load)
- `resistor-assortment` — 220 Ω resistor (for LED current‑limiting)

**Consumables / value‑specific parts (not uniquely tracked in inventory):**
- External power source for the load (e.g. 9 V battery)
- Jumper wires

## Power
- Power source: `usb` (powers the Arduino and relay coil)
- Estimated current: 80 mA (70 mA relay coil + LED)

## Validation Notes
The relay module is **active‑LOW**: driving the **IN** pin LOW energizes the coil. The coil draws about 70 mA; for multiple relays or long ON durations, use an external 5 V supply. When switching high‑voltage AC loads, keep mains wiring physically isolated from the low‑voltage control side and follow electrical safety guidelines.

## Quick Wiring Table
See `wiring.csv` and `wiring_table.md`.

## Code
- Snippet key: `relay_control`
- File: `sketch.ino`
