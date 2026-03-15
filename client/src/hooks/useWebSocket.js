import { useRef, useState, useCallback, useEffect } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001/ws/chat/';

/**
 * useWebSocket — real-time chat hook
 * Connects to the backend WebSocket when available.
 * Falls back gracefully (connected=false) so the UI still works with mock data.
 */
export default function useWebSocket(threadId, { onMessage, onTyping } = {}) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!threadId) return;
    try {
      const ws = new WebSocket(`${WS_URL}${threadId}/`);

      ws.onopen = () => {
        setConnected(true);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'typing' && onTyping) {
            onTyping(data);
          } else if (data.type === 'message' && onMessage) {
            onMessage(data);
          }
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setConnected(false);
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      setConnected(false);
    }
  }, [threadId, onMessage, onTyping]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false; // signal caller to use local fallback
  }, []);

  const sendTyping = useCallback(() => {
    send({ type: 'typing', threadId });
  }, [send, threadId]);

  return { connected, send, sendTyping };
}
