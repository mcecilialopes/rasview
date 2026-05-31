//pedi pra LLM criar esse arquivo para teste


import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || null;

const DEFAULT_POS = { x: 0.25, y: 0.50 };


function useSimulation(enabled, setPosition, setEspSignals) {
  const frameRef = useRef(null);
  const timeRef  = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      setPosition({
        x: 0.25 + Math.sin(t)     * 0.20,
        y: 0.50 + Math.sin(t * 2) * 0.18,
      });

      setEspSignals([
        { id: 'ESP-01', rssi: Math.round(-45 - Math.abs(Math.sin(t))     * 35) },
        { id: 'ESP-02', rssi: Math.round(-50 - Math.abs(Math.sin(t + 2)) * 35) },
        { id: 'ESP-03', rssi: Math.round(-48 - Math.abs(Math.sin(t + 4)) * 35) },
      ]);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [enabled, setPosition, setEspSignals]);
}

export function usePosition() {
  const [position,   setPosition]   = useState(DEFAULT_POS);
  const [espSignals, setEspSignals] = useState([
    { id: 'ESP-01', rssi: null },
    { id: 'ESP-02', rssi: null },
    { id: 'ESP-03', rssi: null },
  ]);
  const [status, setStatus] = useState(WS_URL ? 'connecting' : 'simulation');
  const wsRef = useRef(null);

  // Ativa simulação só quando não há URL de backend
  useSimulation(!WS_URL, setPosition, setEspSignals);

  const connect = useCallback(() => {
    if (!WS_URL) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen    = () => setStatus('online');
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.x === 'number' && typeof data.y === 'number') {
          setPosition({
            x: Math.max(0.05, Math.min(0.95, data.x)),
            y: Math.max(0.05, Math.min(0.95, data.y)),
          });
        }
        if (Array.isArray(data.esp)) setEspSignals(data.esp);
      } catch (_) {}
    };
    ws.onerror = () => setStatus('error');
    ws.onclose = () => {
      setStatus('reconnecting');
      setTimeout(connect, 3000); // reconecta automaticamente
    };
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { position, espSignals, status };
}