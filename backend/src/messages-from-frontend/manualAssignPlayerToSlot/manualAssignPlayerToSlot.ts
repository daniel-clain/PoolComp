import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { handleManualAssignPlayerToSlot } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function manualAssignPlayerToSlot(
  backendService: BackendService,
  data: { slotId: number; playerId: string | undefined },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const slots = handleManualAssignPlayerToSlot(activeComp, data.slotId, data.playerId, backendService.backendState.autoAssignPlayers);

  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { slots } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
/* Needs to accurately clear relative slots */
