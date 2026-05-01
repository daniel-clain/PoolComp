import express from "express";
import http from "node:http";
import type { AllData } from "../../shared/domain.js";
import { createMongoDbService } from "./services/mongo-db.service.js";
import { createWebSocketService } from "./services/websockets.service.js";
import { poolCompConfig } from "../../shared/poolCompConfig.js";
import { createBackendService } from "./services/backend.service.js";
import { serverConfig } from "./config.js";
import { MessageToBackend } from "../../shared/messageToBackend.js";
import { messagesFromFrontend } from "./messages-from-frontend/messages-from-frontend.js";

async function bootstrap(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);
  const backendState: AllData = {
    players: [],
    activePoolComp: null,
    compHistory: [],
    poolCompConfig: poolCompConfig,
  }
  const mongoDbService = await createMongoDbService();
  const websocketService = createWebSocketService(httpServer);
  const backendService = createBackendService(mongoDbService, websocketService, backendState);
  await backendService.loadDatabaseDataIntoBackendState()

  websocketService.onClientConnected.subscribe((socket) => {
    backendService.sentToClient(socket, { message: 'allData', data: backendState })
  })

  let actionQueue: Promise<void> | null = null;

  websocketService.onMessageFromClient.subscribe((jsonString) => {
    const [message, data]: MessageToBackend = JSON.parse(jsonString);

    console.log("message from frontend:", message, data ?? '');

    if (!actionQueue) {
      console.log("actionInProgress: true");
      backendService.sendToAllClients({
        message: 'actionInProgress',
        data: true
      })
    }



    actionQueue = (actionQueue || Promise.resolve()).then(() => {
      return messagesFromFrontend[message](backendService, data as any)
    })
      .catch((error: unknown) => {
        console.error("Fatal:", error);
        process.exitCode = 1;
      })
      .finally(() => {
        backendService.sendToAllClients({
          message: 'allData',
          data: backendState
        })
        backendService.sendToAllClients({
          message: 'actionInProgress',
          data: false
        })
      })

    actionQueue = null;
  })
  httpServer.listen(serverConfig.port, () => {
    console.log(
      `PoolComp backend listening on http://localhost:${serverConfig.port}`,
    );
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Fatal:", error);
  process.exitCode = 1;
});
