import type { BackendService } from "../../services/backend.service.js";
import { autoAssignUnassignedPlayers } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function addPlayerToComp(
  backendService: BackendService,
  data: { playerId: string }
) {
  const comp = backendService.getActiveComp();
  const player = backendService.getPlayerById(data.playerId);

  comp.registeredPlayers.push({ ...player, paid: false });


  const updatedSlots = autoAssignUnassignedPlayers(
    comp
  );
  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: comp.id },
    { $set: { slots: updatedSlots, registeredPlayers: comp.registeredPlayers } },
  );
  const compWithUpdatedSlots = await backendService.mongoDbService.activeCompCollection.findOne({ id: comp.id });
  if (!compWithUpdatedSlots) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = compWithUpdatedSlots;
}