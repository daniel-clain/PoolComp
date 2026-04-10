import { existsSync } from "node:fs";
import path from "node:path";
import http from "node:http";
import express from "express";
import { WebSocketServer } from "ws";
import { isGoogleSheetsConfigured, readConfig, validateConfig, type ServerConfig } from "./config.js";
import { createAppStateStore, isDomainError } from "./domain/store.js";
import { createGoogleSheetsClient } from "./sheets/googleSheetsClient.js";
import { createInMemoryStateRepository, createStateRepository, type StateRepository } from "./sheets/stateRepository.js";
import { createConnectionManager } from "./ws/connectionManager.js";
import { parseClientMessage } from "./ws/protocol.js";

async function bootstrap(): Promise<void> {
  const config = readConfig();
  validateConfig(config);
  const repository = await createPersistenceRepository(config);
  const initialState = await repository.loadState();
  const store = createAppStateStore(initialState);

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = new WebSocketServer({ server: httpServer, path: "/ws" });
  const connections = createConnectionManager(wsServer);

  let mutationQueue = Promise.resolve();

  wsServer.on("connection", (socket) => {
    connections.send(socket, {
      type: "stateSnapshot",
      state: store.getState(),
    });

    socket.on("message", (data) => {
      mutationQueue = mutationQueue
        .then(async () => {
          let message;
          try {
            message = parseClientMessage(data.toString());
          } catch {
            connections.send(socket, {
              type: "commandRejected",
              reason: "Invalid command payload.",
            });
            return;
          }

          const previousState = store.getState();

          try {
            const nextState = store.apply(message.command);
            await repository.saveState(nextState);
            connections.broadcast({
              type: "stateUpdated",
              state: nextState,
              requestId: message.requestId,
            });
          } catch (error) {
            store.replaceState(previousState);

            if (isDomainError(error)) {
              connections.send(socket, {
                type: "commandRejected",
                requestId: message.requestId,
                reason: error.message,
              });
              return;
            }

            console.error(error);
            connections.send(socket, {
              type: "serverError",
              message: "The server could not persist the latest change.",
            });
          }
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    });
  });

  if (existsSync(config.frontendDistPath)) {
    app.use(express.static(config.frontendDistPath));
    app.get(/.*/, (_request, response) => {
      response.sendFile(path.join(config.frontendDistPath, "index.html"));
    });
  } else {
    app.get("/", (_request, response) => {
      response.status(503).send("Frontend build not found. Build the app before serving it.");
    });
  }

  httpServer.listen(config.port, () => {
    console.log(`PoolComp backend listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

async function createPersistenceRepository(config: ServerConfig): Promise<StateRepository> {
  if (!isGoogleSheetsConfigured(config)) {
    console.warn("Google Sheets persistence is disabled. Using in-memory persistence mode.");
    return createInMemoryStateRepository();
  }

  try {
    const sheetsClient = await createGoogleSheetsClient(config);
    console.log(`Google Sheets persistence enabled for spreadsheet ${config.spreadsheetId}.`);
    return createStateRepository(sheetsClient, config.spreadsheetId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Google Sheets initialization failed (${message}). Check spreadsheet sharing and credentials, then retry. Falling back to in-memory persistence mode.`,
    );
    return createInMemoryStateRepository();
  }
}