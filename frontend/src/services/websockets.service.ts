import type { AllData } from "../../../shared/domain";
import type {
  MessageName,
  MessageToBackend,
} from "../../../shared/messageToBackend";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type PendingAction = { requestId: string; action: MessageName } | null;

const WS_URL = import.meta.env.VITE_WS_URL;


export function createWebSocketService(
  onStateUpdate: (state: AllData) => void,
  onConnectionStatusChange: (status: ConnectionStatus) => void,
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closedManually = false;

  function connect() {
    onConnectionStatusChange("connecting");
    if (!WS_URL) {
      console.error("VITE_WS_URL is not configured in .env file.");
      return;
    }
    socket = new WebSocket(WS_URL);

    socket.addEventListener("open", () => {
      onConnectionStatusChange("connected");
    });

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const allData: AllData = JSON.parse(event.data);
      onStateUpdate(allData);
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


  function send(message: MessageToBackend): void {
    if (!socket) throw new Error("Socket not connected");
    socket.send(JSON.stringify(message));
  }

  function closeConnection() {
    closedManually = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    socket?.close();
  }

  connect();

  return { send, closeConnection };
}
