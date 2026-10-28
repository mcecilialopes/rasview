import { useState, useEffect, useRef } from 'react';


// como o json ta formulado
export interface BeaconDetail{
  rssi: number;
  n: number;
  distancia: number;
}

export interface BeaconData {
  BEACON_01?: BeaconDetail;
  BEACON_02?: BeaconDetail;
  BEACON_03?: BeaconDetail;
  [key: string]: BeaconDetail | undefined;
}

const WS_URL = 'ws://192.168.0.4:81'; // Lembre de conferir se este IP é o do seu PC atual

export function useWebSocket(url = WS_URL) {
  const [data, setData] = useState<BeaconData | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Conectado ao simulador de Wi-Fi!");
      setConectado(true);
    };
    
    ws.onclose = () => setConectado(false);
    ws.onerror = () => setConectado(false);

    ws.onmessage = (e) => {
      try {
        const dados: BeaconData = JSON.parse(e.data);
        setData(dados);
      } catch (err) {
        console.error('Erro ao parsear JSON:', err);
      }
    };

    return () => ws.close();
  }, [url]);

  return { data, conectado };
}
