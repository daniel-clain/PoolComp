import type { BackendService } from "../../services/backend.service.js";

export async function activatePlayer(
  backendService: BackendService,
  data: { playerId: string },
): Promise<void> {
  await backendService.mongoDbService.playersCollection.updateOne(
    { id: data.playerId },
    { $set: { deactivated: false } },
  );
  const updatedPlayer = await backendService.mongoDbService.playersCollection.findOne({ id: data.playerId })
  if (!updatedPlayer) throw new Error("Player not found");
  backendService.backendState.players = backendService.backendState.players.map(player => player.id === data.playerId ? updatedPlayer : player);
}
