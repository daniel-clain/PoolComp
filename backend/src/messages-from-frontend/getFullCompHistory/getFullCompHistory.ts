import type { BackendService } from "../../services/backend.service.js";

export async function getFullCompHistory(backendService: BackendService): Promise<void> {
  backendService.backendState.compHistory = await backendService.mongoDbService.getAllHistoryData();
}
