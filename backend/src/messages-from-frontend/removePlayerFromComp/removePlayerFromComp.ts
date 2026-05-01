import type { BackendService } from "../../services/backend.service.js";
import { removePlayerFromSlots } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";


export async function removePlayerFromComp(
  backendService: BackendService,
  data: { playerId: string }
) {
  const comp = backendService.getActiveComp();
  backendService.getRegisteredPlayerById(data.playerId);
  const updatedSlots = removePlayerFromSlots(comp, data.playerId);
  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: comp.id },
    {
      $pull: { registeredPlayers: { id: data.playerId } },
      $set: { slots: updatedSlots },
    },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: comp.id });
  if (!updatedActiveComp) throw new Error("Active comp not found");

  backendService.backendState.activePoolComp = updatedActiveComp
}