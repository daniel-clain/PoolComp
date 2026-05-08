import type { BackendService } from "../../services/backend.service.js";

export async function completeActivePoolComp(
  backendService: BackendService
): Promise<void> {
  const activeComp = backendService.getActiveComp();

  await backendService.mongoDbService.compHistoryCollection.insertOne(activeComp);
  await backendService.mongoDbService.activeCompCollection.deleteOne({
    id: activeComp.id,
  });

  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne(
    { id: activeComp.id },
    { projection: { _id: 0 } },
  );
  backendService.backendState.activePoolComp = updatedActiveComp;

  const updatedCompHistory = await backendService.mongoDbService.compHistoryCollection
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
  backendService.backendState.compHistory = updatedCompHistory
}
