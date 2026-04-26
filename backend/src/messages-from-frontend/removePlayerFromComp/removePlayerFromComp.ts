import type { BackendService } from "../../services/backend.service.js";

export async function removePlayerFromComp(
    backendService: BackendService,
    data: { playerId: string }
) {
    const comp = backendService.getActiveComp();
    const player = backendService.getRegisteredPlayerById(data.playerId);
    backendService.mongoDbService.activeCompCollection.updateOne({ id: comp.id }, { $pull: { registeredPlayers: player } });
    const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: comp.id })
    if (!updatedActiveComp) throw new Error("Active comp not found");
    backendService.backendState.activePoolComp = updatedActiveComp;
}