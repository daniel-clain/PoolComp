import type { BackendService } from "../../services/backend.service.js";
import { randomiseAllMatchups } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function randomiseMatchups(
  backendService: BackendService,
): Promise<void> {
  const activeComp = backendService.getActiveComp();

  const updatedSlots = randomiseAllMatchups(activeComp);
  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: activeComp.id },
    { $set: { slots: updatedSlots } },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: activeComp.id })
  if (!updatedActiveComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
