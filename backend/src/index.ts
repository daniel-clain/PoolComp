import express from "express";
import http from "node:http";
import type { AllData } from "../../shared/domain.js";
import { createMongoDbService } from "./services/mongo-db.service.js";
import { createWebSocketService } from "./services/websockets.service.js";
import { poolCompConfig } from "../../shared/domain.js";
import { createBackendService } from "./services/backend.service.js";
import { MessageToBackend } from "../../shared/messageToBackend.js";
import { getMessageHandler } from "./messages-from-frontend/messages-from-frontend.js";

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

  websocketService.onMessageFromFrontend.subscribe(({ message, data }: MessageToBackend) => {
    getMessageHandler(message)(backendService, data)
  })
}

bootstrap().catch((error: unknown) => {
  console.error("Fatal:", error);
  process.exitCode = 1;
});
