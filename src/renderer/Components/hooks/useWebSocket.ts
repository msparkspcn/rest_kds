import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@Components/store/user';
import { log } from '@Components/utils/logUtil';

const WS_URL = 'ws://10.120.44.88:8082/ws';
type Message = {
  type: string;
  body: any;
};
export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessagesInternal] = useState<Message[]>([]);
  const getUserId = useUserStore((state) => state.userId);
  const user = useUserStore((state) => state.user);

  const connect = () => {
    log("connect user:"+JSON.stringify(user));
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      log(`[WebSocket] connected userId:${getUserId}`);
      setIsConnected(true);

      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        topic: 'item',
        userId: getUserId,
        salesOrgCd: user?.salesOrgCd,
        storCd: user?.storCd,
        cornerCd: user?.cornerCd,
        deviceType: 'KDS'
      }));
      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        topic: 'order',
        userId: getUserId,
        salesOrgCd: user?.salesOrgCd,
        storCd: user?.storCd,
        cornerCd: user?.cornerCd,
        deviceType: 'KDS'
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 예: topic 기반 메시지 필터링
        //주문은 order
        if ('SOLDOUT'.includes(data.type)) {
          log(`SOLDOUT data:${JSON.stringify(data)}`);
          setMessages(data.type, data.body);
        }
        else if('order'.includes(data.type)) {
          log(`order data:${JSON.stringify(data)}`);
          setMessages(data.type, data.data);
        }
      } catch (err) {
        console.warn('[WebSocket] Message parse error:', event.data);
      }
    };

    const setMessages = (type:string, body: any) => {
      setMessagesInternal((prev) => {
        const filtered = prev.filter((msg) => msg.type !== type);
        return [...filtered, { type, body }];
      });
    };

    ws.current.onclose = () => {
      console.warn('[WebSocket] connection closed. Reconnecting...');
      setIsConnected(false);
      attemptReconnect();
    };

    ws.current.onerror = (err) => {
      console.error('[WebSocket] error', err);
      ws.current?.close(); // 오류 시 연결 종료 후 onclose 에서 재연결
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
