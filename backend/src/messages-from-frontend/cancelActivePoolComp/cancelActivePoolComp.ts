import type { BackendService } from "../../services/backend.service.js";

export async function cancelActivePoolComp(
  backendService: BackendService,
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const deleteResult = await backendService.mongoDbService.activeCompCollection.deleteOne({ id: activeComp.id });
  if (deleteResult.deletedCount !== 1) {
    throw new Error("Failed to cancel active comp");
  }
  backendService.backendState.activePoolComp = null;
}
