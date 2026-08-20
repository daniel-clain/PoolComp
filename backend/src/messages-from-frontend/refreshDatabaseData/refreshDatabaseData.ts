import type { BackendService } from "../../services/backend.service.js";

export async function refreshDatabaseData(
  backendService: BackendService,
): Promise<void> {
  await backendService.loadDatabaseDataIntoBackendState();
}
