import type { BackendService } from "../../services/backend.service.js";

export async function cancelActivePoolComp(
  backendService: BackendService,
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  await backendService.mongoDbService.activeCompCollection.deleteOne({
    id: activeComp.id,
  });

  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne()

  if (updatedActiveComp) throw new Error("Should not have found active comp");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
