import "dotenv/config";
import express from "express";
import http from "node:http";
import path from "node:path";
import type { BackendState } from "../../shared/domain.js";
import { MessageToBackend } from "../../shared/messageToBackend.js";
import { poolCompConfig } from "../../shared/poolCompConfig.js";
import { messagesFromFrontend } from "./messages-from-frontend/messages-from-frontend.js";
import { createBackendService } from "./services/backend.service.js";
import { createMongoDbService } from "./services/mongo-db.service.js";
import { createWebSocketService } from "./services/websockets.service.js";

const serverPort = 3000;
const frontendDistributionPath = path.resolve(process.cwd(), "../frontend/dist");

async function bootstrap(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);
  const backendState: BackendState = {
    leaderboard: [],
    players: [],
    activePoolComp: null,
    compHistory: [],
    autoAssignPlayers: false,
    poolCompConfig: poolCompConfig,
  }
  const mongoDbService = await createMongoDbService();
  const websocketService = createWebSocketService(httpServer);
  const backendService = createBackendService(mongoDbService, websocketService, backendState);
  await backendService.loadDatabaseDataIntoBackendState()

  websocketService.onClientConnected.subscribe(async (socket) => {
    await backendService.loadDatabaseDataIntoBackendState();

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
        console.log("actionQueue finished");
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

  app.use(express.static(frontendDistributionPath));
  app.get("/{*frontendPath}", (_request, response) => {
    response.sendFile(path.join(frontendDistributionPath, "index.html"));
  });

  httpServer.listen(serverPort, () => {
    console.log(
      `PoolComp backend listening on http://localhost:${serverPort}`,
    );
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Fatal:", error);
  process.exitCode = 1;
});
