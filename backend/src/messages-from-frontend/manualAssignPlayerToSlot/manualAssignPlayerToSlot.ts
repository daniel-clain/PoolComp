import type { BackendService } from "../../services/backend.service.js";

export async function manualAssignPlayerToSlot(
  backendService: BackendService,
  data: { slotId: string; playerId: string },
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const slots = activeComp.slots.map((slot) =>
    slot.id === data.slotId ? { ...slot, playerId: data.playerId } : slot,
  );

  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: activeComp.id },
    { $set: { slots } },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: activeComp.id })
  if (!updatedActiveComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
