import type { PoolCompConfig } from "./poolCompConfig.js";

export type Player = {
  id: string;
  name: string;
  deactivated: boolean;
};

export type PoolComp = {
  id: string;
  date: Date;
  slots: Slot[];
  registeredPlayers: RegisteredPlayer[];
};


export type RegisteredPlayer = {
  playerId: string;
  paid: boolean;
};
export type Slot = { id: number; isBye?: boolean; playerId?: string };
export type Matchup = { slot1: Slot; slot2: Slot };

export type BackendState = {
  activePoolComp: PoolComp | null;
  compHistory: PoolComp[];
  players: Player[];
  autoAssignPlayers: boolean;
  poolCompConfig: PoolCompConfig;
};


