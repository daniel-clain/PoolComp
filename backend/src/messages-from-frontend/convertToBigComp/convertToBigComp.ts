import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function convertToBigComp(
  backendService: BackendService
) {
  const comp = backendService.getActiveComp();

  const updatedCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: comp.id },
    { $set: { secondChanceSlots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize) } },
    updateOptions,
  );
  if (!updatedCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedCompResult;
}