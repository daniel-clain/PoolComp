
import type { ActivePoolComp, AllData, Player } from "../../../shared/domain.js";
import type { MongoDbService } from "./mongo-db.service.js";
import type { WebSocketService } from "./websockets.service.js";
import type { RegisteredPlayer } from "../../../shared/domain.js";


export function createBackendService(mongoDbService: MongoDbService, websocketService: WebSocketService, backendState: AllData) {

  broadcastBackendStateToAllFrontends()

  return {
    mongoDbService,
    backendState,
    getActiveComp,
    getPlayerById,
    getRegisteredPlayerById,
    broadcastBackendStateToAllFrontends
  }

  function getActiveComp(): ActivePoolComp {
    if (!backendState.activePoolComp) throw new Error("No active comp found");
    return backendState.activePoolComp;
  }
  function getPlayerById(playerId: string): Player {
    const player = backendState.players.find(player => player.id === playerId);
    if (!player) throw new Error("Player not found");
    return player;
  }
  function getRegisteredPlayerById(playerId: string): RegisteredPlayer {
    const player = getActiveComp().registeredPlayers.find(player => player.id === playerId);
    if (!player) throw new Error("Registered Player not found");
    return player;
  }

  function broadcastBackendStateToAllFrontends() {
    websocketService.broadcast(backendState);
  }
}

export type BackendService = ReturnType<typeof createBackendService>;