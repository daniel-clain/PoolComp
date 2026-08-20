import type { UpdateFilter } from "mongodb";
import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { PoolComp_D } from "../../../../shared/domain.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function convertToBigComp(
  backendService: BackendService,
  data: { cancel?: true }
) {
  const comp = backendService.getActiveComp();

  if (!data.cancel && comp.secondChanceSlots) {
    throw new Error("Comp has already been converted to a big comp");
  }
  if (data.cancel && !comp.secondChanceSlots) {
    return;
  }

  const update: UpdateFilter<PoolComp_D> = data?.cancel
    ? { $unset: { secondChanceSlots: true } }
    : {
      $set: {
        secondChanceSlots: getTournamentSlotsFromFirstRoundSize(poolCompConfig.minCompSize)
          .map(convertToSlotData),
      },
    };

  const updatedCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: comp.id },
    update,
    updateOptions,
  );
  if (!updatedCompResult) throw new Error("Active comp not found");
  console.log("updatedCompResult:", updatedCompResult)
  backendService.backendState.activePoolComp = updatedCompResult;
}
