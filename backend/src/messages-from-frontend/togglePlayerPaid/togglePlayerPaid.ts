import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";

export async function togglePlayerPaid(
  backendService: BackendService,
  data: { playerId: string, paid: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();


  const result = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    {
      id: activeComp.id,
      "registeredPlayers.playerId": data.playerId,
    }, { $set: { "registeredPlayers.$.paid": data.paid } }, updateOptions)


  if (!result) throw new Error("failed to update player paid status");


  backendService.backendState.activePoolComp = result;
}
