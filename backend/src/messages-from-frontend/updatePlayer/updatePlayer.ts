import type { BackendService } from "../../services/backend.service.js";

export async function updatePlayer(
  backendService: BackendService,
  data: { playerId: string; name: string },
): Promise<void> {
  await backendService.mongoDbService.playersCollection.updateOne(
    { id: data.playerId },
    { $set: { name: data.name.trim() } },
  );
  const updatedPlayer = await backendService.mongoDbService.playersCollection.findOne({ id: data.playerId })
  if (!updatedPlayer) throw new Error("Player not found");
  backendService.backendState.players = backendService.backendState.players.map(player => player.id === data.playerId ? updatedPlayer : player);
}
