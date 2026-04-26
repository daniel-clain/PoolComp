import { WebSocket,  WebSocketServer } from "ws";
import { MessageToBackend } from "../../../shared/messageToBackend.js";
import { Subject } from "rxjs";
import http from "node:http";
import type { AllData } from "../../../shared/domain.js";

export function createWebSocketService(httpServer: http.Server){
  const webSocketServer = new WebSocketServer({ server: httpServer, path: "/ws" });
  const onMessageFromFrontend:Subject<MessageToBackend> = new Subject<MessageToBackend>();
  const onFrontendConnected:Subject<WebSocket> = new Subject<WebSocket>();


  webSocketServer.on("connection", (socket) => {
    console.log("[ws] client connected");
    onFrontendConnected.next(socket);

    socket.on("message", (jsonString:string) => {
      const message:MessageToBackend = JSON.parse(jsonString);
      onMessageFromFrontend.next(message);
    })
    
    socket.on("close", () => {
      console.log("[ws] client disconnected");
    });
  })

  
  function broadcast(backendState: AllData): void {
    const payload = JSON.stringify(backendState);
    for (const socket of webSocketServer.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  } 

  webSocketServer.on('listening', () => {
    console.log("[ws] server is listening");
  });

  
  return {
    onMessageFromFrontend,
    onFrontendConnected,broadcast
  }
}

export type WebSocketService = ReturnType<typeof createWebSocketService>;