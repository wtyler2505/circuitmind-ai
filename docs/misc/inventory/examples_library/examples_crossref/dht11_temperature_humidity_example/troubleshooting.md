## Troubleshooting

- **No serial output** – Verify that the serial monitor is set to 9600 baud
  and that the board is programmed correctly.  Make sure the Arduino
  is powered and the code has finished uploading.
- **Readings are NaN (not a number)** – The `DHT.readHumidity()` and
  `DHT.readTemperature()` functions return `NaN` if they fail.  Check
  that the sensor’s data pin is wired to the correct digital pin and that the
  pull‑up resistor is installed.  Ensure the sensor has at least one
  second of stable power before the first reading.
- **Unstable or incorrect values** – Excessive wire length or noisy
  environments can degrade signal quality.  Keep the data wire short and
  use a shielded cable if the sensor is far from the Arduino.  Check
  that supply voltage is within the 3.3–5 V range【164782750892533†L110-L123】.