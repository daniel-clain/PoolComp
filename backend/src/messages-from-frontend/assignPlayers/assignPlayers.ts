import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { autoAssignUnassignedPlayers } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function assignPlayers(
  backendService: BackendService,
  data: { isSecondChanceComp: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const compHistory = backendService.backendState.compHistory;
  const updatedSlots = autoAssignUnassignedPlayers(activeComp, data.isSecondChanceComp, compHistory);

  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { ...(data.isSecondChanceComp ? { secondChanceSlots: updatedSlots } : { slots: updatedSlots }) } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
