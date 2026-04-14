import express from "express";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { WebSocketServer } from "ws";
import type { AllData } from "../../shared/domain.js";
import type { MessageName } from "../../shared/messageToBackend.js";
import { serverConfig } from "./config.js";
import { connectMongo, createRepository } from "./mongo/repository.js";
import { createPoolCompService } from "./services/poolComp.service.js";
import { createWebSocketService } from "./ws/websockets.service.js";

async function bootstrap(): Promise<void> {
  const { database } = await connectMongo(
    serverConfig.mongoUri,
    serverConfig.mongoDbName,
  );
  const repository = createRepository(database);
  const actions = createPoolCompService();
  const validMessages = new Set(Object.keys(actions));

  let state: AllData = await repository.load();
  let mutationQueue = Promise.resolve();

  const app = express();
  const httpServer = http.createServer(app);
  const webSocketServer = new WebSocketServer({ server: httpServer, path: "/ws" });

  const webSocketService = createWebSocketService(webSocketServer, {
    validMessages,
    getState: () => state,
    onMessage(envelope) {
      mutationQueue = mutationQueue
        .then(async () => {
          const messageName = envelope.message as MessageName;
          console.log(`[action] processing: ${messageName}`);

          webSocketService.broadcast({
            message: "asyncPending",
            data: { requestId: envelope.requestId, action: messageName },
          });

          try {
            const nextState = actions[messageName](
              state,
              (envelope as any).data,
            );
            await repository.save(nextState);
            state = await repository.load();
            console.log(`[action] success: ${messageName}`);

            webSocketService.broadcast({
              message: "actionSettled",
              data: { requestId: envelope.requestId, ok: true, state },
            });
          } catch (error) {
            const reason =
              error instanceof Error ? error.message : "Unknown error";
            console.error(`[action] failed: ${messageName} — ${reason}`);
            webSocketService.broadcast({
              message: "actionSettled",
              data: { requestId: envelope.requestId, ok: false, reason },
            });
          }
        })
        .catch((error: unknown) => {
          console.error("Unhandled mutation queue error:", error);
        });
    },
  });

  if (existsSync(serverConfig.frontendDistPath)) {
    app.use(express.static(serverConfig.frontendDistPath));
    app.get(/.*/, (_request, response) => {
      response.sendFile(path.join(serverConfig.frontendDistPath, "index.html"));
    });
  }

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
