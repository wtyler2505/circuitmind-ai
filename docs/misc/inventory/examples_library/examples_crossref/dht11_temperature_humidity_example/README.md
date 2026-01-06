# DHT11 Temperature & Humidity Monitor

This example demonstrates how to wire and code a basic temperature and humidity
monitor using a DHT11 sensor and an Arduino Uno. The circuit reads the
sensor’s values once per second and prints them to the serial monitor.

## Components

- **Arduino Uno R3** (`mcu-arduino-uno-r3`)
- **DHT11 sensor module** (`sensor-dht11`)
- **10 kΩ pull‑up resistor**
- Breadboard and jumper wires

## Overview

The DHT11 sensor uses a single digital data line that must be pulled high
through a resistor. The sensor can operate at 3.3 V or 5 V【164782750892533†L110-L123】.
In this example, the sensor’s **VCC** is powered from the Arduino’s **5 V** pin and
its **data** line connects to **digital pin 2** with a 10 kΩ resistor between
VCC and data. The sensor returns a temperature reading with ±2 °C accuracy and
a humidity reading with ±5 % accuracy.

See the Cirkit Designer documentation for typical wiring diagrams and
applications【857778386584774†L22-L54】【857778386584774†L58-L123】.

## Failure Modes & Troubleshooting

- **Incorrect readings** – If the sensor returns a constant 0 or 255, check
  wiring: ensure the data pin is connected to the correct Arduino pin and
  that the pull‑up resistor is installed. Confirm that the sensor’s **GND** and
  **VCC** are connected properly.
- **No readings** – The sensor may need up to one second after powering up
  before it can deliver the first reading. Delay your first read
  accordingly. Poor quality jumper wires can also cause intermittent faults.
- **Power issues** – The DHT11 requires 3.3–5 V. Supplying a lower voltage can
  result in unstable readings. Conversely, powering it from an unregulated
  source can damage the sensor.

Consult the inventory’s `failure_modes` field for more details about
sensor‑specific failures.