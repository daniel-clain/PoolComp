
import _ from "lodash";
import { WebSocket } from "ws";
import type { BackendState, Player, PoolComp } from "../../../shared/domain.js";
import type { MessageToFrontend } from "../../../shared/messageToFrontend.js";
import type { MongoDbService } from "./mongo-db.service.js";
import type { WebSocketService } from "./websockets.service.js";


export function createBackendService(mongoDbService: MongoDbService, websocketService: WebSocketService, backendState: BackendState) {


  return {
    mongoDbService,
    backendState,
    getActiveComp,
    getPlayerById,
    loadDatabaseDataIntoBackendState,
    sentToClient,
    sendToAllClients
  }

  function getActiveComp(): PoolComp {
    if (!backendState.activePoolComp) throw new Error("No active comp found");
    return backendState.activePoolComp;
  }
  function getPlayerById(playerId: string): Player {
    const player = backendState.players.find(player => player.id === playerId);
    if (!player) throw new Error("Player not found");
    return player;
  }

  async function loadDatabaseDataIntoBackendState() {
    const [players, activePoolComp, compHistory] = await mongoDbService.getAllData();
    backendState.activePoolComp = activePoolComp;
    backendState.compHistory = compHistory;
    backendState.players = _.orderBy(players, ['name'], ['asc']);
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