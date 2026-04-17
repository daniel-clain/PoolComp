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
export type Slot =
  | { id: string; kind: "empty" }
  | { id: string; kind: "bye" }
  | { id: string; kind: "player"; playerId: string };

export type AllData = {
  activePoolComp: ActivePoolComp | null;
  compHistory: PoolComp[];
  players: Player[];
  poolCompConfig: PoolCompConfig;
};

export const poolCompConfig = {
  buyIn: 10,
  barInput: 50,
  xmasCut: 20,
  bigComp: {
    weeklyContributionPercentage: 0.5,
    mainCompPercentage: 0.7,
    mainCompFirstPlacePercentage: 0.7,
  },
};
export type PoolCompConfig = typeof poolCompConfig;
