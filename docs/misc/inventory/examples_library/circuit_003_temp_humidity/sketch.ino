// Library: DHT sensor library
// Install via Arduino Library Manager.

#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}
void loop() {
  delay(2000);  // DHT11 needs 1s between reads
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read!");
    return;
  }
  Serial.print("Temp: "); Serial.print(t);
  Serial.print("C  Humidity: "); Serial.print(h);
  Serial.println("%");
}
