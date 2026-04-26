import type { BackendService } from "../../services/backend.service.js";

export async function unsetRegisteredPlayerPaid(
  backendService: BackendService,
  data: { playerId: string },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: activeComp.id, "registeredPlayers.id": data.playerId },
    { $set: { "registeredPlayers.$.paid": false } },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: activeComp.id })
  if (!updatedActiveComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
