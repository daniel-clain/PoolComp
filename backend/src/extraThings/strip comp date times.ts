import { Collection, type WithId } from "mongodb";
import { toCompDateOnly } from "../../../shared/comp-date.js";
import type { PoolComp_D } from "../../../shared/domain.js";

export async function stripCompDateTimes({
  activeCompCollection,
  compHistoryCollection,
}: {
  activeCompCollection: Collection<PoolComp_D>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<void> {
  const activeComps = await activeCompCollection.find({}).toArray();
  const historyComps = await compHistoryCollection.find({}).toArray();

  let updatedCount = 0;

  await updateCompsInCollection(activeCompCollection, activeComps);
  await updateCompsInCollection(compHistoryCollection, historyComps);

  console.log(`stripCompDateTimes: updated ${updatedCount} comps`);

  async function updateCompsInCollection(
    collection: Collection<PoolComp_D>,
    comps: WithId<PoolComp_D>[],
  ): Promise<void> {
    for (const comp of comps) {
      const dateOnly = toCompDateOnly(comp.date);
      if (comp.date === dateOnly) {
        continue;
      }

      await collection.updateOne(
        { _id: comp._id },
        { $set: { date: dateOnly } },
      );
      updatedCount += 1;
      console.log(`stripCompDateTimes: comp ${comp.id} ${comp.date} -> ${dateOnly}`);
    }
  }
}
