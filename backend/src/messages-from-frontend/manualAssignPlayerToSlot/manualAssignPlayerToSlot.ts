import type { BackendService } from "../../services/backend.service.js";
import { handleManualAssignPlayerToSlot } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function manualAssignPlayerToSlot(
  backendService: BackendService,
  data: { slotId: number; playerId: string },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const slots = handleManualAssignPlayerToSlot(activeComp, data.slotId, data.playerId);

  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: activeComp.id },
    { $set: { slots } },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: activeComp.id })
  if (!updatedActiveComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
/* Needs to accurately clear relative slots */
