import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { randomiseAllMatchups } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function randomiseMatchups(
  backendService: BackendService,
): Promise<void> {
  const activeComp = backendService.getActiveComp();

  const updatedSlots = randomiseAllMatchups(activeComp);
  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { slots: updatedSlots } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
