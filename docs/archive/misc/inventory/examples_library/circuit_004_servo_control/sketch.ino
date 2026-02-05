// Library: Servo (built-in)
// Install via Arduino Library Manager.

#include <Servo.h>

Servo myservo;

void setup() {
  myservo.attach(9);  // PWM pin
}
void loop() {
  for (int pos = 0; pos <= 180; pos++) {
    myservo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos--) {
    myservo.write(pos);
    delay(15);
  }
}
