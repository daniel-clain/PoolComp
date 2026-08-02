import { convertToSlotData } from "../../../../shared/data-convert.service.js";
import type { BackendService } from "../../services/backend.service.js";
import { updateOptions } from "../../services/mongo-db.service.js";
import { handleManualAssignPlayerToSlot } from "../../services/tournament-slot-assignment/tournament-slot-assignment.service.js";

export async function manualAssignPlayerToSlot(
  backendService: BackendService,
  data: { slotId: number; playerId: string | undefined; isSecondChanceComp: boolean },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const player = activeComp.registeredPlayers.find(player => player.id === data.playerId);

  const slots = handleManualAssignPlayerToSlot(activeComp, data.slotId, player, backendService.backendState.autoAssignPlayers, data.isSecondChanceComp);
  const slotsData = slots.map(convertToSlotData);

  const updatedActiveCompResult = await backendService.mongoDbService.activeCompCollection.findOneAndUpdate(
    { id: activeComp.id },
    { $set: { ...(data.isSecondChanceComp ? { secondChanceSlots: slotsData } : { slots: slotsData }) } },
    updateOptions,
  );
  if (!updatedActiveCompResult) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveCompResult;
}
/* Needs to accurately clear relative slots */
