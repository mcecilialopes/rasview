#include <BLEDevice.h>
#include <BLEAdvertising.h>

void setup() {
  Serial.begin(115200);

  BLEDevice::init("BEACON_01"); // muda aqui pra BEACON_02 na ESP 2

  BLEAdvertising* advertising = BLEDevice::getAdvertising();
  advertising->start();

  Serial.println("Beacon ativo: BEACON_01");
}

void loop() {
}
