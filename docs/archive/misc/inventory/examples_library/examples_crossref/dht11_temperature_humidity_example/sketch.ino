#include <DHT.h>

// Digital pin on the Arduino that the DHT11 data line is connected to
#define DHTPIN 2

// Specify the type of sensor (DHT11)
#define DHTTYPE DHT11

// Create a DHT object
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);
  // Initialize the DHT sensor
  dht.begin();
}

void loop() {
  // Wait a few seconds between measurements.  DHT11 readings are relatively slow.
  delay(2000);

  // Read humidity (percent)
  float humidity = dht.readHumidity();
  // Read temperature in Celsius
  float temperature = dht.readTemperature();

  // Check if any reads failed and exit early to avoid printing NaN
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT11 sensor!");
    return;
  }

  // Print the results
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
}