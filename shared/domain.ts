import type { PoolCompConfig } from "./poolCompConfig.js";

export type Player = {
  id: string;
  name: string;
  deactivated: boolean;
};

export type RegisteredPlayer_D = {
  playerId: string;
  paid: boolean;
};

export type RegisteredPlayer = Player & {
  paid: boolean;
};

export type PoolComp = {
  id: string;
  date: Date;
  slots: Slot[];
  registeredPlayers: RegisteredPlayer[];
  secondChanceSlots?: Slot[];
};
export type PoolComp_D = {
  id: string;
  date: Date;
  slots: Slot_D[];
  registeredPlayers: RegisteredPlayer_D[];
  secondChanceSlots?: Slot_D[];
};

export type Slot = { id: number; isBye?: boolean; player?: RegisteredPlayer };
export type Slot_D = { id: number; isBye?: boolean; playerId?: string };
export type Matchup = { slot1: Slot; slot2: Slot };

export type LeaderboardEntry = {
  player: Player;
  wins: number;
  totalMoneyMade: number;
};
export type BackendState = {
  leaderboard: LeaderboardEntry[];
  activePoolComp: PoolComp_D | null;
  compHistory: PoolComp_D[];
  players: Player[];
  autoAssignPlayers: boolean;
  poolCompConfig: PoolCompConfig;
};


export type FrontendState = {
  leaderboard: LeaderboardEntry[];
  activePoolComp: PoolComp | null;
  compHistory: PoolComp[];
  players: Player[];
  autoAssignPlayers: boolean;
};
