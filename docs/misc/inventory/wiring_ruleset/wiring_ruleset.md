# Wiring Engine Ruleset (Extracted from Tier 4/5)
- Generated on: 2025-12-31T19:00:00
- Base inventory: 3.4-tier5-claude-code (reconciled last_updated = 2025-12-31)

## Wire Color Standards
### Power
| Key | Wire | Hex | Note |
|---|---|---|---|
| vcc_5v | red | #FF0000 | 5V power |
| vcc_3v3 | orange | #FFA500 | 3.3V power |
| vcc_vin | dark_red | #8B0000 | Unregulated input voltage |
| gnd | black | #000000 | Ground/common |
| gnd_alt | brown | #8B4513 | Alternate ground |

### Signals
| Key | Wire | Hex | Note |
|---|---|---|---|
| data_generic | yellow | #FFFF00 | Generic data signal |
| clock | blue | #0000FF | Clock signals |
| enable | green | #00FF00 | Enable/chip select |
| reset | white | #FFFFFF | Reset signals |
| interrupt | purple | #800080 | Interrupt lines |

## Wiring Validation Rules
| Rule | Name | Category | Severity |
|---|---|---|---|
| VR001 | voltage_level_mismatch | voltage | error |
| VR002 | 5v_to_3v3_gpio | voltage | critical |
| VR003 | gpio_current_exceeded | current | error |
| VR004 | total_current_exceeded | current | error |
| VR005 | servo_direct_power | power | warning |
| VR006 | stepper_direct_power | power | error |
| VR007 | i2c_address_conflict | bus | error |
| VR008 | spi_ss_conflict | bus | error |
| VR009 | esp32_flash_pins | pin_conflict | critical |
| VR010 | esp8266_boot_pins | pin_conflict | error |
| VR011 | pwm_required | functionality | error |
| VR012 | interrupt_required | functionality | warning |
| VR013 | analog_required | functionality | error |
| VR014 | pullup_required | signal | warning |
| VR015 | flyback_diode_required | protection | warning |
| VR016 | led_resistor_required | protection | error |
| VR017 | ws2812b_data_resistor | protection | warning |
| VR018 | ws2812b_capacitor | protection | warning |
| VR019 | esp_adc2_wifi_conflict | functionality | error |
| VR020 | input_only_pin_output | pin_conflict | error |

## Protection Quick Reference
| Case | Do |
|---|---|
| relay | Add flyback diode (1N4007) |
| motor | Add flyback diode + optional 0.1µF across terminals |
| LED | Add resistor (220Ω for 5V red LED) |
| WS2812B | Add 1000µF cap + 330Ω data resistor |
| button | Add 10K pullup/pulldown or use INPUT_PULLUP |
| 5V_to_3V3 | Add voltage divider (1K + 2K) or level shifter |

## Breadboard Zone Rules (830-point standard)
- See `breadboard_zone_rules` section in `wiring_ruleset.json` for full details.

## Pin Allocation Rules
- See `pin_allocation_rules` section in `wiring_ruleset.json`.
