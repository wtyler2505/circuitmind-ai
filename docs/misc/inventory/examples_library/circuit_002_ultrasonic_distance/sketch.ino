// Library: NewPing
// Install via Arduino Library Manager.

#include <NewPing.h>
#define TRIG 9
#define ECHO 10
#define MAX_DIST 400

NewPing sonar(TRIG, ECHO, MAX_DIST);

void setup() {
  Serial.begin(9600);
}
void loop() {
  delay(50);
  int cm = sonar.ping_cm();
  Serial.print("Distance: ");
  Serial.print(cm);
  Serial.println(" cm");
}
