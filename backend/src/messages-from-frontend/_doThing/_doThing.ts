import { updateDataFieldNames } from "../../extraThings/update the db fields.js";
import type { BackendService } from "../../services/backend.service.js";

export async function doThing(backendService: BackendService, data: {}): Promise<void> {
  const { activeCompCollection, compHistoryCollection } = backendService.mongoDbService;
  await updateDataFieldNames({ activeCompCollection, compHistoryCollection });
}