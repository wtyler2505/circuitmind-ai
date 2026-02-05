# Arduino Blink Example

This example blinks an external LED connected to digital pin 8 on an
Arduino Uno. It demonstrates basic digital output and timing control.

## Components

- **Arduino Uno R3** (`mcu-arduino-uno-r3`)
- **LED** (generic)
- **220 Ω resistor**
- Breadboard and jumper wires

## Overview

An LED’s anode connects through a 220 Ω resistor to **digital pin 8** on the
Arduino. The cathode connects to **GND**. The sketch toggles pin 8 high and
low every second to create a blink. You can change the pin number or delay
to adjust which pin blinks or how fast.

## Failure Modes & Troubleshooting

- **LED doesn’t light** – Ensure the LED’s polarity is correct: the longer leg
  (anode) should go to the resistor and the shorter leg (cathode) to ground.
  Also check that the resistor is installed and pin numbers in the code
  match the wiring.
- **Code doesn’t upload** – Verify the correct board and port are selected
  in the Arduino IDE. If the upload fails, reset the board and try again.
- **Very dim LED** – Use a resistor around 220 Ω; a higher value will produce
  a dimmer light, while a lower value may burn out the LED or overload the
  microcontroller pin.