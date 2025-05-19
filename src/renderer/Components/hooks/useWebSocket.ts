// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

const WS_URL = "ws://10.120.44.88:8082/ws";

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const connect = () => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('[WebSocket] connected');
      setIsConnected(true);

      // 예: topic 구독 요청 (서버가 이 형식을 받아줘야 함)
      ws.current?.send(JSON.stringify(
        { type: 'subscribe', topic: 'item', userId:'5000511001'}
      ));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 예: topic 기반 메시지 필터링
        if (data.type === 'SOLDOUT') {
          console.log("data:"+JSON.stringify(data))
          setMessages(data.body);
        }
      } catch (err) {
        console.warn('[WebSocket] Message parse error:', event.data);
      }
    };

    ws.current.onclose = () => {
      console.warn('[WebSocket] connection closed. Reconnecting...');
      setIsConnected(false);
      attemptReconnect();
    };

    ws.current.onerror = (err) => {
      console.error('[WebSocket] error', err);
      ws.current?.close(); // 오류 시 연결 종료 후 onclose에서 재연결
    };
  };

  const attemptReconnect = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, 3000); // 3초 후 재연결 시도
  };

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  return { isConnected, messages };
};
