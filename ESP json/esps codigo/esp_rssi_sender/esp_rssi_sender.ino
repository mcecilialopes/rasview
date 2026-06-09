#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEScan.h>


const char* ssid     = "SEU_WIFI";
const char* password = "SUA_SENHA";

// Nomes dos 2 beacons BLE
const char* minhasEsps[2] = { "BEACON_01", "BEACON_02" };

WebSocketsServer webSocket(81);
BLEScan* bleScan;

// scan pra que ele ja envie o rssi sem precisar colocar manualmente

void escanearEEnviar() {
  BLEScanResults resultados = bleScan->start(2, false); // 2 segundos de scan

  int rssi[2] = { 0, 0 }; // 0 = não encontrado

  for (int i = 0; i < resultados.getCount(); i++) { // ver todos os bluetooths na regiao
    BLEAdvertisedDevice dev = resultados.getDevice(i);
    if (!dev.haveName()) continue; // pra ignorar se n tiver nome

    String nome = dev.getName().c_str(); // pega o nome p comparar com o nome das esps
    for (int j = 0; j < 2; j++) {
      if (nome == minhasEsps[j]) {
        rssi[j] = dev.getRSSI();
      }
    }
  }

  bleScan->clearResults();

  // Monta e envia JSON com os 2 RSSIs
  StaticJsonDocument<128> doc;
  doc["BEACON_01"] = rssi[0];
  doc["BEACON_02"] = rssi[1];

  char json[128];
  serializeJson(doc, json);
  webSocket.broadcastTXT(json);

  Serial.printf("Enviado -> Beacon 01:%d Beacon 02:%d dBm\n", rssi[0], rssi[1]);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("Cliente %u conectado\n", num);
  }
}


void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nIP: " + WiFi.localIP().toString()); // colocar esse ip no useWebSocket.js

  BLEDevice::init(""); //scanear os bluetooths
  bleScan = BLEDevice::getScan();
  bleScan->setActiveScan(true);

  //inicializa o protocolo
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  escanearEEnviar(); // scan de 2s + envia
}
