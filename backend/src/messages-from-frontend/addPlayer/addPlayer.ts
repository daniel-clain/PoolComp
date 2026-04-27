import { randomUUID } from "node:crypto";
import type { BackendService } from "../../services/backend.service.js";
import type { Player } from "../../../../shared/domain.js";

export async function addPlayer(
  backendService: BackendService,
  data: { name: string },
): Promise<void> {
  const newPlayer: Player = {
    id: randomUUID(),
    name: data.name.trim(),
    deactivated: false,
  };
  await backendService.mongoDbService.playersCollection.insertOne(newPlayer);
  const updatedPlayer = await backendService.mongoDbService.playersCollection.findOne({ id: newPlayer.id })
  if (!updatedPlayer) throw new Error("Player not found");
  backendService.backendState.players.push(updatedPlayer);
}
