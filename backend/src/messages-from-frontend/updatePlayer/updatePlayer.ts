import type { Player } from "../../../../shared/domain.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";

export async function updatePlayer(
  backendService: BackendService,
  data: { player: Player },
): Promise<void> {
  const updatedPlayerResult = await backendService.mongoDbService.playersCollection.findOneAndUpdate(
    { id: data.player.id },
    { $set: data.player },
    updateOptions,
  );
  if (!updatedPlayerResult) throw new Error("Player not found");
  backendService.backendState.players = backendService.backendState.players.map(player => player.id === updatedPlayerResult.id ? updatedPlayerResult : player);
}
