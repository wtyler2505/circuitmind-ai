// Relay control example. Uses active-low relay module on pin D7.

const int relayPin = 7;

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // relay off (active-low)
}

void loop() {
  // Energize relay (LOW)
  digitalWrite(relayPin, LOW);
  delay(2000);
  // De-energize relay (HIGH)
  digitalWrite(relayPin, HIGH);
  delay(2000);
}
