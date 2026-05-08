import { randomUUID } from "node:crypto";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function createPoolComp(
  backendService: BackendService
): Promise<void> {
  const activeCompId = randomUUID();
  await backendService.mongoDbService.activeCompCollection.insertOne({
    id: activeCompId,
    date: new Date(),
    slots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize),
    registeredPlayers: [],
  });
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne(
    { id: activeCompId },
    { projection: { _id: 0 } },
  );
  if (!updatedActiveComp) throw new Error("Active comp not found after create");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
