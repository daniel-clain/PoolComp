import type { Collection } from "mongodb";
import { toCompDateOnly } from "../../../../shared/comp-date.js";
import type {
  Player,
  PoolComp_D,
  RegisteredPlayer_D,
  Slot_D,
} from "../../../../shared/domain.js";
import { dateIsTheThirdThursdayOfTheMonth } from "../../../../shared/prize-money.service.js";
import { createUniqueFourDigitId, getAllUsedIds } from "../../services/short-id.service.js";
import {
  getHistoricalCompetitionSourceEntries,
  getSourcePlayerNameToDatabasePlayerName,
  type HistoricalCompetitionSourceEntry,
} from "./import 2026 comp history.data.js";

export const singleTestImportCompetitionDate = "2026-07-02";

type ProposedHistoricalCompetition = Omit<PoolComp_D, "id">;

type HistoricalCompetitionProposal = {
  competition: ProposedHistoricalCompetition;
  unknownRegisteredPlayerCount: number;
};

type ExistingCompetitionSummary = {
  id: string;
  competitionDate: string;
  registeredPlayerCount: number;
  mainCompetitionFirstPlacePlayerId: string | undefined;
  mainCompetitionSecondPlacePlayerId: string | undefined;
  isBigCompetition: boolean;
  secondChanceCompetitionFirstPlacePlayerId: string | undefined;
  secondChanceCompetitionSecondPlacePlayerId: string | undefined;
};

export type HistoricalCompetitionImportValidation = {
  errors: string[];
  missingSourcePlayerNames: string[];
  missingDatabasePlayerNames: string[];
  duplicatedDatabasePlayerNames: string[];
};

export type HistoricalCompetitionImportClassification = {
  kind: "wouldInsert" | "skipDuplicate" | "conflict";
  proposal: HistoricalCompetitionProposal;
  existingCompetitions: ExistingCompetitionSummary[];
};

export type HistoricalCompetitionImportPreview = {
  validation: HistoricalCompetitionImportValidation;
  classifications: HistoricalCompetitionImportClassification[];
  totals: {
    sourceCompetitions: number;
    wouldInsert: number;
    skipDuplicate: number;
    conflict: number;
  };
};

export async function preview2026CompHistoryImport({
  playersCollection,
  compHistoryCollection,
}: {
  playersCollection: Collection<Player>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<HistoricalCompetitionImportPreview> {
  const [databasePlayers, existingCompetitions] = await Promise.all([
    playersCollection.find({}, { projection: { _id: 0 } }).toArray(),
    compHistoryCollection.find({}, { projection: { _id: 0 } }).toArray(),
  ]);

  const preview = createHistoricalCompetitionImportPreview({
    sourceEntries: getHistoricalCompetitionSourceEntries(),
    sourcePlayerNameToDatabasePlayerName: getSourcePlayerNameToDatabasePlayerName(),
    databasePlayers,
    existingCompetitions,
  });
  printHistoricalCompetitionImportPreview(preview, databasePlayers);
  return preview;
}

export async function insertSingleTest2026CompHistoryImport({
  playersCollection,
  activeCompCollection,
  compHistoryCollection,
}: {
  playersCollection: Collection<Player>;
  activeCompCollection: Collection<PoolComp_D>;
  compHistoryCollection: Collection<PoolComp_D>;
}): Promise<void> {
  const preview = await preview2026CompHistoryImport({
    playersCollection,
    compHistoryCollection,
  });
  const allowedInsert = getSingleTestImportInsert(preview);
  if (!allowedInsert) {
    console.log(
      `TEST INSERT skipped: no safe insert for ${singleTestImportCompetitionDate}`,
    );
    console.log("No database changes were made.");
    return;
  }

  const existingCompetitionsOnAllowedDate = await compHistoryCollection
    .find({}, { projection: { _id: 0, date: 1 } })
    .toArray();
  const allowedDateAlreadyExists = existingCompetitionsOnAllowedDate.some(
    (existingCompetition) =>
      toCompDateOnly(existingCompetition.date) === singleTestImportCompetitionDate,
  );
  if (allowedDateAlreadyExists) {
    console.log(
      `TEST INSERT skipped: CompHistory already has ${singleTestImportCompetitionDate}`,
    );
    console.log("No database changes were made.");
    return;
  }

  const usedIds = await getAllUsedIds({
    playersCollection,
    activeCompCollection,
    compHistoryCollection,
  });
  const newCompetition: PoolComp_D = {
    id: createUniqueFourDigitId(usedIds),
    ...allowedInsert.proposal.competition,
  };
  const insertResult = await compHistoryCollection.insertOne(newCompetition);
  if (!insertResult.acknowledged) {
    throw "TEST INSERT failed: CompHistory insert was not acknowledged";
  }
  console.log(
    `TEST INSERT inserted one CompHistory record: ${newCompetition.date} id=${newCompetition.id}`,
  );
}

export function getSingleTestImportInsert(
  preview: HistoricalCompetitionImportPreview,
): HistoricalCompetitionImportClassification | undefined {
  if (preview.validation.errors.length > 0) {
    return undefined;
  }

  const allowedInserts = preview.classifications.filter((classification) =>
    classification.kind === "wouldInsert"
    && classification.proposal.competition.date === singleTestImportCompetitionDate
  );
  if (allowedInserts.length !== 1) {
    return undefined;
  }
  return allowedInserts[0];
}

export function createHistoricalCompetitionImportPreview({
  sourceEntries,
  sourcePlayerNameToDatabasePlayerName,
  databasePlayers,
  existingCompetitions,
}: {
  sourceEntries: HistoricalCompetitionSourceEntry[];
  sourcePlayerNameToDatabasePlayerName: Record<string, string>;
  databasePlayers: Player[];
  existingCompetitions: PoolComp_D[];
}): HistoricalCompetitionImportPreview {
  const validation = validateHistoricalCompetitionImport({
    sourceEntries,
    sourcePlayerNameToDatabasePlayerName,
    databasePlayers,
  });

  if (validation.errors.length > 0) {
    return {
      validation,
      classifications: [],
      totals: {
        sourceCompetitions: sourceEntries.length,
        wouldInsert: 0,
        skipDuplicate: 0,
        conflict: 0,
      },
    };
  }

  const databasePlayersByName = getDatabasePlayersByName(databasePlayers);
  const classifications = sourceEntries.map((sourceEntry) => {
    const proposal = createHistoricalCompetitionProposal({
      sourceEntry,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
      databasePlayersByName,
    });
    return classifyHistoricalCompetitionProposal(proposal, existingCompetitions);
  });

  return {
    validation,
    classifications,
    totals: {
      sourceCompetitions: sourceEntries.length,
      wouldInsert: countClassifications("wouldInsert"),
      skipDuplicate: countClassifications("skipDuplicate"),
      conflict: countClassifications("conflict"),
    },
  };

  function countClassifications(
    kind: HistoricalCompetitionImportClassification["kind"],
  ): number {
    return classifications.filter((classification) => classification.kind === kind).length;
  }
}

export function validateHistoricalCompetitionImport({
  sourceEntries,
  sourcePlayerNameToDatabasePlayerName,
  databasePlayers,
}: {
  sourceEntries: HistoricalCompetitionSourceEntry[];
  sourcePlayerNameToDatabasePlayerName: Record<string, string>;
  databasePlayers: Player[];
}): HistoricalCompetitionImportValidation {
  const sourcePlayerNames = new Set(sourceEntries.flatMap(getSourcePlayerNames));
  const missingSourcePlayerNames = Array.from(sourcePlayerNames)
    .filter((sourcePlayerName) => !(sourcePlayerName in sourcePlayerNameToDatabasePlayerName))
    .sort();
  const mappedDatabasePlayerNames = Array.from(sourcePlayerNames)
    .map((sourcePlayerName) => sourcePlayerNameToDatabasePlayerName[sourcePlayerName])
    .filter((databasePlayerName): databasePlayerName is string =>
      databasePlayerName !== undefined
    );
  const databasePlayersByName = getDatabasePlayersByName(databasePlayers);
  const missingDatabasePlayerNames = Array.from(new Set(mappedDatabasePlayerNames))
    .filter((databasePlayerName) => !databasePlayersByName.has(databasePlayerName))
    .sort();
  const duplicatedDatabasePlayerNames = Array.from(new Set(mappedDatabasePlayerNames))
    .filter((databasePlayerName) =>
      (databasePlayersByName.get(databasePlayerName)?.length ?? 0) > 1
    )
    .sort();
  const errors = [
    ...missingSourcePlayerNames.map(
      (sourcePlayerName) => `No name-map entry for source player "${sourcePlayerName}"`,
    ),
    ...missingDatabasePlayerNames.map(
      (databasePlayerName) => `No database player named "${databasePlayerName}"`,
    ),
    ...duplicatedDatabasePlayerNames.map(
      (databasePlayerName) => `More than one database player is named "${databasePlayerName}"`,
    ),
  ];

  validateSourceEntries();

  return {
    errors,
    missingSourcePlayerNames,
    missingDatabasePlayerNames,
    duplicatedDatabasePlayerNames,
  };

  function validateSourceEntries(): void {
    const sourceEntryCountsByDate = new Map<string, number>();
    for (const sourceEntry of sourceEntries) {
      sourceEntryCountsByDate.set(
        sourceEntry.competitionDate,
        (sourceEntryCountsByDate.get(sourceEntry.competitionDate) ?? 0) + 1,
      );

      const isBigCompetition = dateIsTheThirdThursdayOfTheMonth(
        sourceEntry.competitionDate,
      );
      const hasSecondChanceFirstPlace = Boolean(
        sourceEntry.secondChanceCompetitionFirstPlaceName,
      );
      const hasSecondChanceSecondPlace = Boolean(
        sourceEntry.secondChanceCompetitionSecondPlaceName,
      );
      if (isBigCompetition && (!hasSecondChanceFirstPlace || !hasSecondChanceSecondPlace)) {
        errors.push(
          `${sourceEntry.competitionDate} is a big competition but is missing second-chance finalists`,
        );
      }
      if (!isBigCompetition && (hasSecondChanceFirstPlace || hasSecondChanceSecondPlace)) {
        errors.push(
          `${sourceEntry.competitionDate} is not a big competition but has second-chance finalists`,
        );
      }

      const uniqueKnownPlayerCount = new Set(getSourcePlayerNames(sourceEntry)).size;
      if (sourceEntry.registeredPlayerCount < uniqueKnownPlayerCount) {
        errors.push(
          `${sourceEntry.competitionDate} has fewer registered players than known finalists`,
        );
      }
    }

    for (const [competitionDate, count] of sourceEntryCountsByDate) {
      if (count > 1) {
        errors.push(`Source data contains ${count} competitions dated ${competitionDate}`);
      }
    }
  }
}

export function createHistoricalCompetitionProposal({
  sourceEntry,
  sourcePlayerNameToDatabasePlayerName,
  databasePlayers,
  databasePlayersByName = getDatabasePlayersByName(databasePlayers),
}: {
  sourceEntry: HistoricalCompetitionSourceEntry;
  sourcePlayerNameToDatabasePlayerName: Record<string, string>;
  databasePlayers: Player[];
  databasePlayersByName?: Map<string, Player[]>;
}): HistoricalCompetitionProposal {
  const knownPlayers = getSourcePlayerNames(sourceEntry).map(getMappedDatabasePlayer);
  const uniqueKnownPlayers = Array.from(
    new Map(knownPlayers.map((player) => [player.id, player])).values(),
  );
  const unknownRegisteredPlayerCount =
    sourceEntry.registeredPlayerCount - uniqueKnownPlayers.length;
  const registeredPlayers: ProposedHistoricalCompetition["registeredPlayers"] = [
    ...uniqueKnownPlayers.map(createPaidRegisteredPlayerData),
    ...Array.from({ length: unknownRegisteredPlayerCount }, () => null),
  ];
  const mainCompetitionFirstPlacePlayer = getMappedDatabasePlayer(
    sourceEntry.mainCompetitionFirstPlaceName,
  );
  const mainCompetitionSecondPlacePlayer = getMappedDatabasePlayer(
    sourceEntry.mainCompetitionSecondPlaceName,
  );
  const isBigCompetition = dateIsTheThirdThursdayOfTheMonth(
    sourceEntry.competitionDate,
  );

  return {
    competition: {
      date: sourceEntry.competitionDate,
      registeredPlayers,
      slots: createFinalSlots(
        mainCompetitionFirstPlacePlayer.id,
        mainCompetitionSecondPlacePlayer.id,
      ),
      ...(isBigCompetition
        ? {
          secondChanceSlots: createFinalSlots(
            getMappedDatabasePlayer(
              sourceEntry.secondChanceCompetitionFirstPlaceName!,
            ).id,
            getMappedDatabasePlayer(
              sourceEntry.secondChanceCompetitionSecondPlaceName!,
            ).id,
          ),
        }
        : {}),
    },
    unknownRegisteredPlayerCount,
  };

  function getMappedDatabasePlayer(sourcePlayerName: string): Player {
    const databasePlayerName =
      sourcePlayerNameToDatabasePlayerName[sourcePlayerName];
    const [databasePlayer] = databasePlayersByName.get(databasePlayerName!) ?? [];
    if (!databasePlayer) {
      throw `Cannot build ${sourceEntry.competitionDate}: player "${sourcePlayerName}" did not resolve`;
    }
    return databasePlayer;
  }
}

function classifyHistoricalCompetitionProposal(
  proposal: HistoricalCompetitionProposal,
  existingCompetitions: PoolComp_D[],
): HistoricalCompetitionImportClassification {
  const existingCompetitionsOnDate = existingCompetitions
    .filter((existingCompetition) =>
      toCompDateOnly(existingCompetition.date) === proposal.competition.date
    )
    .map(summarizeExistingCompetition);
  const hasExactDuplicate = existingCompetitionsOnDate.some((existingCompetition) =>
    competitionMatchesProposal(existingCompetition, proposal.competition)
  );

  return {
    kind: hasExactDuplicate
      ? "skipDuplicate"
      : existingCompetitionsOnDate.length > 0
        ? "conflict"
        : "wouldInsert",
    proposal,
    existingCompetitions: existingCompetitionsOnDate,
  };
}

function competitionMatchesProposal(
  existingCompetition: ExistingCompetitionSummary,
  proposal: ProposedHistoricalCompetition,
): boolean {
  const proposedMainFinalists = getFinalistPlayerIds(proposal.slots);
  const proposedSecondChanceFinalists = getFinalistPlayerIds(
    proposal.secondChanceSlots,
  );
  const proposedIsBigCompetition = Boolean(proposal.secondChanceSlots?.length);

  return (
    existingCompetition.registeredPlayerCount === proposal.registeredPlayers.length
    && existingCompetition.mainCompetitionFirstPlacePlayerId
    === proposedMainFinalists.firstPlacePlayerId
    && existingCompetition.mainCompetitionSecondPlacePlayerId
    === proposedMainFinalists.secondPlacePlayerId
    && existingCompetition.isBigCompetition === proposedIsBigCompetition
    && (
      !proposedIsBigCompetition
      || (
        existingCompetition.secondChanceCompetitionFirstPlacePlayerId
        === proposedSecondChanceFinalists.firstPlacePlayerId
        && existingCompetition.secondChanceCompetitionSecondPlacePlayerId
        === proposedSecondChanceFinalists.secondPlacePlayerId
      )
    )
  );
}

function summarizeExistingCompetition(
  competition: PoolComp_D,
): ExistingCompetitionSummary {
  const mainCompetitionFinalists = getFinalistPlayerIds(competition.slots);
  const secondChanceCompetitionFinalists = getFinalistPlayerIds(
    competition.secondChanceSlots,
  );

  return {
    id: competition.id,
    competitionDate: toCompDateOnly(competition.date),
    registeredPlayerCount: competition.registeredPlayers.length,
    mainCompetitionFirstPlacePlayerId:
      mainCompetitionFinalists.firstPlacePlayerId,
    mainCompetitionSecondPlacePlayerId:
      mainCompetitionFinalists.secondPlacePlayerId,
    isBigCompetition: Boolean(competition.secondChanceSlots?.length),
    secondChanceCompetitionFirstPlacePlayerId:
      secondChanceCompetitionFinalists.firstPlacePlayerId,
    secondChanceCompetitionSecondPlacePlayerId:
      secondChanceCompetitionFinalists.secondPlacePlayerId,
  };
}

function getFinalistPlayerIds(slots: Slot_D[] | undefined): {
  firstPlacePlayerId: string | undefined;
  secondPlacePlayerId: string | undefined;
} {
  const firstPlacePlayerId = slots?.[0]?.playerId;
  const secondPlacePlayerId = [slots?.[1]?.playerId, slots?.[2]?.playerId]
    .find((playerId) => playerId && playerId !== firstPlacePlayerId);
  return { firstPlacePlayerId, secondPlacePlayerId };
}

function createFinalSlots(
  firstPlacePlayerId: string,
  secondPlacePlayerId: string,
): Slot_D[] {
  return [
    { id: 0, playerId: firstPlacePlayerId },
    { id: 1, playerId: firstPlacePlayerId },
    { id: 2, playerId: secondPlacePlayerId },
  ];
}

function createPaidRegisteredPlayerData(player: Player): RegisteredPlayer_D {
  return {
    playerId: player.id,
    paid: true,
  };
}

function getSourcePlayerNames(
  sourceEntry: HistoricalCompetitionSourceEntry,
): string[] {
  return [
    sourceEntry.mainCompetitionFirstPlaceName,
    sourceEntry.mainCompetitionSecondPlaceName,
    sourceEntry.secondChanceCompetitionFirstPlaceName,
    sourceEntry.secondChanceCompetitionSecondPlaceName,
  ].filter((playerName): playerName is string => Boolean(playerName));
}

function getDatabasePlayersByName(databasePlayers: Player[]): Map<string, Player[]> {
  const databasePlayersByName = new Map<string, Player[]>();
  for (const databasePlayer of databasePlayers) {
    const playersWithName = databasePlayersByName.get(databasePlayer.name) ?? [];
    playersWithName.push(databasePlayer);
    databasePlayersByName.set(databasePlayer.name, playersWithName);
  }
  return databasePlayersByName;
}

function printHistoricalCompetitionImportPreview(
  preview: HistoricalCompetitionImportPreview,
  databasePlayers: Player[],
): void {
  console.log("\n========== 2026 comp history import preview ==========");
  console.log(`Source competitions: ${preview.totals.sourceCompetitions}`);

  if (preview.validation.errors.length > 0) {
    console.log("VALIDATION_FAILED");
    for (const error of preview.validation.errors) {
      console.log(`  ${error}`);
    }
    console.log("No database changes were made.");
    console.log("======================================================\n");
    return;
  }

  const databasePlayerNamesById = new Map(
    databasePlayers.map((player) => [player.id, player.name]),
  );
  for (const classification of preview.classifications) {
    const proposalSummary = formatProposedCompetition(
      classification.proposal.competition,
      classification.proposal.unknownRegisteredPlayerCount,
      databasePlayerNamesById,
    );
    if (classification.kind === "conflict") {
      console.log(`CONFLICT ${proposalSummary}`);
      for (const existingCompetition of classification.existingCompetitions) {
        console.log(
          `  DATABASE ${formatExistingCompetition(existingCompetition, databasePlayerNamesById)}`,
        );
      }
      continue;
    }

    const label = classification.kind === "skipDuplicate"
      ? "SKIP_DUPLICATE"
      : "WOULD_INSERT";
    console.log(`${label} ${proposalSummary}`);
  }

  console.log("\nPreview totals:");
  console.log(`  WOULD_INSERT: ${preview.totals.wouldInsert}`);
  console.log(`  SKIP_DUPLICATE: ${preview.totals.skipDuplicate}`);
  console.log(`  CONFLICT: ${preview.totals.conflict}`);
  console.log("No database changes were made.");
  console.log("======================================================\n");
}

function formatProposedCompetition(
  competition: ProposedHistoricalCompetition,
  unknownRegisteredPlayerCount: number,
  databasePlayerNamesById: Map<string, string>,
): string {
  const mainCompetitionFinalists = getFinalistPlayerIds(competition.slots);
  const secondChanceCompetitionFinalists = getFinalistPlayerIds(
    competition.secondChanceSlots,
  );
  const mainFirstPlaceName = getPlayerName(
    mainCompetitionFinalists.firstPlacePlayerId,
  );
  const mainSecondPlaceName = getPlayerName(
    mainCompetitionFinalists.secondPlacePlayerId,
  );
  const secondChanceDescription = competition.secondChanceSlots
    ? `, secondChance=${getPlayerName(secondChanceCompetitionFinalists.firstPlacePlayerId)}/${getPlayerName(secondChanceCompetitionFinalists.secondPlacePlayerId)}`
    : "";
  return (
    `${competition.date}: players=${competition.registeredPlayers.length}, `
    + `main=${mainFirstPlaceName}/${mainSecondPlaceName}${secondChanceDescription}, `
    + `unknownPlayers=${unknownRegisteredPlayerCount}`
  );

  function getPlayerName(playerId: string | undefined): string {
    if (!playerId) return "missing";
    return databasePlayerNamesById.get(playerId) ?? `unknown(${playerId})`;
  }
}

function formatExistingCompetition(
  competition: ExistingCompetitionSummary,
  databasePlayerNamesById: Map<string, string>,
): string {
  const secondChanceDescription = competition.isBigCompetition
    ? `, secondChance=${getPlayerName(competition.secondChanceCompetitionFirstPlacePlayerId)}/${getPlayerName(competition.secondChanceCompetitionSecondPlacePlayerId)}`
    : "";
  return (
    `id=${competition.id}, players=${competition.registeredPlayerCount}, `
    + `main=${getPlayerName(competition.mainCompetitionFirstPlacePlayerId)}/${getPlayerName(competition.mainCompetitionSecondPlacePlayerId)}`
    + secondChanceDescription
  );

  function getPlayerName(playerId: string | undefined): string {
    if (!playerId) return "missing";
    return databasePlayerNamesById.get(playerId) ?? `unknown(${playerId})`;
  }
}
