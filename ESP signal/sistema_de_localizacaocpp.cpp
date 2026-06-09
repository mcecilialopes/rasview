#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

typedef struct
{
    string nome;        // nome configurado no código da ESP
    float x, y, altura; // posição física dela na sala (em metros)
    int RSSI;           // sinal que ela tá emitindo
} Esp;

// nossas 3 ESPs — preencher x, y e RSSI antes de usar
vector<Esp> minhasEsps =
    {
        {"BEACON_01", 0.0f, 0.0f, 2.3f, 0}, // nome da esp, posição x no ambiente, posição y, altura e RSSI
        {"BEACON_02", 0.0f, 8.8f, 2.3f, 0},
        {"BEACON_03", 3.3f, 8.8f, 2.3f, 0},
    };

const float RSSIref = -45.0f; // RSSI medido a 1 metro de distância
const float n = 2.5f; // Valor fixo de N para o ambiente (Lembrar -> Fazer a calibração dele pra se moldar a cada ambiente)
const float altura_cel = 1.5f; // altura do celular na mão da pessoa

// aplicação da fórmula Log path distance loss
// d = 10 ^ ((forcaDeReferencia - RSSI_atual) / (10 * n))
// converte RSSI em distancia
float calcularDistancia(int rssi, float n, float altura_beacon)
{
    float distancia = pow(10.0f, (RSSIref - rssi) / (10.0f * n));

    float delta_h = altura_beacon - altura_cel;
    float distancia_quadrado = pow(distancia, 2) - pow(delta_h, 2);

    float distancia_compensada = max(0.0f, distancia_quadrado);

    return sqrt(distancia_compensada);
}

// calcula onde voce esta com base nas 3 distancias
void trilaterar(float r0, float r1, float r2)
{
    float a1 = 2 * (minhasEsps[1].x - minhasEsps[0].x);
    float b1 = 2 * (minhasEsps[1].y - minhasEsps[0].y);
    float c1 = (r0*r0) - (r1*r1) - (minhasEsps[0].x*minhasEsps[0].x) + (minhasEsps[1].x*minhasEsps[1].x) - (minhasEsps[0].y*minhasEsps[0].y) + (minhasEsps[1].y*minhasEsps[1].y);

    float a2 = 2 * (minhasEsps[2].x - minhasEsps[0].x);
    float b2 = 2 * (minhasEsps[2].y - minhasEsps[0].y);
    float c2 = (r0*r0) - (r2*r2) - (minhasEsps[0].x*minhasEsps[0].x) + (minhasEsps[2].x*minhasEsps[2].x) - (minhasEsps[0].y*minhasEsps[0].y) + (minhasEsps[2].y*minhasEsps[2].y);

    float determinante = (a1*b2) - (b1*a2);

    if (abs(determinante) < 0.001f)
    {
        cout << "Erro: ESPs colineares. Trilateracao falhou.\n";
        return;
    }

    float posX = ((c1*b2) - (c2*b1)) / determinante;
    float posY = ((a1*c2) - (a2*c1)) / determinante;
    cout << "Pos -> X: " << posX << "m | Y: " << posY << "m\n";
}

int main()
{
    // preencher com o RSSI atual de cada ESP
    minhasEsps[0].RSSI = -56; // beacon 1
    minhasEsps[1].RSSI = -70; // beacon 2
    minhasEsps[2].RSSI = -64; // beacon 3

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