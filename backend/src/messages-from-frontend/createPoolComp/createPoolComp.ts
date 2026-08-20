import { toCompDateOnly } from "../../../../shared/comp-date.js";
import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import { PoolComp_D } from "../../../../shared/domain.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { createUniqueFourDigitId, getAllUsedIds } from "../../services/short-id.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function createPoolComp(
  backendService: BackendService
): Promise<void> {

  const { activePoolComp } = backendService.backendState;
  if (activePoolComp) {
    throw 'tried to create a new comp while there is an active comp'
  }
  const usedIds = await getAllUsedIds(backendService.mongoDbService);
  const activeCompId = createUniqueFourDigitId(usedIds);
  const newComp: PoolComp_D = {
    id: activeCompId,
    date: toCompDateOnly(),
    slots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize).map(convertToSlotData),
    registeredPlayers: [],
  };
  const createCompResult = await backendService.mongoDbService.activeCompCollection.insertOne(newComp);
  if (!createCompResult.acknowledged) throw "Failed to create comp";
  backendService.backendState.activePoolComp = newComp;
}
