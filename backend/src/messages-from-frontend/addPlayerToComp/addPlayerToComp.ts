import { Slot } from "../../../../shared/domain.js";
import { tournamentHasHadAssignment } from "../../../../shared/tournament-slot.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { autoAssignUnassignedPlayers } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";
import { mapTournamentSlotsToNextRoundSize, tournamentNeedsSizeIncrease } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function addPlayerToComp(
  backendService: BackendService,
  data: { playerId: string }
) {
  const comp = backendService.getActiveComp();
  const player = backendService.getPlayerById(data.playerId);

  const updatedRegisteredPlayers = [...comp.registeredPlayers, { ...player, paid: false }];

  let updatedSlots: Slot[] = comp.slots;

  if (tournamentNeedsSizeIncrease(updatedRegisteredPlayers, updatedSlots)) {
    updatedSlots = mapTournamentSlotsToNextRoundSize(updatedRegisteredPlayers, updatedSlots)
  }
  if (tournamentHasHadAssignment(updatedSlots)) {
    updatedSlots = autoAssignUnassignedPlayers(
      { ...comp, registeredPlayers: updatedRegisteredPlayers, slots: updatedSlots }
    );
  }
  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: comp.id },
    { $set: { slots: updatedSlots, registeredPlayers: updatedRegisteredPlayers } },
  );
  const updatedComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: comp.id });
  if (!updatedComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedComp;
}