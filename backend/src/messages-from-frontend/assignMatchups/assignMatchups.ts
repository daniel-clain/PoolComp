import type { BackendService } from "../../services/backend.service.js";
import { assignMatchups as generateMatchups } from "../../services/matchup-generation.service.js";

export async function assignMatchups(
  backendService: BackendService
): Promise<void> {
  const activeComp = backendService.getActiveComp();
  const registeredPlayerIds = activeComp.registeredPlayers.map(
    (registeredPlayer) => registeredPlayer.id,
  );
  const slots = generateMatchups(registeredPlayerIds, activeComp.slots);

  await backendService.mongoDbService.activeCompCollection.updateOne(
    { id: activeComp.id },
    { $set: { slots } },
  );
  const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: activeComp.id })
  if (!updatedActiveComp) throw new Error("Active comp not found");
  backendService.backendState.activePoolComp = updatedActiveComp;
}
