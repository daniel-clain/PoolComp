export type PoolComp = {
  id: string;
  createdAt: string;
  players: string[];
  started: boolean;
  completedAt?: string;
  status?: "completed";
};

export type WeeklyPrizePreview = {
  entrantCount: number;
  buyIn: number;
  barInput: number;
  xmasCut: number;
  firstPrize: number;
  bigCompContribution: number;
  christmasFundContribution: number;
};

export type SharedAppStateCore = {
  activePoolComp: PoolComp | null;
  historicalMatches: PoolComp[];
  players: string[];
};

export type SharedAppState = SharedAppStateCore & {
  weeklyPrizePreview: WeeklyPrizePreview | null;
};

export const EMPTY_CORE: SharedAppStateCore = {
  activePoolComp: null,
  historicalMatches: [],
  players: [],
};

export function toSharedAppStateCore(state: SharedAppState): SharedAppStateCore {
  const { weeklyPrizePreview: _preview, ...core } = state;
  return core;
}
