import { useMemo, useRef } from 'react';

// === CONFIGURAÇÕES DO AMBIENTE (Idêntico ao C++) ===
const BEACONS = [
  { nome: 'BEACON_01', x: 0.0, y: 0.0, altura: 2.3 },
  { nome: 'BEACON_02', x: 0.0, y: 8.8, altura: 2.3 },
  { nome: 'BEACON_03', x: 3.3, y: 8.8, altura: 2.3 }
];

const RSSI_REF = -45.0;      // RSSI medido a 1 metro de distância
const N_PATH = 2.5;          // Constante de perda do ambiente
const ALTURA_CEL = 1.5;      // Altura média do celular na mão do usuário
const ALPHA = 0.2;           // Peso do filtro EWMA

// === MATEMÁTICA DE CONVERSÃO: RSSI -> DISTÂNCIA ===
function calcularDistancia(rssi, alturaBeacon) {
  if (!rssi || rssi === 0) return 0;
  
  // d = 10 ^ ((RSSI_REF - RSSI) / (10 * N_PATH))
  const d = Math.pow(10, (RSSI_REF - rssi) / (10 * N_PATH));
  const deltaH = alturaBeacon - ALTURA_CEL;
  const dQuadrado = Math.pow(d, 2) - Math.pow(deltaH, 2);
  const dCompensada = Math.max(0.0, dQuadrado);
  
  return Math.sqrt(dCompensada);
}

// === TRILATERAÇÃO (Conversão de 3 distâncias em coordenadas X, Y) ===
function trilaterar(r0, r1, r2) {
  const esp0 = BEACONS[0];
  const esp1 = BEACONS[1];
  const esp2 = BEACONS[2];

  const a1 = 2 * (esp1.x - esp0.x);
  const b1 = 2 * (esp1.y - esp0.y);
  const c1 = Math.pow(r0, 2) - Math.pow(r1, 2) - Math.pow(esp0.x, 2) + Math.pow(esp1.x, 2) - Math.pow(esp0.y, 2) + Math.pow(esp1.y, 2);

  const a2 = 2 * (esp2.x - esp0.x);
  const b2 = 2 * (esp2.y - esp0.y);
  const c2 = Math.pow(r0, 2) - Math.pow(r2, 2) - Math.pow(esp0.x, 2) + Math.pow(esp2.x, 2) - Math.pow(esp0.y, 2) + Math.pow(esp2.y, 2);

  const determinante = (a1 * b2) - (b1 * a2);

  if (Math.abs(determinante) < 0.001) {
    return null; // Evita divisão por zero se as ESPs estiverem colineares
  }

  const posX = ((c1 * b2) - (c2 * b1)) / determinante;
  const posY = ((a1 * c2) - (a2 * c1)) / determinante;

  return { x: posX, y: posY };
}

export function usePosition(rssi) {
  // Preserva o estado do filtro EWMA de forma contínua entre as renders do React
  const ewmaRef = useRef({
    'BEACON_01': null,
    'BEACON_02': null,
    'BEACON_03': null,
  });

  const posicaoCalculada = useMemo(() => {
    if (!rssi) return null;

    // Função interna para aplicar o EWMA
    const filtrarRSSI = (nome, rssiMedido) => {
      if (rssiMedido === undefined || rssiMedido === null) return null;
      const valorAnterior = ewmaRef.current[nome];
      
      if (valorAnterior === null) {
        ewmaRef.current[nome] = rssiMedido;
        return rssiMedido;
      }
      
      const valorFiltrado = ALPHA * rssiMedido + (1 - ALPHA) * valorAnterior;
      ewmaRef.current[nome] = valorFiltrado;
      return valorFiltrado;
    };

    // 1. Aplica o filtro de sinal individualmente
    const r0 = filtrarRSSI('BEACON_01', rssi['BEACON_01']);
    const r1 = filtrarRSSI('BEACON_02', rssi['BEACON_02']);
    const r2 = filtrarRSSI('BEACON_03', rssi['BEACON_03']);

    // 2. Calcula as distâncias compensando a diferença de altura (3D -> 2D)
    const d0 = calcularDistancia(r0, BEACONS[0].altura);
    const d1 = calcularDistancia(r1, BEACONS[1].altura);
    const d2 = calcularDistancia(r2, BEACONS[2].altura);

    // 3. Executa a trilateração para encontrar a coordenada no plano
    const ponto = trilaterar(d0, d1, d2);

    if (!ponto) return null;

    return {
      x: ponto.x,
      y: ponto.y,
      d0,
      d1,
      d2,
      rssiFiltrados: { BEACON_01: r0, BEACON_02: r1, BEACON_03: r2 }
    };
  }, [rssi]);

  return posicaoCalculada;
}