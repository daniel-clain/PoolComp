import { convertToRegisteredPlayerData, convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { RegisteredPlayer, Slot } from "../../../../shared/domain.js";
import { tournamentHasHadAssignment } from "../../../../shared/tournament-slot.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { assignPlayer } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";
import { mapTournamentSlotsToNextRoundSize, tournamentNeedsSizeIncrease } from "../../services/tournament-slot-assignment/tournament-slot-assignment.units.js";

export async function addPlayerToComp(
  backendService: BackendService,
  data: { playerId: string }
) {
  const comp = backendService.getActiveComp();

  const player = backendService.backendState.players.find(player => player.id === data.playerId)!;

  const newRegisteredPlayer: RegisteredPlayer = { ...player, paid: false };
  const updatedRegisteredPlayers: RegisteredPlayer[] = [...comp.registeredPlayers, newRegisteredPlayer];

  let updatedSlots: Slot[] = comp.slots;

  if (tournamentNeedsSizeIncrease(updatedRegisteredPlayers, updatedSlots)) {
    updatedSlots = mapTournamentSlotsToNextRoundSize(updatedRegisteredPlayers, updatedSlots)
  }
  if (tournamentHasHadAssignment(updatedSlots) && backendService.backendState.autoAssignPlayers) {
    updatedSlots = assignPlayer(
      { ...comp, registeredPlayers: updatedRegisteredPlayers, slots: updatedSlots },
      newRegisteredPlayer,
      false
    );
  }

  const updatedCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: comp.id },
    {
      $set: {
        slots: updatedSlots.map(convertToSlotData),
        registeredPlayers: updatedRegisteredPlayers.map(convertToRegisteredPlayerData),
      },
    },
    updateOptions,
  );
  if (!updatedCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedCompResult;
}
