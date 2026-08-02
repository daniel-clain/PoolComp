import type { Collection, WithId } from "mongodb";
import type { Player, PoolComp_D, Slot_D } from "../../../shared/domain.js";
import { createUniqueFourDigitId } from "../services/short-id.service.js";

export async function recreateShortIds({
  playersCollection,
  activeCompCollection,
  compHistoryCollection,
}: {
  playersCollection: Collection<Player>;
  activeCompCollection: Collection<PoolComp_D>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<void> {
  const players = await playersCollection.find({}).toArray();
  const activeComps = await activeCompCollection.find({}).toArray();
  const historyComps = await compHistoryCollection.find({}).toArray();

  const usedIds = new Set<string>();
  const playerIdMap = new Map<string, string>();
  const compIdMap = new Map<string, string>();

  for (const player of players) {
    const newId = createUniqueFourDigitId(usedIds);
    usedIds.add(newId);
    playerIdMap.set(player.id, newId);
  }

  for (const comp of [...activeComps, ...historyComps]) {
    const newId = createUniqueFourDigitId(usedIds);
    usedIds.add(newId);
    compIdMap.set(comp.id, newId);
  }

  for (const player of players) {
    const newId = playerIdMap.get(player.id)!;
    await playersCollection.updateOne(
      { _id: player._id },
      { $set: { id: newId } },
    );
    console.log(`recreateShortIds: player ${player.name} ${player.id} -> ${newId}`);
  }

  for (const comp of activeComps) {
    await replaceCompWithShortIds(activeCompCollection, comp, playerIdMap, compIdMap);
  }

  for (const comp of historyComps) {
    await replaceCompWithShortIds(compHistoryCollection, comp, playerIdMap, compIdMap);
  }

  console.log(
    `recreateShortIds: updated ${players.length} players, ${activeComps.length} active comps, ${historyComps.length} history comps`,
  );

  async function replaceCompWithShortIds(
    collection: Collection<PoolComp_D>,
    comp: WithId<PoolComp_D>,
    playerIdMap: Map<string, string>,
    compIdMap: Map<string, string>,
  ): Promise<void> {
    const { _id, ...compWithoutMongoId } = comp;
    const updatedComp: PoolComp_D = {
      ...compWithoutMongoId,
      id: compIdMap.get(comp.id)!,
      registeredPlayers: comp.registeredPlayers.map((registeredPlayer) => ({
        playerId: playerIdMap.get(registeredPlayer.playerId) ?? registeredPlayer.playerId,
        paid: registeredPlayer.paid,
      })),
      slots: rewriteSlotPlayerIds(comp.slots, playerIdMap),
      ...(comp.secondChanceSlots
        ? { secondChanceSlots: rewriteSlotPlayerIds(comp.secondChanceSlots, playerIdMap) }
        : {}),
    };

    await collection.replaceOne({ _id }, updatedComp);
    console.log(`recreateShortIds: comp ${comp.id} -> ${updatedComp.id}`);
  }

  function rewriteSlotPlayerIds(
    slots: Slot_D[],
    playerIdMap: Map<string, string>,
  ): Slot_D[] {
    return slots.map((slot) => ({
      id: slot.id,
      ...(slot.isBye ? { isBye: true as const } : {}),
      ...(slot.playerId
        ? { playerId: playerIdMap.get(slot.playerId) ?? slot.playerId }
        : {}),
    }));
  }
}
