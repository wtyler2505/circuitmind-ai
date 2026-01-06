| From | Pin | To | Pin | Wire |
|---|---|---|---|---|
| `arduino-uno` | `5V` | `dht11` | `VCC` | `red` |
| `arduino-uno` | `GND` | `dht11` | `GND` | `black` |
| `arduino-uno` | `D2` | `dht11` | `DATA` | `yellow` |
| `dht11` | `DATA` | `resistor-10k` | `1` | `yellow` |
| `resistor-10k` | `2` | `arduino-uno` | `5V` | `red` |
