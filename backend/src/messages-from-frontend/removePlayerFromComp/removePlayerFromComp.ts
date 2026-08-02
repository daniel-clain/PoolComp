import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { removePlayerFromSlots } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";


export async function removePlayerFromComp(
  backendService: BackendService,
  data: { playerId: string }
) {
  const comp = backendService.getActiveComp();
  const player = comp.registeredPlayers.find(player => player.id === data.playerId)!;
  const updatedSlots = removePlayerFromSlots(comp, player);
  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: comp.id },
    {
      $pull: { registeredPlayers: { playerId: data.playerId } },
      $set: { slots: updatedSlots.map(convertToSlotData) },
    },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult
}
