import { convertToRegisteredPlayerData, convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { RegisteredPlayer, Slot } from "../../../../shared/domain.js";
import { getKnownRegisteredPlayers, poolCompHasUnknownRegisteredPlayers } from "../../../../shared/pool-comp.service.js";
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
  if (poolCompHasUnknownRegisteredPlayers(comp)) {
    throw "Cannot add a player to a comp with unknown registered players";
  }
  const knownRegisteredPlayers = getKnownRegisteredPlayers(comp);
  const playerAlreadyAdded = knownRegisteredPlayers.some(
    (registeredPlayer) => registeredPlayer.id === data.playerId,
  );

  if (playerAlreadyAdded) {
    throw 'tried to add a player that is already added';
  }

  const player = backendService.backendState.players.find(player => player.id === data.playerId)!;

  const newRegisteredPlayer: RegisteredPlayer = { ...player, paid: false };
  const updatedRegisteredPlayers: RegisteredPlayer[] = [
    ...knownRegisteredPlayers,
    newRegisteredPlayer,
  ];

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
