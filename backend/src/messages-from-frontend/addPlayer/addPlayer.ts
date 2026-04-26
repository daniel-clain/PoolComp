import { randomUUID } from "node:crypto";
import type { BackendService } from "../../services/backend.service.js";

export async function addPlayer(
  backendService: BackendService,
  data: { name: string },
): Promise<void> {
  await backendService.mongoDbService.playersCollection.insertOne({
    id: randomUUID(),
    name: data.name.trim(),
    deactivated: false,
  });
  const updatedPlayer = await backendService.mongoDbService.playersCollection.findOne({ id: randomUUID() })
  if (!updatedPlayer) throw new Error("Player not found");
  backendService.backendState.players.push(updatedPlayer);
}
