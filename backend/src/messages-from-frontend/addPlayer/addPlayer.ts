import _ from "lodash";
import { randomUUID } from "node:crypto";
import type { Player } from "../../../../shared/domain.js";
import type { BackendService } from "../../services/backend.service.js";

export async function addPlayer(
  backendService: BackendService,
  data: { name: string },
): Promise<void> {
  const newPlayer: Player = {
    id: randomUUID(),
    name: data.name.trim(),
    deactivated: false,
  };
  await backendService.mongoDbService.playersCollection.insertOne(newPlayer);
  const updatedPlayerResult = await backendService.mongoDbService.playersCollection.findOne(
    { id: newPlayer.id },
    { projection: { _id: 0 } },
  );
  if (!updatedPlayerResult) throw new Error("Player not found");
  backendService.backendState.players = _.orderBy([...backendService.backendState.players, updatedPlayerResult], ['name'], ['asc']);
}
