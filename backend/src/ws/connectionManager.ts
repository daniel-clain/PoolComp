import { WebSocket, type WebSocketServer } from "ws";
import type { ServerMessage } from "./protocol.js";

export type ConnectionManager = {
  send(socket: WebSocket, message: ServerMessage): void;
  broadcast(message: ServerMessage): void;
};

export function createConnectionManager(server: WebSocketServer): ConnectionManager {
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

  return { send, broadcast };
}
