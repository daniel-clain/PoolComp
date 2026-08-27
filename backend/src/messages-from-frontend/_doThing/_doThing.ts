import { insertSingleTest2026CompHistoryImport } from "../../extraThings/import 2026 comp history/import 2026 comp history.js";
import type { BackendService } from "../../services/backend.service.js";

export async function doThing(backendService: BackendService, _data: {}): Promise<void> {
  const {
    playersCollection,
    activeCompCollection,
    compHistoryCollection,
  } = backendService.mongoDbService;
  await insertSingleTest2026CompHistoryImport({
    playersCollection,
    activeCompCollection,
    compHistoryCollection,
  });
  await backendService.loadDatabaseDataIntoBackendState();
}
