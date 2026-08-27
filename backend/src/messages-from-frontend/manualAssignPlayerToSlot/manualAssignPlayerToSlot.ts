import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import { getKnownRegisteredPlayers, poolCompHasUnknownRegisteredPlayers } from "../../../../shared/pool-comp.service.js";
import { changingSlotAffectsSecondChanceComp, mainCompChangeWouldRemoveAPlayedSecondChancePlayer, secondChanceCompMatchAlreadyPlayedMessage } from "../../../../shared/tournament-slot.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { handleManualAssignPlayerToSlot, refreshSecondChanceSlots } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function manualAssignPlayerToSlot(
  backendService: BackendService,
  data: { slotId: number; playerId: string | undefined; isSecondChanceComp: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  if (poolCompHasUnknownRegisteredPlayers(activeComp)) {
    throw "Cannot assign slots in a comp with unknown registered players";
  }
  const compHistory = backendService.getCompHistory();
  const player = getKnownRegisteredPlayers(activeComp)
    .find((registeredPlayer) => registeredPlayer.id === data.playerId);

  const secondChanceCompNeedsRefreshing = changingSlotAffectsSecondChanceComp(activeComp, data.slotId, data.isSecondChanceComp);

  const slots = handleManualAssignPlayerToSlot(activeComp, data.slotId, player, backendService.backendState.autoAssignPlayers, data.isSecondChanceComp);
  const slotsData = slots.map(convertToSlotData);

  if (secondChanceCompNeedsRefreshing && mainCompChangeWouldRemoveAPlayedSecondChancePlayer(activeComp, slots, compHistory)) {
    throw secondChanceCompMatchAlreadyPlayedMessage;
  }

  const secondChanceSlotsData = secondChanceCompNeedsRefreshing
    ? refreshSecondChanceSlots({ ...activeComp, slots }, compHistory).map(convertToSlotData)
    : undefined;

  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    {
      $set: {
        ...(data.isSecondChanceComp ? { secondChanceSlots: slotsData } : { slots: slotsData }),
        ...(secondChanceSlotsData ? { secondChanceSlots: secondChanceSlotsData } : {}),
      },
    },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
/* Needs to accurately clear relative slots */
