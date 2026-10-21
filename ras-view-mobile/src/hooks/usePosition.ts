import { useMemo, useRef } from 'react';
import { RssiData } from './useWebSocket';
import  * as math  from 'mathjs';

interface BeaconConfig {
  x: number;
  y: number;
  altura: number;
  n: number; // para cada esp ter um especifico
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
  'RAS_BEACON_01': { x: 0.0, y: 0.0, altura: 2.3, n: 2.5 },
  'RAS_BEACON_02': { x: 0.0, y: 8.8, altura: 2.3, n: 2.5 },
  'RAS_BEACON_03': { x: 3.3, y: 8.8, altura: 2.3, n: 2.5 },
  'RAS_BEACON_04': { x: 3.3, y: 0.0, altura: 2.3, n: 2.5 },
};

const FORCA_REF = -45.0; // RSSI medido a 1 metro
const ALTURA_CEL = 1.5;  // altura média do celular 
const ALPHA      = 0.2;  // peso do filtro de suavização
const Q_KALMAN  = 0.1;  // ruido de processo (quanto maior, mais responsivo)
const R_KALMAN  = 0.1;  // ruido de medição (quão confiável é))

// Cálculo compensando a diferença de altura entre o beacon e o celular
function calcularDistancia(rssi: number | undefined, altura: number, n: number): number | null {
  if (!rssi || rssi === 0) return null;
  const d = Math.pow(10, (FORCA_REF - rssi) / (10 * n));
  
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
  const ultimoTempoRef = useRef<number>(Date.now());

  // ref para armazenar o buffer de log
  const logBufferRef = useRef({
    contador: 0,
    somas: { xBruto: 0, yBruto: 0, xKalman: 0, yKalman: 0 }
  });

  // kalman 
  const kalmanRef = useRef({
    x: math.matrix([[0], [0], [0], [0]]), // estado inicial (pos: x, y e vel: vx, vy
    P: math.matrix([ // matriz de covariância (incerteza)
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1000, 0],
      [0, 0, 0, 1000]
    ]) // essa incerteza de 1000 é q não confia qual é a velocidade inicial
  });
  const H = math.matrix([[1, 0 , 0, 0], [0, 1, 0, 0]]); // matriz de medição que recebe a posição e ignora a velocidade

  const criarF = (dt: number) => math.matrix([
    [1, 0, dt, 0],
    [0, 1, 0, dt],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]); //basicamente é quem calcula como a posição muda posicao = posicao + velocidade * dt

  const posicao = useMemo(() => {
    if (!rssi) return null;

    // calcula dt só quando há uma leitura nova
    const now = Date.now();
    const dt = (now - ultimoTempoRef.current)/1000;

    if (dt <= 0 || dt > 1) return null; // se o tempo entre leituras for muito grande, ignora
    ultimoTempoRef.current = now;

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

      const config = BEACONS_CONHECIDOS[nome] || { x: 0.0, y: 0.0, altura: 2.3, n: 2.5 };
      const dist = calcularDistancia(filtro.rssiEstimado, config.altura, config.n);

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

    // aplicação do kalman no resultado da trilateração
    const F = criarF(dt);

    const Q = math.matrix([ // ruído do processo
      [Q_KALMAN, 0, 0, 0],
      [0, Q_KALMAN, 0, 0],
      [0, 0, Q_KALMAN, 0],
      [0, 0, 0, Q_KALMAN]
    ]);

    const R = math.matrix([ // ruído da medição
      [R_KALMAN, 0], 
      [0, R_KALMAN]
    ]);

    // predição do estado
    const x_pred = math.multiply(F, kalmanRef.current.x);
    const FT = math.transpose(F);
    const P_pred = math.add(math.multiply(F, math.multiply(kalmanRef.current.P, FT)), Q);

    // medição recebida da trilateração
    const z = math.matrix([[coords.x], [coords.y]]);

    // atualização/correção da medição
    const HT = math.transpose(H);
    const y_inov = math.subtract(z, math.multiply(H, x_pred));
    const S = math.add(math.multiply(H, math.multiply(P_pred, HT)), R);
    const K = math.multiply(P_pred, math.multiply(HT, math.inv(S)));

    const x_novo = math.add(x_pred, math.multiply(K, y_inov));

    const I = math.identity(4);
    const P_novo = math.multiply(math.subtract(I, math.multiply(K, H)), P_pred);
    
    // atualiza o estado do kalman
    kalmanRef.current.x = x_novo;
    kalmanRef.current.P = P_novo;

    // pega as coordenadas filtradas pelo kalman suavizando a posição
    const x_array = x_novo.valueOf() as number[][];
    const xSuave = x_array[0][0];
    const ySuave = x_array[1][0];
    
    // --- LOG DE ROTAÇÃO EM ROTAÇÃO (Linha única compacta) ---
    console.log(
      `%c[Frame] %cBruto: (%c${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}%c) | %cKalman: (%c${xSuave.toFixed(2)}, ${ySuave.toFixed(2)}%c) | dt: ${dt.toFixed(3)}s`,
      'color: gray; font-weight: bold;',
      'color: inherit;', 'color: #ff9800; font-weight: bold;', 'color: inherit;',
      'color: inherit;', 'color: #4caf50; font-weight: bold;', 'color: inherit;'
    );

    // --- LOG EM TABELA A CADA 10 ROTAÇÕES (Média) ---
    const buffer = logBufferRef.current;
    buffer.contador++;
    buffer.somas.xBruto += coords.x;
    buffer.somas.yBruto += coords.y;
    buffer.somas.xKalman += xSuave;
    buffer.somas.yKalman += ySuave;

    if (buffer.contador >= 10) {
      const mediaBrutaX = buffer.somas.xBruto / 10;
      const mediaBrutaY = buffer.somas.yBruto / 10;
      const mediaKalmanX = buffer.somas.xKalman / 10;
      const mediaKalmanY = buffer.somas.yKalman / 10;

      console.log(`%c  --- RESUMO DA MÉDIA (Últimas 10 rotações) ---`, 'color: #00bcd4; font-weight: bold; background: #222; padding: 2px 5px;');
      console.table({
        'Trilateração (Bruto)': { X: Number(mediaBrutaX.toFixed(2)), Y: Number(mediaBrutaY.toFixed(2)) },
        'Filtro de Kalman':      { X: Number(mediaKalmanX.toFixed(2)), Y: Number(mediaKalmanY.toFixed(2)) },
      });

      // Reseta o buffer
      buffer.contador = 0;
      buffer.somas = { xBruto: 0, yBruto: 0, xKalman: 0, yKalman: 0 };
    }

    return {
      x: xSuave,
      y: ySuave ,
      d0: p0.dist,
      d1: p1.dist,
      d2: p2.dist,
      nomes: [redes[0][0], redes[1][0], redes[2][0]]
    };
  }, [rssi]);

  return posicao;
}
