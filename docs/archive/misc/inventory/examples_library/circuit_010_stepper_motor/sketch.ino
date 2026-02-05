// Library: Stepper (built-in)
// Install via Arduino Library Manager.

#include <Stepper.h>

// 2048 steps = 1 revolution (with gear ratio)
const int stepsPerRev = 2048;

// Pins: IN1, IN3, IN2, IN4 (note order!)
Stepper myStepper(stepsPerRev, 8, 10, 9, 11);

void setup() {
  myStepper.setSpeed(10);  // 10 RPM max for 28BYJ-48
}
void loop() {
  myStepper.step(stepsPerRev);   // 1 revolution CW
  delay(500);
  myStepper.step(-stepsPerRev);  // 1 revolution CCW
  delay(500);
}
