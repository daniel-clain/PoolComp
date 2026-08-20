
import _ from "lodash";
import { WebSocket } from "ws";
import { convertToPoolComp } from "../../../shared/data-convert.service.js";
import type { BackendState, Player, PoolComp } from "../../../shared/domain.js";
import type { MessageToFrontend } from "../../../shared/messageToFrontend.js";
import type { MongoDbService } from "./mongo-db.service.js";
import type { WebSocketService } from "./websockets.service.js";


const maximumStoredBackendErrors = 50;

export function createBackendService(mongoDbService: MongoDbService, websocketService: WebSocketService, backendState: BackendState) {


  return {
    mongoDbService,
    backendState,
    getActiveComp,
    getCompHistory,
    getPlayerById,
    loadDatabaseDataIntoBackendState,
    addBackendError,
    sentToClient,
    sendToAllClients
  }

  function getActiveComp(): PoolComp {
    if (!backendState.activePoolComp) throw new Error("No active comp found");
    return convertToPoolComp(backendState.activePoolComp, backendState);
  }
  function getCompHistory(): PoolComp[] {
    return backendState.compHistory.map(comp => convertToPoolComp(comp, backendState));
  }
  function getPlayerById(playerId: string): Player {
    const player = backendState.players.find(player => player.id === playerId);
    if (!player) throw new Error("Player not found");
    return player;
  }

  async function loadDatabaseDataIntoBackendState() {
    const [players, activePoolComp, compHistory] = await mongoDbService.getAllData();
    console.log("activePoolComp", activePoolComp);

    backendState.activePoolComp = activePoolComp;
    backendState.compHistory = compHistory;
    backendState.players = _.orderBy(players, ['name'], ['asc']);
  }

  function addBackendError(text: string) {
    backendState.backendErrors = [
      { text, timestamp: new Date().toISOString() },
      ...backendState.backendErrors,
    ].slice(0, maximumStoredBackendErrors);
  }

  function sentToClient(socket: WebSocket, message: MessageToFrontend) {
    socket.send(JSON.stringify(message));
  }
  function sendToAllClients(message: MessageToFrontend) {
    for (const socket of websocketService.webSocketServer.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
  }
}

export type BackendService = ReturnType<typeof createBackendService>;