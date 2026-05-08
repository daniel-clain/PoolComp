import type { BackendState } from "../../../shared/domain";
import type {
  MessageFromFrontendName,
  MessageToBackend,
} from "../../../shared/messageToBackend";
import type { MessageToFrontend } from "../../../shared/messageToFrontend";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type PendingAction = { requestId: string; action: MessageFromFrontendName } | null;


export function createWebSocketService(
  onStateUpdate: (state: BackendState) => void,
  onActionInProgress: (actionInProgress: boolean) => void,
  onConnectionStatusChange: (status: ConnectionStatus) => void,
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closedManually = false;


  let connected: boolean = false;

  function connect() {
    onConnectionStatusChange("connecting");
    socket = new WebSocket(getWebSocketUrl());

    socket.addEventListener("open", () => {
      connected = true;
      onConnectionStatusChange("connected");
    });

    socket.addEventListener("message", (event: MessageEvent<string>) => {

      const { message, data }: MessageToFrontend = JSON.parse(event.data);
      switch (message) {
        case "allData": {
          console.log("slots:", data?.activePoolComp?.slots.map((slot) => ({
            slotId: slot.id,
            player: data?.players.find((player) => player.id === slot.playerId)?.name
          })));
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
      connected = false;
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


  return { send, closeConnection, connected };

  function getWebSocketUrl(): string {
    const configuredWebSocketUrl = import.meta.env.VITE_WS_URL;
    if (configuredWebSocketUrl) {
      return configuredWebSocketUrl;
    }

    const webSocketProtocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${webSocketProtocol}//${window.location.host}/ws`;
  }

}
