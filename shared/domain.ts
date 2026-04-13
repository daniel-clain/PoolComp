export type Player = {
  id: string;
  name: string;
};

export type PoolComp = {
  id: string;
  date: Date;
  slots: Slot[];
};

export type ActivePoolComp = PoolComp & {
  registerdPlayers: RegisteredPlayer[];
  started: boolean;
};

export type RegisteredPlayer = Player & {
  paid: boolean;
};
export type Slot = {
  id: string;
  playerId: string | null;
};

export type PoolCompConfig = {
  buyIn: number;
  barInput: number;
  xmasCut: number;
  bigCompContribution: number;
};

export type AllData = {
  activePoolComp: ActivePoolComp | null;
  compHistory: PoolComp[];
  players: Player[];
  poolCompConfig: PoolCompConfig;
};

export const poolCompConfig: PoolCompConfig = {
  buyIn: 10,
  barInput: 50,
  xmasCut: 20,
  bigCompContribution: 0.5,
};
