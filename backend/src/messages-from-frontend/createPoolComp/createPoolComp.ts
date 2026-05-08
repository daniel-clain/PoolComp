import { randomUUID } from "node:crypto";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function createPoolComp(
  backendService: BackendService
): Promise<void> {
  await backendService.mongoDbService.activeCompCollection.insertOne({
    id: randomUUID(),
    date: new Date(),
    slots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize),
    registeredPlayers: [],
  });
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne()
  backendService.backendState.activePoolComp = updatedActiveComp;
}
