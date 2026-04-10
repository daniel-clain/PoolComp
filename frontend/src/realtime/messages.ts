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

export type SharedAppState = {
  activePoolComp: PoolComp | null;
  historicalMatches: PoolComp[];
  players: string[];
  weeklyPrizePreview: WeeklyPrizePreview | null;
};

export const EMPTY_SHARED_STATE: SharedAppState = {
  activePoolComp: null,
  historicalMatches: [],
  players: [],
  weeklyPrizePreview: null,
};

export type MessageToServer =
  | { type: "createPoolComp" }
  | { type: "cancelActivePoolComp" }
  | { type: "startActivePoolComp" }
  | { type: "completeActivePoolComp" }
  | { type: "togglePlayerInActivePoolComp"; name: string }
  | { type: "addPlayer"; name: string }
  | { type: "removePlayer"; name: string };

export type ClientMessage = {
  requestId: string;
  message: MessageToServer;
};

export type ServerMessage =
  | { type: "stateSnapshot"; state: SharedAppState }
  | { type: "stateUpdated"; state: SharedAppState; requestId?: string }
  | { type: "commandRejected"; requestId?: string; reason: string }
  | { type: "serverError"; message: string };
