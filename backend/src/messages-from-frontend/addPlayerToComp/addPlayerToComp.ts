import type { BackendService } from "../../services/backend.service.js";

export async function addPlayerToComp(
    backendService: BackendService,
    data: { playerId: string }
) {
    const comp = backendService.getActiveComp();
    const player = backendService.getPlayerById(data.playerId);
    await backendService.mongoDbService.activeCompCollection.updateOne({ id: comp.id }, { $push: { registeredPlayers: { ...player, paid: false } } });
    const updatedActiveComp = await backendService.mongoDbService.activeCompCollection.findOne({ id: comp.id })
    if (!updatedActiveComp) throw new Error("Active comp not found");
    backendService.backendState.activePoolComp = updatedActiveComp;
}