| From | Pin | To | Pin | Wire |
|---|---|---|---|---|
| `esp32` | `VIN/5V` | `hc-sr04` | `VCC` | `red` |
| `esp32` | `GND` | `hc-sr04` | `GND` | `black` |
| `esp32` | `GPIO5` | `hc-sr04` | `TRIG` | `green` |
| `hc-sr04` | `ECHO` | `resistor-1k` | `1` | `yellow` |
| `resistor-1k` | `2` | `esp32` | `GPIO18` | `yellow` |
| `esp32` | `GPIO18` | `resistor-2k` | `1` | `yellow` |
| `resistor-2k` | `2` | `esp32` | `GND` | `black` |
