import { describe, expect, test } from "vitest";
import { convertToPoolComp, convertToPoolCompData } from "../../../../shared/data-convert.service";
import type { BackendState, Player, PoolComp, PoolComp_D } from "../../../../shared/domain";
import { poolCompHasUnknownRegisteredPlayers } from "../../../../shared/pool-comp.service";
import { poolCompConfig } from "../../../../shared/poolCompConfig";
import { dateIsTheThirdThursdayOfTheMonth } from "../../../../shared/prize-money.service";
import {
  createHistoricalCompetitionImportPreview,
  createHistoricalCompetitionProposal,
  getSingleTestImportInsert,
  singleTestImportCompetitionDate,
  validateHistoricalCompetitionImport,
} from "./import 2026 comp history";
import {
  getHistoricalCompetitionSourceEntries,
  getSourcePlayerNameToDatabasePlayerName,
  type HistoricalCompetitionSourceEntry,
} from "./import 2026 comp history.data";

describe("2026 comp history import preview", function () {
  const sourceEntries = getHistoricalCompetitionSourceEntries();
  const sourcePlayerNameToDatabasePlayerName =
    getSourcePlayerNameToDatabasePlayerName();
  const databasePlayers = createDatabasePlayers();

  test("contains only the 33 completed 2026 spreadsheet competitions", function () {
    expect(sourceEntries).toHaveLength(33);
    expect(sourceEntries[0]?.competitionDate).toBe("2026-01-08");
    expect(sourceEntries.at(-1)?.competitionDate).toBe("2026-08-20");
    expect(
      sourceEntries.some((sourceEntry) =>
        sourceEntry.competitionDate === "2025-12-18"
      ),
    ).toBe(false);
  });

  test("attaches every monthly jackpot result to a third-Thursday big comp", function () {
    const bigCompetitionEntries = sourceEntries.filter((sourceEntry) =>
      dateIsTheThirdThursdayOfTheMonth(sourceEntry.competitionDate)
    );

    expect(bigCompetitionEntries).toHaveLength(8);
    expect(
      bigCompetitionEntries.map((sourceEntry) => ({
        date: sourceEntry.competitionDate,
        firstPlace: sourceEntry.secondChanceCompetitionFirstPlaceName,
        secondPlace: sourceEntry.secondChanceCompetitionSecondPlaceName,
      })),
    ).toEqual([
      { date: "2026-01-15", firstPlace: "Paul", secondPlace: "Dan" },
      { date: "2026-02-19", firstPlace: "Scorgie", secondPlace: "Chris" },
      { date: "2026-03-19", firstPlace: "Martin", secondPlace: "Rox" },
      { date: "2026-04-16", firstPlace: "Tim", secondPlace: "Mark H" },
      { date: "2026-05-21", firstPlace: "Daz", secondPlace: "Dan" },
      { date: "2026-06-18", firstPlace: "Sam", secondPlace: "Kim" },
      { date: "2026-07-16", firstPlace: "Myles", secondPlace: "Sully" },
      { date: "2026-08-20", firstPlace: "George", secondPlace: "Scorgie" },
    ]);
  });

  test("validates every source name against one database player", function () {
    const validation = validateHistoricalCompetitionImport({
      sourceEntries,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
    });

    expect(validation.errors).toEqual([]);
  });

  test("reports every source name that does not have a map entry", function () {
    const validation = validateHistoricalCompetitionImport({
      sourceEntries: [
        createRegularSourceEntry({
          mainCompetitionFirstPlaceName: "Unmapped Winner",
          mainCompetitionSecondPlaceName: "Unmapped Runner",
        }),
      ],
      sourcePlayerNameToDatabasePlayerName: {},
      databasePlayers,
    });

    expect(validation.missingSourcePlayerNames).toEqual([
      "Unmapped Runner",
      "Unmapped Winner",
    ]);
  });

  test("preserves unknown registered players when converting comp data", function () {
    const [databasePlayer] = databasePlayers;
    const registeredPlayer = { ...databasePlayer!, paid: true };
    const poolComp: PoolComp = {
      id: "1000",
      date: "2026-01-08",
      registeredPlayers: [registeredPlayer, null],
      slots: [],
    };
    const poolCompData = convertToPoolCompData(poolComp);
    const backendState: BackendState = {
      activePoolComp: null,
      compHistory: [],
      players: databasePlayers,
      autoAssignPlayers: false,
      poolCompConfig,
      backendErrors: [],
    };

    expect(poolCompData.registeredPlayers).toEqual([
      { playerId: databasePlayer!.id, paid: true },
      null,
    ]);
    expect(
      convertToPoolComp(poolCompData, backendState).registeredPlayers,
    ).toEqual([registeredPlayer, null]);
    expect(poolCompHasUnknownRegisteredPlayers(poolComp)).toBe(true);
    expect(
      poolCompHasUnknownRegisteredPlayers({
        registeredPlayers: [registeredPlayer],
      }),
    ).toBe(false);
  });

  test("preserves known finalists and fills the remaining player count with nulls", function () {
    const sourceEntry = sourceEntries.find((entry) =>
      entry.competitionDate === "2026-01-15"
    )!;
    const firstProposal = createHistoricalCompetitionProposal({
      sourceEntry,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
    });
    const secondProposal = createHistoricalCompetitionProposal({
      sourceEntry,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers: databasePlayers.slice().reverse(),
    });
    const firstRegisteredPlayerIds = firstProposal.competition.registeredPlayers
      .map((registeredPlayer) => registeredPlayer?.playerId ?? null);
    const secondRegisteredPlayerIds = secondProposal.competition.registeredPlayers
      .map((registeredPlayer) => registeredPlayer?.playerId ?? null);

    expect(firstRegisteredPlayerIds).toEqual(secondRegisteredPlayerIds);
    expect(firstRegisteredPlayerIds).toEqual([
      getPlayerId("Mark H"),
      getPlayerId("Roxy"),
      getPlayerId("Paul"),
      getPlayerId("Daniel"),
      ...Array.from({ length: 14 }, () => null),
    ]);
    expect(firstProposal.competition.registeredPlayers).toHaveLength(18);
    expect(
      firstProposal.competition.registeredPlayers
        .filter((registeredPlayer) => registeredPlayer !== null)
        .every(
          (registeredPlayer) => registeredPlayer.paid,
        ),
    ).toBe(true);
    expect(firstProposal.unknownRegisteredPlayerCount).toBe(14);
    expect(
      poolCompHasUnknownRegisteredPlayers(firstProposal.competition),
    ).toBe(true);
    expect(firstProposal.competition.slots).toEqual([
      { id: 0, playerId: getPlayerId("Mark H") },
      { id: 1, playerId: getPlayerId("Mark H") },
      { id: 2, playerId: getPlayerId("Roxy") },
    ]);
    expect(firstProposal.competition.secondChanceSlots).toEqual([
      { id: 0, playerId: getPlayerId("Paul") },
      { id: 1, playerId: getPlayerId("Paul") },
      { id: 2, playerId: getPlayerId("Daniel") },
    ]);
  });

  test("skips an existing competition with the same date, count, and finalists", function () {
    const sourceEntry = sourceEntries.find((entry) =>
      entry.competitionDate === "2026-07-16"
    )!;
    const proposal = createHistoricalCompetitionProposal({
      sourceEntry,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
    });
    const existingCompetition: PoolComp_D = {
      id: "1000",
      ...proposal.competition,
    };

    const preview = createHistoricalCompetitionImportPreview({
      sourceEntries: [sourceEntry],
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
      existingCompetitions: [existingCompetition],
    });

    expect(preview.classifications[0]?.kind).toBe("skipDuplicate");
    expect(preview.totals.skipDuplicate).toBe(1);
  });

  test("reports a conflict instead of duplicating a different competition on the date", function () {
    const sourceEntry = sourceEntries.find((entry) =>
      entry.competitionDate === "2026-08-20"
    )!;
    const proposal = createHistoricalCompetitionProposal({
      sourceEntry,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
    });
    const existingCompetition: PoolComp_D = {
      id: "1001",
      ...proposal.competition,
      secondChanceSlots: [
        { id: 0, playerId: getPlayerId("Roxy") },
        { id: 1, playerId: getPlayerId("Roxy") },
        { id: 2, playerId: getPlayerId("Scorgie") },
      ],
    };

    const preview = createHistoricalCompetitionImportPreview({
      sourceEntries: [sourceEntry],
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
      existingCompetitions: [existingCompetition],
    });

    expect(preview.classifications[0]?.kind).toBe("conflict");
    expect(preview.totals.conflict).toBe(1);
    expect(preview.totals.wouldInsert).toBe(0);
  });

  test("allows a test insert only for 2 July 2026 when that date is a would-insert", function () {
    const preview = createHistoricalCompetitionImportPreview({
      sourceEntries,
      sourcePlayerNameToDatabasePlayerName,
      databasePlayers,
      existingCompetitions: [],
    });
    const allowedInsert = getSingleTestImportInsert(preview);
    const wouldInsertDates = preview.classifications
      .filter((classification) => classification.kind === "wouldInsert")
      .map((classification) => classification.proposal.competition.date);

    expect(wouldInsertDates.length).toBeGreaterThan(1);
    expect(wouldInsertDates).toContain(singleTestImportCompetitionDate);
    expect(allowedInsert?.kind).toBe("wouldInsert");
    expect(allowedInsert?.proposal.competition.date).toBe("2026-07-02");
    expect(allowedInsert?.proposal.competition.registeredPlayers).toHaveLength(18);
    expect(getSingleTestImportInsert({
      ...preview,
      classifications: preview.classifications.filter((classification) =>
        classification.proposal.competition.date !== singleTestImportCompetitionDate
      ),
    })).toBeUndefined();
  });

  function getPlayerId(playerName: string): string {
    return databasePlayers.find((player) => player.name === playerName)!.id;
  }

  function createDatabasePlayers(): Player[] {
    const mappedPlayerNames = Array.from(
      new Set(Object.values(sourcePlayerNameToDatabasePlayerName)),
    );
    const fillerPlayerNames = Array.from(
      { length: 30 - mappedPlayerNames.length },
      (_, index) => `Filler Player ${index + 1}`,
    );
    return [...mappedPlayerNames, ...fillerPlayerNames].map((name, index) => ({
      id: String(1000 + index),
      name,
      deactivated: index % 4 === 0,
    }));
  }

  function createRegularSourceEntry({
    mainCompetitionFirstPlaceName,
    mainCompetitionSecondPlaceName,
  }: {
    mainCompetitionFirstPlaceName: string;
    mainCompetitionSecondPlaceName: string;
  }): HistoricalCompetitionSourceEntry {
    return {
      competitionDate: "2026-01-08",
      registeredPlayerCount: 2,
      mainCompetitionFirstPlaceName,
      mainCompetitionSecondPlaceName,
    };
  }
});
