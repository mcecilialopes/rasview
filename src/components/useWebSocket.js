import { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://192.168.1.100:81';

export function useWebSocket(url = WS_URL) {
  const [rssi, setRssi] = useState(null); 
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    // mostra se ta online/offline
    ws.onopen = () => setConectado(true);
    ws.onclose = () => setConectado(false);
    ws.onerror = () => setConectado(false);

    // toda vez q recebe um json novo ele salva no rssi
    ws.onmessage = (e) => {
      try {
        const dados = JSON.parse(e.data);
        setRssi(dados);
      } catch (err) {
        console.error('Erro ao parsear JSON:', err);
      }
    };

    return () => ws.close();
  }, [url]);

  //retorna os valores para o usePosition
  return { rssi, conectado };
}
