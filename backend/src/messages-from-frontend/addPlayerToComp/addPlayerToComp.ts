import type { BackendService } from "../../services/backend.service.js";

export function addPlayerToComp(
    backendService: BackendService,
    data: { playerId: string }
) {
    const comp = backendService.getActiveComp();
    const player = backendService.getPlayerById(data.playerId);
    backendService.mongoDbService.activeCompCollection.updateOne({ id: comp.id }, { $push: { registeredPlayers: { ...player, paid: false } } });
}