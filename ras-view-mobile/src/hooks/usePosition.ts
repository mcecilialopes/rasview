import { useMemo, useRef } from 'react';
import { RssiData } from './useWebSocket';

interface BeaconConfig {
  x: number;
  y: number;
  altura: number;
}

export interface PosicaoResultado {
  x: number;
  y: number;
  d0: number;
  d1: number;
  d2: number;
  nomes: string[];
}

// "Banco de dados" com as posições físicas (em metros) na sala.
const BEACONS_CONHECIDOS: Record<string, BeaconConfig> = {
  'RAS_BEACON_01': { x: 0.0, y: 0.0, altura: 2.3 },
  'RAS_BEACON_02': { x: 0.0, y: 8.8, altura: 2.3 },
  'RAS_BEACON_03': { x: 3.3, y: 8.8, altura: 2.3 },
  'RAS_BEACON_04': { x: 3.3, y: 0.0, altura: 2.3 },
};

const FORCA_REF = -45.0; // RSSI medido a 1 metro
const N         = 2.5;   // expoente de perda do ambiente
const ALTURA_CEL = 1.5;  // altura média do celular 
const ALPHA      = 0.2;  // peso do filtro de suavização

// Cálculo compensando a diferença de altura entre o beacon e o celular
function calcularDistancia(rssi: number | undefined, altura: number): number | null {
  if (!rssi || rssi === 0) return null;
  const d = Math.pow(10, (FORCA_REF - rssi) / (10 * N));
  
  const delta_h = altura - ALTURA_CEL;
  const compensado = Math.pow(d, 2) - Math.pow(delta_h, 2);
  
  if (compensado < 0) return Math.abs(d);
  return Math.sqrt(compensado);
}

// Intersecção de 3 círculos dinâmica 
function trilaterar(
  beacon0: BeaconConfig, d0: number, 
  beacon1: BeaconConfig, d1: number, 
  beacon2: BeaconConfig, d2: number
): { x: number, y: number } | null {
  const a1 = 2 * (beacon1.x - beacon0.x);
  const b1 = 2 * (beacon1.y - beacon0.y);
  const c1 = Math.pow(d0, 2) - Math.pow(d1, 2) - Math.pow(beacon0.x, 2) + Math.pow(beacon1.x, 2) - Math.pow(beacon0.y, 2) + Math.pow(beacon1.y, 2);
  
  const a2 = 2 * (beacon2.x - beacon0.x);
  const b2 = 2 * (beacon2.y - beacon0.y);
  const c2 = Math.pow(d0, 2) - Math.pow(d2, 2) - Math.pow(beacon0.x, 2) + Math.pow(beacon2.x, 2) - Math.pow(beacon0.y, 2) + Math.pow(beacon2.y, 2);
  
  const det = a1 * b2 - b1 * a2;
  
  // Previne erro de divisão por zero
  if (Math.abs(det) < 0.001) return null; 
  
  return {
    x: (c1 * b2 - c2 * b1) / det,
    y: (a1 * c2 - a2 * c1) / det,
  };
}

export function usePosition(rssi: RssiData | null): PosicaoResultado | null {
  // Filtro EWMA
  const filtros = useRef<Record<string, { rssiEstimado: number, primeiraLeitura: boolean }>>({});

  const posicao = useMemo(() => {
    if (!rssi) return null;

    // ordena e pega as 3 mais fortes
    const redes = Object.entries(rssi)
      .sort(([, rssiA], [, rssiB]) => (rssiB as number) - (rssiA as number))
      .slice(0, 3);

    // A trilateração exige 3 distâncias
    if (redes.length < 3) return null;

    // processa os sinais passando pelo EWMA e Pitágoras
    const processados = redes.map(([nome, rssiBruto]) => {
    
      if (!filtros.current[nome]) {
        filtros.current[nome] = { rssiEstimado: rssiBruto as number, primeiraLeitura: true };
      }
      
      const filtro = filtros.current[nome];

      if (filtro.primeiraLeitura) {
        filtro.rssiEstimado = rssiBruto as number;
        filtro.primeiraLeitura = false;
      } else {
        filtro.rssiEstimado = ALPHA * (rssiBruto as number) + (1 - ALPHA) * filtro.rssiEstimado;
      }

      const config = BEACONS_CONHECIDOS[nome] || { x: 0.0, y: 0.0, altura: 2.3 };
      const dist = calcularDistancia(filtro.rssiEstimado, config.altura);

      return { config, dist };
    });

    const [p0, p1, p2] = processados;

    if (p0.dist === null || p1.dist === null || p2.dist === null) return null;

    const coords = trilaterar(
      p0.config, p0.dist, 
      p1.config, p1.dist, 
      p2.config, p2.dist
    );

    if (!coords) return null;

    return {
      x: coords.x,
      y: coords.y,
      d0: p0.dist,
      d1: p1.dist,
      d2: p2.dist,
      nomes: [redes[0][0], redes[1][0], redes[2][0]]
    };
  }, [rssi]);

  return posicao;
}