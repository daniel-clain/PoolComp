import { stripCompDateTimes } from "../../extraThings/strip comp date times.js";
import type { BackendService } from "../../services/backend.service.js";

export async function doThing(backendService: BackendService, data: {}): Promise<void> {
  const { activeCompCollection, compHistoryCollection } = backendService.mongoDbService;
  await stripCompDateTimes({ activeCompCollection, compHistoryCollection });
  await backendService.loadDatabaseDataIntoBackendState();
}
