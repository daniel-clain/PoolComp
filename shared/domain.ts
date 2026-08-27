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
  date: string;
  slots: Slot[];
  registeredPlayers: Array<RegisteredPlayer | null>;
  secondChanceSlots?: Slot[];
};
export type PoolComp_D = {
  id: string;
  date: string;
  slots: Slot_D[];
  registeredPlayers: Array<RegisteredPlayer_D | null>;
  secondChanceSlots?: Slot_D[];
};

export type Slot = { id: number; isBye?: boolean; player?: RegisteredPlayer };
export type Slot_D = { id: number; isBye?: boolean; playerId?: string };
export type Matchup = { slot1: Slot; slot2: Slot };

export type BackendError = {
  text: string;
  timestamp: string;
};

export type BackendState = {
  activePoolComp: PoolComp_D | null | undefined;
  compHistory: PoolComp_D[];
  players: Player[];
  autoAssignPlayers: boolean;
  poolCompConfig: PoolCompConfig;
  backendErrors: BackendError[];
};


export type FrontendState = {
  activePoolComp: PoolComp | null | undefined;
  compHistory: PoolComp[];
  players: Player[];
  autoAssignPlayers: boolean;
  backendErrors: BackendError[];
};
