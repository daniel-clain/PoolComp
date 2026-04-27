import { randomUUID } from "node:crypto";
import type { BackendService } from "../../services/backend.service.js";

export async function createPoolComp(
  backendService: BackendService
): Promise<void> {
  await backendService.mongoDbService.activeCompCollection.insertOne({
    id: randomUUID(),
    date: new Date(),
    slots: [],
    registeredPlayers: [],
  });
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne()
  backendService.backendState.activePoolComp = updatedActiveComp;
}
