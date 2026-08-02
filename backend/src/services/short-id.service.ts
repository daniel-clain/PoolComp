import type { Collection } from "mongodb";
import type { Player, PoolComp_D } from "../../../shared/domain.js";

const minimumFourDigitId = 1000;
const maximumFourDigitId = 9999;

export function createUniqueFourDigitId(existingIds: Set<string>): string {
  const availableCount = maximumFourDigitId - minimumFourDigitId + 1;
  if (existingIds.size >= availableCount) {
    throw new Error("No available 4-digit IDs left");
  }

  while (true) {
    const id = String(
      Math.floor(Math.random() * availableCount) + minimumFourDigitId,
    );
    if (!existingIds.has(id)) {
      return id;
    }
  }
}

export async function getAllUsedIds({
  playersCollection,
  activeCompCollection,
  compHistoryCollection,
}: {
  playersCollection: Collection<Player>;
  activeCompCollection: Collection<PoolComp_D>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<Set<string>> {
  const [players, activeComps, historyComps] = await Promise.all([
    playersCollection.find({}, { projection: { id: 1, _id: 0 } }).toArray(),
    activeCompCollection.find({}, { projection: { id: 1, _id: 0 } }).toArray(),
    compHistoryCollection.find({}, { projection: { id: 1, _id: 0 } }).toArray(),
  ]);

  return new Set([
    ...players.map((player) => player.id),
    ...activeComps.map((comp) => comp.id),
    ...historyComps.map((comp) => comp.id),
  ]);
}
