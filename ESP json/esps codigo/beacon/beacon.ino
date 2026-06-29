#include <WiFi.h>

// nome da rede da esp, lembrar de alterar pra _02 e _03
const char* ssid = "BEACON_01"; 

void setup() {
  Serial.begin(115200);
  delay(10);

  Serial.println("Configurando Wi-Fi...");
  // configura o esp pra ser somente ponto de acesso 
  WiFi.mode(WIFI_AP);
  
  // inicia a rede sem senha para conectar/escanear mais rapido, 
  // esse o 1 é o canal do wifi, um dos 0 que a rede é visível e o outro que garante que ngm vai conectar
  // SE O RSSI estiver muito instavel, testar canal 6 ou 11
  bool teste = WiFi.softAP(ssid, NULL, 1, 0,0); 

  if (teste) {
    Serial.println("Ponto de acesso criado com sucesso! SSID: ");
    Serial.println(ssid);
    Serial.println("IP da ESP32: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("Falha ao criar o Ponto de Acesso.");
  }
}

void loop() {
	// delay pra nao sobrecarregar a esp
  delay(2000);
  Serial.print("Número de conexões: ");
  Serial.println(WiFi.softAPgetStationNum()); 
  //ideal é 0 pois as esps tao so mostrando sinal mas o celular em si não conecta nelas

}
