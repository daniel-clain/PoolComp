import type { sheets_v4 } from "googleapis";
import { withWeeklyPrizePreview } from "../domain/prizeMoney.js";
import {
  EMPTY_CORE,
  type PoolComp,
  type SharedAppState,
  type SharedAppStateCore,
  toSharedAppStateCore,
} from "../domain/types.js";

const PLAYERS_SHEET = "Players";
const ACTIVE_COMP_SHEET = "Active Comp";
const COMP_HISTORY_SHEET = "Comp History";

const SHEET_HEADERS = {
  [PLAYERS_SHEET]: ["name", "createdAt", "updatedAt", "isActive"],
  [ACTIVE_COMP_SHEET]: ["id", "createdAt", "started", "playersJson"],
  [COMP_HISTORY_SHEET]: [
    "id",
    "createdAt",
    "completedAt",
    "playersJson",
    "status",
  ],
} as const;

function toBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function parsePlayersJson(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

type PlayerMetadata = {
  createdAt: string;
};

export type StateRepository = {
  loadState(): Promise<SharedAppState>;
  saveState(state: SharedAppState): Promise<void>;
};

export function createInMemoryStateRepository(
  initialState: SharedAppState = withWeeklyPrizePreview(EMPTY_CORE),
): StateRepository {
  let memoryState: SharedAppStateCore = toSharedAppStateCore(initialState);

  async function loadState(): Promise<SharedAppState> {
    return withWeeklyPrizePreview(structuredClone(memoryState));
  }

  async function saveState(state: SharedAppState): Promise<void> {
    memoryState = toSharedAppStateCore(state);
  }

  return { loadState, saveState };
}

export function createStateRepository(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
): StateRepository {
  const playerMetadata = new Map<string, PlayerMetadata>();

  async function ensureWorksheets(): Promise<void> {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });

    const existingTitles = new Set(
      (spreadsheet.data.sheets ?? [])
        .map((sheet) => sheet.properties?.title)
        .filter((title): title is string => Boolean(title)),
    );

    const missingSheets = Object.keys(SHEET_HEADERS).filter(
      (title) => !existingTitles.has(title),
    );

    if (missingSheets.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: missingSheets.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      });
    }

    await Promise.all(
      Object.entries(SHEET_HEADERS).map(([title, headers]) =>
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${title}!A1`,
          valueInputOption: "RAW",
          requestBody: { values: [[...headers]] },
        }),
      ),
    );
  }

  async function getRows(sheetTitle: string): Promise<string[][]> {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A2:Z`,
    });

    const values = response.data.values ?? [];
    return values.map((row) => row.map((cell) => String(cell)));
  }

  async function replaceRows(
    sheetTitle: string,
    rows: string[][],
  ): Promise<void> {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetTitle}!A2:Z`,
    });

    if (rows.length === 0) {
      return;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A2`,
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });
  }

  async function loadState(): Promise<SharedAppState> {
    await ensureWorksheets();

    const [playerRows, activeCompRows, historyRows] = await Promise.all([
      getRows(PLAYERS_SHEET),
      getRows(ACTIVE_COMP_SHEET),
      getRows(COMP_HISTORY_SHEET),
    ]);

    playerMetadata.clear();

    const players = playerRows
      .filter((row) => row[0] && row[3] !== "false")
      .map((row) => {
        const name = row[0] ?? "";
        const createdAt = row[1] ?? new Date().toISOString();
        playerMetadata.set(name, { createdAt });
        return name;
      });

    const activeRow = activeCompRows[0];
    const activePoolComp =
      activeRow && activeRow[0]
        ? {
            id: activeRow[0],
            createdAt: activeRow[1] ?? new Date().toISOString(),
            started: toBoolean(activeRow[2]),
            players: parsePlayersJson(activeRow[3]),
          }
        : null;

    const historicalMatches: PoolComp[] = historyRows
      .filter((row) => row[0])
      .map((row) => ({
        id: row[0] ?? "",
        createdAt: row[1] ?? new Date().toISOString(),
        completedAt: row[2] ?? row[1] ?? new Date().toISOString(),
        players: parsePlayersJson(row[3]),
        started: true,
        status: "completed" as const,
      }));

    return withWeeklyPrizePreview({
      ...EMPTY_CORE,
      players,
      activePoolComp,
      historicalMatches,
    });
  }

  async function saveState(appState: SharedAppState): Promise<void> {
    await ensureWorksheets();

    const now = new Date().toISOString();
    const playerRows = appState.players.map((name) => {
      const createdAt = playerMetadata.get(name)?.createdAt ?? now;
      playerMetadata.set(name, { createdAt });
      return [name, createdAt, now, "true"];
    });

    const activeRows = appState.activePoolComp
      ? [
          [
            appState.activePoolComp.id,
            appState.activePoolComp.createdAt,
            String(appState.activePoolComp.started),
            JSON.stringify(appState.activePoolComp.players),
          ],
        ]
      : [];

    const historyRows = appState.historicalMatches.map((comp) => [
      comp.id,
      comp.createdAt,
      comp.completedAt ?? comp.createdAt,
      JSON.stringify(comp.players),
      comp.status ?? "completed",
    ]);

    await Promise.all([
      replaceRows(PLAYERS_SHEET, playerRows),
      replaceRows(ACTIVE_COMP_SHEET, activeRows),
      replaceRows(COMP_HISTORY_SHEET, historyRows),
    ]);
  }

  return { loadState, saveState };
}
