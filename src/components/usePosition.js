import { useMemo } from 'react';

//é o sistemadelocalização cpp adaptado p js e pra dois beacons

// trocar p posição dos beacons na sala
const BEACONS = [
  { nome: 'BEACON_01', x: 0.0, y: 0.0, altura: 0.0 },
  { nome: 'BEACON_02', x: 0.0, y: 5.5, altura: 0.0 },
];

const FORCA_REF = -45.0; // RSSI medido a 1 metro
const N         = 2.5;   // expoente de perda do ambiente

// fórmula: d = 10 ^ ((FORCA_REF - rssi) / (10 * N))
function calcularDistancia(rssi, altura) {
  if (!rssi || rssi === 0) return null; // beacon não encontrado
  const d = Math.pow(10, (FORCA_REF - rssi) / (10 * N));
  const compensado = Math.pow(d, 2) - Math.pow(altura, 2);
  if (compensado < 0) return Math.abs(d); // evita sqrt negativo
  return Math.sqrt(compensado);
}

// Com 2 beacons, calcula de qual tá mais perto

function calcularPosicao(d0, d1) {
  if (d0 === null || d1 === null) return null;

  const total = d0 + d1;
  const t = d0 / total;

  const x = BEACONS[0].x + t * (BEACONS[1].x - BEACONS[0].x);
  const y = BEACONS[0].y + t * (BEACONS[1].y - BEACONS[0].y);

  const maisPerto = d0 < d1 ? 'BEACON_01' : 'BEACON_02';

  return { x, y, d0, d1, maisPerto };
}

export function usePosition(rssi) {
  const posicao = useMemo(() => {
    if (!rssi) return null;

    const d0 = calcularDistancia(rssi['BEACON_01'], BEACONS[0].altura);
    const d1 = calcularDistancia(rssi['BEACON_02'], BEACONS[1].altura);

    return calcularPosicao(d0, d1);
  }, [rssi]);

  return posicao;
}

// posicao retorna:
// {
//   x: 0.0,          → posição X na sala em metros
//   y: 2.3,          → posição Y na sala em metros
//   d0: 1.5,         → distância até BEACON_01 em metros
//   d1: 4.0,         → distância até BEACON_02 em metros
//   maisPerto: 'BEACON_01'
// }
