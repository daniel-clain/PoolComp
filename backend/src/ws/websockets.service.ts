import { WebSocket, type WebSocketServer } from "ws";
import type { AllData } from "../../../shared/domain.js";
import type {
  ClientEnvelope,
  ServerMessage,
} from "../../../shared/messageToBackend.js";

type WebSocketServiceOptions = {
  validMessages: Set<string>;
  onMessage: (envelope: ClientEnvelope, socket: WebSocket) => void;
  getState: () => AllData;
};

export type WebSocketService = {
  send: (socket: WebSocket, message: ServerMessage) => void;
  broadcast: (message: ServerMessage) => void;
};

function parseClientEnvelope(
  raw: string,
  validMessages: Set<string>,
): ClientEnvelope {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object")
    throw new Error("Invalid message format");
  if (typeof parsed.requestId !== "string" || !parsed.requestId)
    throw new Error("Missing requestId");
  if (typeof parsed.message !== "string" || !validMessages.has(parsed.message))
    throw new Error(`Unknown message: ${parsed.message}`);
  return parsed as ClientEnvelope;
}

export function createWebSocketService(
  server: WebSocketServer,
  options: WebSocketServiceOptions,
): WebSocketService {
  function send(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  function broadcast(message: ServerMessage): void {
    const payload = JSON.stringify(message);
    for (const client of server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  server.on("connection", (socket) => {
    console.log("[ws] client connected");
    send(socket, { message: "stateSnapshot", data: options.getState() });

    socket.on("message", (raw) => {
      const rawStr = raw.toString();
      console.log("[ws] received:", rawStr);

      let envelope: ClientEnvelope;
      try {
        envelope = parseClientEnvelope(rawStr, options.validMessages);
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Invalid message payload.";
        console.error("[ws] parse failed:", reason);
        send(socket, {
          message: "actionSettled",
          data: { requestId: "", ok: false, reason },
        });
        return;
      }

      console.log(
        `[ws] dispatching: ${envelope.message} (${envelope.requestId})`,
      );
      options.onMessage(envelope, socket);
    });

    socket.on("close", () => {
      console.log("[ws] client disconnected");
    });
  });

  return { send, broadcast };
}
