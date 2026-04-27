import type { AllData } from "../../../shared/domain";
import type {
  MessageFromFrontendName,
  MessageToBackend,
} from "../../../shared/messageToBackend";
import type { MessageToFrontend } from "../../../shared/messageToFrontend";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type PendingAction = { requestId: string; action: MessageFromFrontendName } | null;

const WS_URL = import.meta.env.VITE_WS_URL;


export function createWebSocketService(
  onStateUpdate: (state: AllData) => void,
  onActionInProgress: (actionInProgress: boolean) => void,
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

      const { message, data }: MessageToFrontend = JSON.parse(event.data);
      switch (message) {
        case "allData": {
          console.log("slots:", data.activePoolComp?.slots);
          onStateUpdate(data);
          break;
        }
        case "actionInProgress": {

          console.log("actionInProgress:", data);
          onActionInProgress(data);
          break;
        }
      }
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
