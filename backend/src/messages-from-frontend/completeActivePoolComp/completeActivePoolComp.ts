import type { BackendService } from "../../services/backend.service.js";

export async function completeActivePoolComp(
  backendService: BackendService
): Promise<void> {
  const activeComp = backendService.backendState.activePoolComp;

  if (!activeComp) throw "No active comp";

  await backendService.mongoDbService.compHistoryCollection.insertOne(activeComp);

  const updatedCompHistory = await backendService.mongoDbService.compHistoryCollection
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
  backendService.backendState.compHistory = updatedCompHistory


  const deletedResult = await backendService.mongoDbService.activeCompCollection.deleteOne({
    id: activeComp.id,
  });

  if (deletedResult.deletedCount !== 1) throw "Failed to delete active comp";

  backendService.backendState.activePoolComp = null;
}
