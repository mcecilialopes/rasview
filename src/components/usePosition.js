import { useMemo, useRef } from 'react';

const BEACONS = [
    { nome: 'BEACON_01', x: 0.0, y: 0.0, altura: 2.3 },
    { nome: 'BEACON_02', x: 0.0, y: 8.8, altura: 2.3 },
    { nome: 'BEACON_03', x: 3.3, y: 8.8, altura: 2.3 }
];

const RSSI_REF = -45.0;
const N_PATH = 2.5;
const ALTURA_CEL = 1.5;
const ALPHA = 0.2;

function calcularDistancia(rssi, alturaBeacon) {
    if (!rssi) return 0;
    const d = Math.pow(10, (RSSI_REF - rssi) / (10 * N_PATH));
    const deltaH = alturaBeacon - ALTURA_CEL;
    const dQuadrado = Math.pow(d, 2) - Math.pow(deltaH, 2);
    const dCompensada = Math.max(0.0, dQuadrado);
    return Math.sqrt(dCompensada);
}

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
    if (Math.abs(determinante) < 0.001) return null;

    const posX = ((c1 * b2) - (c2 * b1)) / determinante;
    const posY = ((a1 * c2) - (a2 * c1)) / determinante;
    return { x: posX, y: posY };
}

export function usePosition(rssi) {
    const ewmaRef = useRef({ BEACON_01: null, BEACON_02: null, BEACON_03: null });

    const posicaoCalculada = useMemo(() => {
        if (!rssi) return null;

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

        // organiza rssi filtrado + distancia por nome do beacon, num unico lugar
        const beacons = {};
        BEACONS.forEach((beacon) => {
            const rssiFiltrado = filtrarRSSI(beacon.nome, rssi[beacon.nome]);
            beacons[beacon.nome] = {
                rssi: rssiFiltrado,
                distancia: calcularDistancia(rssiFiltrado, beacon.altura),
            };
        });

        const ponto = trilaterar(
            beacons[BEACONS[0].nome].distancia,
            beacons[BEACONS[1].nome].distancia,
            beacons[BEACONS[2].nome].distancia
        );

        if (!ponto) return null;

        return {
            x: ponto.x,
            y: ponto.y,
            beacons, // ex: beacons.BEACON_01.distancia, beacons.BEACON_01.rssi
        };
    }, [rssi]);

    return posicaoCalculada;
}