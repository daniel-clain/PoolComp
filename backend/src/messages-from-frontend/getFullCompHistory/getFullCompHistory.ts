import type { BackendService } from "../../services/backend.service.js";

export async function getFullCompHistory(backendService: BackendService): Promise<void> {
  await backendService.loadCompleteCompHistory();
}
