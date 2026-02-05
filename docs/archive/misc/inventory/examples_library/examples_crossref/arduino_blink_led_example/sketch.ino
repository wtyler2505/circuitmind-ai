// Blink an external LED connected to digital pin 8 on an Arduino Uno.

// Define the digital pin where the LED is connected.
const int LED_PIN = 8;

void setup() {
  // Initialize the LED pin as an output.
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Turn the LED on (HIGH is the voltage level)
  digitalWrite(LED_PIN, HIGH);
  // Wait for one second
  delay(1000);
  // Turn the LED off by making the voltage LOW
  digitalWrite(LED_PIN, LOW);
  // Wait for one second
  delay(1000);
}