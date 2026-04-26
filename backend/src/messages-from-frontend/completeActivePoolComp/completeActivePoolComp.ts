import type { BackendService } from "../../services/backend.service.js";

export async function completeActivePoolComp(
  backendService: BackendService
): Promise<void> {
  const activeComp = backendService.getActiveComp();

  await backendService.mongoDbService.compHistoryCollection.insertOne({
    id: activeComp.id,
    date: activeComp.date,
    slots: activeComp.slots,
  });
  await backendService.mongoDbService.activeCompCollection.deleteOne({
    id: activeComp.id,
  });

  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne()
  backendService.backendState.activePoolComp = updatedActiveComp;

  const updatedCompHistory = await backendService.mongoDbService.compHistoryCollection.find().sort({ date: -1 }).toArray()
  backendService.backendState.compHistory = updatedCompHistory
}
