import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { autoAssignUnassignedPlayers } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function assignPlayers(
  backendService: BackendService,
  data: { isSecondChanceComp: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const compHistory = backendService.getCompHistory();
  const updatedSlots = autoAssignUnassignedPlayers(activeComp, data.isSecondChanceComp, compHistory);
  const updatedSlotsData = updatedSlots.map(convertToSlotData);

  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { ...(data.isSecondChanceComp ? { secondChanceSlots: updatedSlotsData } : { slots: updatedSlotsData }) } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
