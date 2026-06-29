import { useState, useEffect, useRef } from 'react';

// Definição da estrutura dos dados de RSSI que chegam da ESP
export interface RssiData {
  BEACON_01?: number;
  BEACON_02?: number;
  [key: string]: number | undefined;
}

const WS_URL = 'ws://192.168.0.3:81'; //colocar do notebook

export function useWebSocket(url = WS_URL) {
  const [rssi, setRssi] = useState<RssiData | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(" Conectado ao simulador de Wi-Fi!");
      setConectado(true);
    };
    
    ws.onclose = () => setConectado(false);
    ws.onerror = () => setConectado(false);

    ws.onmessage = (e) => {
      try {
        const dados: RssiData = JSON.parse(e.data);
        console.log("Dados recebidos da ESP no celular:", dados); 
        setRssi(dados);
      } catch (err) {
        console.error('Erro ao parsear JSON:', err);
      }
    };

    return () => ws.close();
  }, [url]);

  return { rssi, conectado };
}