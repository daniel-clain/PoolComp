import { WebSocket, WebSocketServer } from "ws";

import { Subject } from "rxjs";
import http from "node:http";


export function createWebSocketService(httpServer: http.Server) {
  const webSocketServer = new WebSocketServer({ server: httpServer, path: "/ws" });
  const onMessageFromClient: Subject<string> = new Subject<string>();
  const onClientConnected: Subject<WebSocket> = new Subject<WebSocket>();


  webSocketServer.on("connection", (socket) => {
    console.log("[ws] client connected");
    onClientConnected.next(socket);

    socket.on("message", (jsonString: string) => {

      onMessageFromClient.next(jsonString);
    })

    socket.on("close", () => {
      console.log("[ws] client disconnected");
    });
  })

  webSocketServer.on('listening', () => {
    console.log("[ws] server is listening");
  });


  return {
    onMessageFromClient,
    onClientConnected,
    webSocketServer
  }
}

export type WebSocketService = ReturnType<typeof createWebSocketService>;