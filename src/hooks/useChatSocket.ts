import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { storage } from "@/utils/storage";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

export type ChatSocketEvent = {
  type: string;
  conversation_id?: number;
  message?: import("@/types/chat").ChatMessage;
  user_id?: number;
  is_typing?: boolean;
};

export function useChatSocket(
  enabled: boolean,
  onEvent: (event: ChatSocketEvent) => void,
  onReconnect?: () => void,
) {
  const callback = useRef(onEvent);
  const reconnectCallback = useRef(onReconnect);
  const socketRef = useRef<WebSocket | null>(null);
  const authenticatedRef = useRef(false);
  callback.current = onEvent;
  reconnectCallback.current = onReconnect;

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    const socket = socketRef.current;
    if (authenticatedRef.current && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: isTyping ? "typing.start" : "typing.stop",
        conversation_id: conversationId,
      }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let wasConnected = false;
    let connecting = false;

    const connect = async () => {
      if (connecting || socket?.readyState === WebSocket.OPEN) return;
      connecting = true;
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (stopped || !token) { connecting = false; return; }
      const url = ENV.API_URL.replace(/^http/, "ws").replace(/\/$/, "") + "/ws/chat/";
      const connection = new WebSocket(url);
      socket = connection;
      socketRef.current = connection;
      authenticatedRef.current = false;
      connection.onopen = () => {
        connecting = false;
        connection.send(JSON.stringify({ type: "auth", access_token: token }));
      };
      connection.onmessage = (raw) => {
        try {
          const event = JSON.parse(raw.data) as ChatSocketEvent;
          if (event.type === "auth.ok") {
            authenticatedRef.current = true;
            attempts = 0;
            if (wasConnected) reconnectCallback.current?.();
            wasConnected = true;
          } else {
            callback.current(event);
          }
        } catch {
          // Ignore malformed server frames.
        }
      };
      connection.onclose = () => {
        authenticatedRef.current = false;
        if (socketRef.current === connection) socketRef.current = null;
        connecting = false;
        if (stopped) return;
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 15000));
      };
      connection.onerror = () => connection.close();
    };

    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active" && !connecting && (!socket || socket.readyState === WebSocket.CLOSED)) {
        if (retry) clearTimeout(retry);
        connect();
      }
    });
    connect();
    return () => {
      stopped = true;
      appState.remove();
      if (retry) clearTimeout(retry);
      authenticatedRef.current = false;
      socketRef.current = null;
      socket?.close();
    };
  }, [enabled]);

  return { sendTyping };
}
