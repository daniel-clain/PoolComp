import { toCompDateOnly } from "../../../../shared/comp-date.js";
import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { createUniqueFourDigitId, getAllUsedIds } from "../../services/short-id.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function createPoolComp(
  backendService: BackendService
): Promise<void> {
  const usedIds = await getAllUsedIds(backendService.mongoDbService);
  const activeCompId = createUniqueFourDigitId(usedIds);
  await backendService.mongoDbService.activeCompCollection.insertOne({
    id: activeCompId,
    date: toCompDateOnly(),
    slots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize).map(convertToSlotData),
    registeredPlayers: [],
  });
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne(
    { id: activeCompId },
    { projection: { _id: 0 } },
  );
  if (!updatedActiveComp) throw new Error("Active comp not found after create");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
