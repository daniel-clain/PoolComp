import { WebSocket, WebSocketServer } from "ws";

import { Subject } from "rxjs";
import http from "node:http";
import { MessageFromFrontendName, MessagesFromFrontend } from "../messages-from-frontend/messages-from-frontend.js";


export type MessageFromFrontend<T extends MessageFromFrontendName = any> = {
  message: MessageFromFrontendName
  data: MessagesFromFrontend[T]
}


export function createWebSocketService(httpServer: http.Server) {
  const webSocketServer = new WebSocketServer({ server: httpServer, path: "/ws" });
  const onMessageFromClient: Subject<MessageFromFrontend> = new Subject<MessageFromFrontend>();
  const onClientConnected: Subject<WebSocket> = new Subject<WebSocket>();


  webSocketServer.on("connection", (socket) => {
    console.log("[ws] client connected");
    onClientConnected.next(socket);

    socket.on("message", (jsonString: string) => {
      const message: MessageFromFrontend = JSON.parse(jsonString);
      onMessageFromClient.next(message);
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