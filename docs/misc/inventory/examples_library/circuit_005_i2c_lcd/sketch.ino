// Library: LiquidCrystal_I2C
// Install via Arduino Library Manager.

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Address 0x27 or 0x3F depending on backpack
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("Line 2 here");
}
void loop() {
  // Update display as needed
}
