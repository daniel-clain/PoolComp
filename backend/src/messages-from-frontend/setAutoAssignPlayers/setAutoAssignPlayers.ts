import type { BackendService } from "../../services/backend.service.js";
import { assignPlayers } from "../assignPlayers/assignPlayers.js";

export async function setAutoAssignPlayers(
  backendService: BackendService,
  data: { autoAssignPlayers: boolean; isSecondChanceComp: boolean },
): Promise<void> {
  backendService.backendState.autoAssignPlayers = data.autoAssignPlayers;
  if (data.autoAssignPlayers) {
    await assignPlayers(backendService, { isSecondChanceComp: data.isSecondChanceComp });
  }
}
