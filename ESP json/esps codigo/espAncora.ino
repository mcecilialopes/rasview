#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <math.h>

WebSocketsServer webSocket = WebSocketsServer(81);

// ============================================================================
// CONFIGURAÇÕES DO AMBIENTE E DOS BEACONS
// ============================================================================

const float x_ancora = 5.76;
const float y_ancora = 2.14;
const float alfa_filtroEWMA = 0.2;
const int total_leituras = 15;
float leituras_x [total_leituras] = {};
float leituras_y [total_leituras] = {};
int contador_leituras = 0;


struct Beacon {
  String ssid;
  float x;          
  float y;          
  float rssi_ref;   
  float n_fator;    
  float rssi_bruto;
  float rssi_filtrado; 
  float distancia;  
  bool encontrado;
  bool primeira_leitura;  
};

Beacon beacons[3] = {
  // SSID           / X    / Y    / RSSI_ref / Fator N/ Bruto/ Filt / Dist / Encontrado / Primeira
  {"RAS_BEACON_01",  5.88,  0.00,   -45.0,     3.320,    0.0,   0.0,   0.0,   false,       true},
  {"RAS_BEACON_02",  4.28,  7.49,   -44.0,     3.320,    0.0,   0.0,   0.0,   false,       true},
  {"RAS_BEACON_03",  0.70,  3.21,   -41.0,     3.320,    0.0,   0.0,   0.0,   false,       true}
};
// ============================================================================
// Função de callback para eventos do WebSocket
// ============================================================================
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Desconectado!\n", num);
            break;
        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Cliente conectado de %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
            break;
        }
        case WStype_TEXT:
            // Caso receba algo do cliente (se necessário futuramente)
            break;
        default:
            break;
    }
}
// ============================================================================
// Cálculo da posição
// ============================================================================

// calcula a distancia real usando pitagoras
float calcularDistanciaReal(float x1, float y1, float x2, float y2) {
  return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

bool calcularPosicao(float &pos_x, float &pos_y) {
  float x1 = beacons[0].x, y1 = beacons[0].y, d1 = beacons[0].distancia;
  float x2 = beacons[1].x, y2 = beacons[1].y, d2 = beacons[1].distancia;
  float x3 = beacons[2].x, y3 = beacons[2].y, d3 = beacons[2].distancia;

  float A = 2.0 * (x3 - x1);
  float B = 2.0 * (y3 - y1);
  float C = pow(d1, 2) - pow(d3, 2) - pow(x1, 2) + pow(x3, 2) - pow(y1, 2) + pow(y3, 2);

  float D = 2.0 * (x3 - x2);
  float E = 2.0 * (y3 - y2);
  float F = pow(d2, 2) - pow(d3, 2) - pow(x2, 2) + pow(x3, 2) - pow(y2, 2) + pow(y3, 2);

  float determinante = (A * E) - (B * D);

  if (abs(determinante) < 0.0001) {
    return false; 
  }

  pos_x = (C * E - B * F) / determinante;
  pos_y = (A * F - C * D) / determinante;

  return true;
}

void calibrarFatoresN() {
  Serial.println("\nIniciando Calibração do N...");
  Serial.print("Lendo sinais...");

  // Faz 8 varreduras de Wi-Fi para o Filtro EWMA estabilizar o sinal
  for (int j = 0; j < 8; j++) {
    int redes = WiFi.scanNetworks();
    for (int i = 0; i < redes; ++i) {
      String ssid_detectado = WiFi.SSID(i);
      
      for (int k = 0; k < 3; k++) {
        if (ssid_detectado == beacons[k].ssid) {
          float rssi_lido = (float)WiFi.RSSI(i);
          
          if (beacons[k].primeira_leitura) {
            beacons[k].rssi_filtrado = rssi_lido;
            beacons[k].primeira_leitura = false;
          } else {
            beacons[k].rssi_filtrado = (alfa_filtroEWMA * rssi_lido) + ((1 - alfa_filtroEWMA) * beacons[k].rssi_filtrado);
          }
        }
      }
    }
    WiFi.scanDelete();
    Serial.print(".");
    delay(150);
  }
  
  Serial.println(" Concluído!\n");
  Serial.println("=== RESULTADO DA AUTOCALIBRAÇÃO ===");
  
  for (int j = 0; j < 3; j++) {
    // 1. Distância física real da fita no chão até este Beacon medida usando pitágoras
    float dist_real = calcularDistanciaReal(x_ancora, y_ancora, beacons[j].x, beacons[j].y);
    
    // Proteção matemática (evita log10 de 1 e dist zero)
    if (dist_real < 0.1) dist_real = 0.1;
    if (dist_real == 1.0) dist_real = 1.01; 

    // 2. Isola o N na equação
    float n_calculado = (beacons[j].rssi_ref - beacons[j].rssi_filtrado) / (10.0 * log10(dist_real));
    
    // 3. Trava de segurança (evita números irreais se houver um pico de ruído bem na hora)
    if (n_calculado < 1.5) n_calculado = 1.5;
    if (n_calculado > 5.0) n_calculado = 5.0;

    // 4. Salva o N definitivo para usar no Loop
    beacons[j].n_fator = n_calculado;

    Serial.printf("[BEACON %d] Dist. Real: %4.2fm | RSSI Médio: %6.1f | NOVO FATOR [N]: %.3f\n", 
                 (j+1), dist_real, beacons[j].rssi_filtrado, beacons[j].n_fator);
  }
  Serial.println("===================================\n");
  Serial.println("[SISTEMA] Calibração finalizada");
  delay(3000);
}

// ============================================================================
// Código da ESP ÂNCORA 
// ============================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("------ RASVIEW ------");

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  calibrarFatoresN();

  // incia o websocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {

  for (int j = 0; j < 3; j++) {
    beacons[j].encontrado = false;
  }

  int redes = WiFi.scanNetworks();
  webSocket.loop();


  for (int i = 0; i < redes; ++i) {
    String ssid_detectado = WiFi.SSID(i);

    for (int j = 0; j < 3; j++) {
      if (ssid_detectado == beacons[j].ssid) {
        beacons[j].encontrado = true;
        beacons[j].rssi_bruto = (float)WiFi.RSSI(i); 
        if (beacons[j].primeira_leitura){
          beacons[j].rssi_filtrado = beacons[j].rssi_bruto;
          beacons[j].primeira_leitura = false;
        } else {
          beacons[j].rssi_filtrado = (alfa_filtroEWMA * beacons[j].rssi_bruto) + ((1-alfa_filtroEWMA) * beacons[j].rssi_filtrado);
        }

        beacons[j].distancia = pow(10.0, (beacons[j].rssi_ref - beacons[j].rssi_filtrado) / (10.0 * beacons[j].n_fator));
      }
    }
  }

  if (beacons[0].encontrado && beacons[1].encontrado && beacons[2].encontrado) {
    float x_estimado = 0.0;
    float y_estimado = 0.0;

    if (calcularPosicao(x_estimado, y_estimado)) {
      
      leituras_x[contador_leituras] = x_estimado;
      leituras_y[contador_leituras] = y_estimado;

      contador_leituras++;
      } else {
        Serial.println("Beacons colineares ou falha na matriz.");
      }
    } else {
      Serial.println("Sinal incompleto. Aguardando a presença dos 3 Beacons...");
    }

    if(contador_leituras >= total_leituras){

      float soma_leituras_x = 0;
      float soma_leituras_y = 0;
      float media_leituras_x = 0;
      float media_leituras_y = 0;
      float maior_x = leituras_x[0];
      float maior_y = leituras_y[0];
      float menor_x = leituras_x[0];
      float menor_y = leituras_y[0];


      for (int i = 0; i < total_leituras; i++){
        maior_x = max(maior_x, leituras_x[i]);
        maior_y = max(maior_y, leituras_y[i]);

        menor_x = min(menor_x, leituras_x[i]);
        menor_y = min(menor_y, leituras_y[i]);

        soma_leituras_x += leituras_x[i];
        soma_leituras_y += leituras_y[i];

      }

      media_leituras_x = soma_leituras_x / total_leituras;
      media_leituras_y = soma_leituras_y / total_leituras;

      Serial.println("\n==================================================================");
      Serial.println(">>> RAS VIEW: RELATÓRIO DE ESTABILIDADE (15 LEITURAS) <<<");
      Serial.println("------------------------------------------------------------------");
      Serial.printf("Eixo X -> Média: %.2f m | Mínimo: %.2f m | Máximo: %.2f m\n", media_leituras_x, menor_x, maior_x);
      Serial.printf("Eixo Y -> Média: %.2f m | Mínimo: %.2f m | Máximo: %.2f m\n", media_leituras_y, menor_y, maior_y);
      Serial.println("------------------------------------------------------------------");
      
      contador_leituras = 0;

      calibrarFatoresN();
    }
  
  // MONTANDO O JSON PARA ENVIAR VIA WEBSOCKET
  String json = "{";
  for (int j = 0; j < 3; j++) {
    json += "\"BEACON_0" + String(j+1) + "\":{";
    json += "\"rssi\":" + String(beacons[j].rssi_filtrado, 1) + ",";
    json += "\"n\":" + String(beacons[j].n_fator, 3) + ",";
    json += "\"distancia\":" + String(beacons[j].distancia, 2);
    json += "}";
    if (j < 2) json += ",";
  }
  json += "}";

  webSocket.broadcastTXT(json);

  WiFi.scanDelete();
  delay(300);
}
