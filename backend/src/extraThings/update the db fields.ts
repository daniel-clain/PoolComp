import { Collection } from "mongodb";
import type { PoolComp_D, RegisteredPlayer_D, Slot_D } from "../../../shared/domain.js";

type FieldMapping = {
  from: string;
  to: string;
  count: number;
};

type TypeMismatchReport = {
  location: string;
  kind: "missing" | "unexpected";
  key: string;
  count: number;
};

export async function updateDataFieldNames({
  activeCompCollection,
  compHistoryCollection,
}: {
  activeCompCollection: Collection<PoolComp_D>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<void> {
  const registeredPlayerFieldMappings: FieldMapping[] = [
    { from: "id", to: "playerId", count: 0 },
  ];
  const slotFieldMappings: FieldMapping[] = [
    { from: "player", to: "playerId", count: 0 },
  ];

  const expectedRegisteredPlayerKeys = ["playerId", "paid"];
  const requiredSlotKeys = ["id"];
  const allowedSlotKeys = ["id", "isBye", "playerId"];
  const typeMismatchReports: TypeMismatchReport[] = [];

  let updatedCompCount = 0;

  await updateCompCollection(activeCompCollection);
  await updateCompCollection(compHistoryCollection);
  printReport();

  async function updateCompCollection(
    collection: Collection<PoolComp_D>,
  ): Promise<void> {
    const comps = await collection.find({}).toArray();

    for (const comp of comps) {
      const registeredPlayersSource = (comp.registeredPlayers ?? []) as Record<string, unknown>[];
      const slotsSource = (comp.slots ?? []) as Record<string, unknown>[];
      const secondChanceSlotsSource = comp.secondChanceSlots
        ? (comp.secondChanceSlots as Record<string, unknown>[])
        : undefined;

      const updatedRegisteredPlayers = registeredPlayersSource.map((registeredPlayer, index) =>
        normalizeRegisteredPlayer(
          registeredPlayer,
          `comp ${comp.id} registeredPlayers[${index}]`,
        ),
      );

      const updatedSlots = slotsSource.map((slot, index) =>
        normalizeSlot(slot, `comp ${comp.id} slots[${index}]`),
      );

      const updatedSecondChanceSlots = secondChanceSlotsSource
        ? secondChanceSlotsSource.map((slot, index) =>
          normalizeSlot(slot, `comp ${comp.id} secondChanceSlots[${index}]`),
        )
        : undefined;

      const documentNeedsUpdate =
        !recordsMatch(registeredPlayersSource, updatedRegisteredPlayers)
        || !recordsMatch(slotsSource, updatedSlots)
        || (secondChanceSlotsSource
          ? !recordsMatch(secondChanceSlotsSource, updatedSecondChanceSlots!)
          : false);

      if (!documentNeedsUpdate) {
        continue;
      }

      await collection.updateOne(
        { id: comp.id },
        {
          $set: {
            registeredPlayers: updatedRegisteredPlayers,
            slots: updatedSlots,
            ...(updatedSecondChanceSlots
              ? { secondChanceSlots: updatedSecondChanceSlots }
              : {}),
          },
        },
      );
      updatedCompCount += 1;
      console.log(`updateDataFieldNames: updated comp ${comp.id}`);
    }
  }

  function normalizeRegisteredPlayer(
    record: Record<string, unknown>,
    location: string,
  ): RegisteredPlayer_D {
    const workingRecord = { ...record };

    for (const mapping of registeredPlayerFieldMappings) {
      if (!(mapping.to in workingRecord) && mapping.from in workingRecord) {
        workingRecord[mapping.to] = workingRecord[mapping.from];
        delete workingRecord[mapping.from];
        mapping.count += 1;
      }
    }

    recordTypeMismatches(
      location,
      workingRecord,
      expectedRegisteredPlayerKeys,
      expectedRegisteredPlayerKeys,
    );

    return {
      playerId: String(workingRecord.playerId ?? ""),
      paid: Boolean(workingRecord.paid),
    };
  }

  function normalizeSlot(
    record: Record<string, unknown>,
    location: string,
  ): Slot_D {
    const workingRecord = { ...record };

    for (const mapping of slotFieldMappings) {
      if (mapping.from === "player" && mapping.from in workingRecord && !(mapping.to in workingRecord)) {
        const embeddedPlayer = workingRecord.player as Record<string, unknown> | undefined;
        const playerId = embeddedPlayer?.playerId ?? embeddedPlayer?.id;
        if (playerId !== undefined) {
          workingRecord.playerId = playerId;
          delete workingRecord.player;
          mapping.count += 1;
        }
      } else if (!(mapping.to in workingRecord) && mapping.from in workingRecord) {
        workingRecord[mapping.to] = workingRecord[mapping.from];
        delete workingRecord[mapping.from];
        mapping.count += 1;
      }
    }

    recordTypeMismatches(
      location,
      workingRecord,
      requiredSlotKeys,
      allowedSlotKeys,
    );

    return {
      id: Number(workingRecord.id),
      ...(workingRecord.isBye ? { isBye: true as const } : {}),
      ...(workingRecord.playerId ? { playerId: String(workingRecord.playerId) } : {}),
    };
  }

  function recordTypeMismatches(
    location: string,
    record: Record<string, unknown>,
    requiredKeys: string[],
    allowedKeys: string[],
  ): void {
    for (const requiredKey of requiredKeys) {
      if (!(requiredKey in record)) {
        incrementTypeMismatch(location, "missing", requiredKey);
      }
    }

    for (const actualKey of Object.keys(record)) {
      if (!allowedKeys.includes(actualKey)) {
        incrementTypeMismatch(location, "unexpected", actualKey);
      }
    }
  }

  function incrementTypeMismatch(
    location: string,
    kind: "missing" | "unexpected",
    key: string,
  ): void {
    const existingReport = typeMismatchReports.find(
      (report) => report.location === location && report.kind === kind && report.key === key,
    );
    if (existingReport) {
      existingReport.count += 1;
      return;
    }
    typeMismatchReports.push({ location, kind, key, count: 1 });
  }

  function recordsMatch(
    before: Record<string, unknown>[],
    after: Array<RegisteredPlayer_D | Slot_D>,
  ): boolean {
    return JSON.stringify(before) === JSON.stringify(after);
  }

  function printReport(): void {
    console.log("\n========== updateDataFieldNames report ==========");
    console.log(`Comps updated: ${updatedCompCount}`);

    console.log("\nField mapping usage:");
    const allMappings = [
      ...registeredPlayerFieldMappings.map((mapping) => ({
        context: "registeredPlayers",
        ...mapping,
      })),
      ...slotFieldMappings.map((mapping) => ({
        context: "slots",
        ...mapping,
      })),
    ];
    for (const mapping of allMappings) {
      console.log(
        `  ${mapping.context}: "${mapping.from}" → "${mapping.to}" used ${mapping.count} time(s)`,
      );
    }

    console.log("\nFields that do not match the type definition:");
    if (typeMismatchReports.length === 0) {
      console.log("  none");
    } else {
      const aggregatedMismatches = new Map<string, number>();
      for (const report of typeMismatchReports) {
        const aggregateKey = `${report.kind} ${report.key}`;
        aggregatedMismatches.set(
          aggregateKey,
          (aggregatedMismatches.get(aggregateKey) ?? 0) + report.count,
        );
      }
      for (const [aggregateKey, count] of aggregatedMismatches) {
        console.log(`  ${aggregateKey}: ${count} time(s)`);
      }

      console.log("\nDetailed type mismatches:");
      for (const report of typeMismatchReports) {
        console.log(
          `  ${report.location}: ${report.kind} "${report.key}" (${report.count})`,
        );
      }
    }
    console.log("=================================================\n");
  }
}
