import type { ClientMessage, MessageToServer, ServerMessage } from "./messages";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type SocketClientOptions = {
  onMessage: (message: ServerMessage) => void;
  onStatusChange: (status: ConnectionStatus) => void;
};

type SocketClient = {
  send: (command: MessageToServer) => boolean;
  close: () => void;
};

function resolveWebSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_WS_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export function createSocketClient(options: SocketClientOptions): SocketClient {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closedManually = false;

  const connect = () => {
    options.onStatusChange("connecting");
    socket = new WebSocket(resolveWebSocketUrl());

    socket.addEventListener("open", () => {
      options.onStatusChange("connected");
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data as string) as ServerMessage;
      options.onMessage(message);
    });

    socket.addEventListener("close", () => {
      if (closedManually) {
        options.onStatusChange("disconnected");
        return;
      }

      options.onStatusChange("disconnected");
      reconnectTimer = window.setTimeout(connect, 1500);
    });

    socket.addEventListener("error", () => {
      socket?.close();
    });
  };

  connect();

  return {
    send(command) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      const message: ClientMessage = {
        type: "command",
        requestId: crypto.randomUUID(),
        message: command,
      };

      socket.send(JSON.stringify(message));
      return true;
    },
    close() {
      closedManually = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    },
  };
}
