import type { AllData } from "../../../shared/domain";
import type {
  ClientEnvelope,
  MessageName,
  MessageToBackend,
  ServerMessage,
} from "../../../shared/messageToBackend";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type PendingAction = { requestId: string; action: MessageName } | null;

const WS_URL = import.meta.env.VITE_WS_URL;

const ACTION_TIMEOUT_MS = 10_000;

export function createWebSocketService(
  onStateUpdate: (state: AllData) => void,
  onConnectionStatusChange: (status: ConnectionStatus) => void,
  onPendingActionChange: (pending: PendingAction) => void,
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closedManually = false;
  const pendingRequests = new Map<string, { timer: number }>();

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

    socket.addEventListener("message", (event) => {
      const serverMessage = JSON.parse(event.data as string) as ServerMessage;
      handleServerMessage(serverMessage);
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

  function handleServerMessage(serverMessage: ServerMessage) {
    switch (serverMessage.message) {
      case "stateSnapshot":
        onStateUpdate(serverMessage.data);
        break;

      case "asyncPending":
        onPendingActionChange({
          requestId: serverMessage.data.requestId,
          action: serverMessage.data.action,
        });
        break;

      case "actionSettled": {
        const entry = pendingRequests.get(serverMessage.data.requestId);
        if (entry) {
          clearTimeout(entry.timer);
          pendingRequests.delete(serverMessage.data.requestId);
        }
        if (serverMessage.data.ok) {
          onStateUpdate(serverMessage.data.state);
        } else {
          window.alert(serverMessage.data.reason);
        }
        onPendingActionChange(null);
        break;
      }

      case "databaseUnavailable":
        onConnectionStatusChange("disconnected");
        break;
    }
  }

  function sendMessageToBackend(message: MessageToBackend): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const requestId = crypto.randomUUID();
    const envelope: ClientEnvelope = { ...message, requestId };

    const timer = window.setTimeout(() => {
      pendingRequests.delete(requestId);
      onPendingActionChange(null);
    }, ACTION_TIMEOUT_MS);

    pendingRequests.set(requestId, { timer });
    socket.send(JSON.stringify(envelope));
  }

  function closeConnection() {
    closedManually = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    socket?.close();
  }

  connect();

  return { sendMessageToBackend, closeConnection };
}
