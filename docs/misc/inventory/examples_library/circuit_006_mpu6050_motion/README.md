# 6-Axis Motion Sensor

**Difficulty:** intermediate
**Description:** MPU6050 accelerometer + gyroscope

## Bill of Materials
- `mcu-arduino-uno-r3` — Arduino Uno R3
- `sensor-mpu6050` — GY-521 MPU6050 6-DOF IMU

## Power
- Power source: `usb`
- Estimated current: 49 mA

## Validation Notes
Default I2C address 0x68. Set AD0 HIGH for 0x69.

## Quick Wiring Table
See `wiring.csv` and `wiring_table.md`.

## Code
- Snippet key: `mpu6050_basic`
- File: `sketch.ino`
