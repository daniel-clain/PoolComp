import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { randomiseAllMatchups } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function randomiseMatchups(
  backendService: BackendService,
  data: { isSecondChanceComp: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const compHistory = await backendService.getCompHistory();
  const updatedSlots = randomiseAllMatchups(activeComp, data.isSecondChanceComp, compHistory);
  console.log(`updatedSlots: ${JSON.stringify(updatedSlots)}`);
  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { ...(data.isSecondChanceComp ? { secondChanceSlots: updatedSlots } : { slots: updatedSlots }) } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
