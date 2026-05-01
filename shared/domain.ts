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
};

export type ActivePoolComp = PoolComp & {
  registeredPlayers: RegisteredPlayer[];
};

export type RegisteredPlayer = Player & {
  paid: boolean;
};
export type Slot = { id: number; isBye?: boolean; playerId?: string };
export type Matchup = { slot1: Slot; slot2: Slot };

export type AllData = {
  activePoolComp: ActivePoolComp | null;
  compHistory: PoolComp[];
  players: Player[];
  poolCompConfig: PoolCompConfig;
};


