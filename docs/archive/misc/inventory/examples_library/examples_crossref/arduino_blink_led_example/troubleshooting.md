## Troubleshooting

- **LED remains off** – Check the LED orientation: the longer leg (anode)
  should be connected to the resistor, and the shorter leg (cathode) should
  go to ground.  Ensure the resistor is present to limit current and
  prevent damage.
- **Upload errors** – Make sure the correct board (Arduino Uno) and serial
  port are selected in the Arduino IDE.  If the upload fails, press the
  reset button on the board just before the upload begins.
- **Board resets when LED turns on** – Using a resistor smaller than
  220 Ω can draw too much current from the pin, causing voltage
  drop.  Replace the resistor with a value between 220 Ω and 1 kΩ.