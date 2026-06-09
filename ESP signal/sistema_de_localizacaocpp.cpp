#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

// Esse struct "cadastra" cada ESP com suas informações
typedef struct
{
    string nome; // nome configurado no código da ESP
    float x, y, altura; // posição física dela na sala (em metros)
    int RSSI; // sinal que ela tá emitindo
} Esp;

// nossas 3 ESPs — preencher x, y e RSSI antes de usar
vector<Esp> minhasEsps =
{
    { "BEACON_01", 0.0f, 0.0f, 0.0f, 0}, // nome da esp, posição x no ambiente, posição y, altura e RSSI
    { "BEACON_02", 0.0f, 5.5f, 0.0f, 0},
    { "BEACON_03", 4.4f, 5.5f, 0.0f, 0},
};

// RSSI medido a exatamente 1 metro de distância
const float forcaDeReferencia = -45.0f;

// Valor fixo de N para o ambiente
const float n = 2.5f;

// aplicação da fórmula Log path distance loss
// d = 10 ^ ((forcaDeReferencia - RSSI_atual) / (10 * n))

// converte RSSI em distancia
float calcularDistancia(int rssi, float n, float altura_beacon)
{
    float distancia = pow(10.0f, (forcaDeReferencia - rssi) / (10.0f * n));
    float distancia_compensada = pow(distancia, 2) - pow(altura_beacon, 2);

    return sqrt(distancia_compensada);
}


// calcula onde voce esta com base nas 3 distancias
void trilaterar(float r0, float r1, float r2) 
{
    float posx_esp0 = minhasEsps[0].x;
    float posy_esp0 = minhasEsps[0].y;
    float posx_esp1 = minhasEsps[1].x;
    float posy_esp1 = minhasEsps[1].y;
    float posx_esp2 = minhasEsps[2].x;
    float posy_esp2 = minhasEsps[2].y;

    float a1 = 2 * (posx_esp1 - posx_esp0);
    float b1 = 2 * (posy_esp1 - posy_esp0);
    float c1 = (r0*r0) - (r1*r1) - (posx_esp0*posx_esp0) + (posx_esp1*posx_esp1) - (posy_esp0*posy_esp0) + (posy_esp1*posy_esp1);

    float a2 = 2 * (posx_esp2 - posx_esp1);
    float b2 = 2 * (posy_esp2 - posy_esp1);
    float c2 = (r1*r1) - (r2*r2) - (posx_esp1*posx_esp1) + (posx_esp2*posx_esp2) - (posy_esp1*posy_esp1) + (posy_esp2*posy_esp2);

    float det = (a1 * b2) - (b1 * a2);

    // divisão por zero caso as ESPs estejam colineares
    if (abs(det) < 0.001f) 
    {
        cout << "Erro: ESPs colineares. Trilateracao falhou.\n";
    }

    float posX = ((c1 * b2) - (c2 * b1)) / det;
    float posY = ((a1 * c2) - (a2 * c1)) / det;

    cout << "Pos -> X: " << posX << "m | Y: " << posY << "m\n";
}

int main()
{
    // preencher com o RSSI atual de cada ESP
    minhasEsps[0].RSSI = -53; // beacon 1
    minhasEsps[1].RSSI = -62; // beacon 2
    minhasEsps[2].RSSI = -58; // beacon 3

    cout << "=== RECEPTOR DE BEACONS (N: " << n << ") ===\n";

    float distancias[3];

    for (int i = 0; i < minhasEsps.size(); i++)
    {
        distancias[i] = calcularDistancia(minhasEsps[i].RSSI, n, minhasEsps[i].altura);
        cout << minhasEsps[i].nome << " | RSSI: " << minhasEsps[i].RSSI << " dBm" << " | Distancia: " << distancias[i] << " metros\n";
    }

    cout << "\n=== CALCULANDO POSICAO ===\n\n";
    trilaterar(distancias[0], distancias[1], distancias[2]);

    return 0;
}