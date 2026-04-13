import type { AllData } from "../../../shared/domain";
import type { MessageToBackend } from "../../../shared/messageToBackend";

export function createWebSocketService(
  onStateUpdateFromBackend: (state: AllData) => void,
  onConnectionStatusChange: (connectionStatus: ConnectionStatus) => void,
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closedManually = false;

  function connect() {
    onConnectionStatusChange("connecting");
    socket = new WebSocket(resolveWebSocketUrl());

    socket.addEventListener("open", () => {
      onConnectionStatusChange("connected");
    });

    socket.addEventListener("message", (event) => {
      const updatedState = JSON.parse(event.data as string) as AllData;
      onStateUpdateFromBackend(updatedState);
    });

    socket.addEventListener("close", () => {
      if (closedManually) {
        onConnectionStatusChange("disconnected");
        return;
      }

      onConnectionStatusChange("disconnected");
      reconnectTimer = window.setTimeout(connect, 1500);
    });

    socket.addEventListener("error", () => {
      socket?.close();
    });
  }

  connect();
  function sendMessageToBackend(message: MessageToBackend) {
    socket?.send(JSON.stringify(message));
  }

  function closeConnection() {
    socket?.close();
  }

  return { sendMessageToBackend, closeConnection };

  function resolveWebSocketUrl(): string {
    const configuredUrl = import.meta.env.VITE_WS_URL;
    if (configuredUrl) {
      return configuredUrl;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
