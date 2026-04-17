import type { AllData } from "./domain.js";

export type BackendApi = {
  createPoolComp: null;
  cancelActivePoolComp: null;
  createMatchups: null;
  completeActivePoolComp: null;
  togglePlayerInActivePoolComp: { playerId: string };
  toggleRegisteredPlayerPaid: { playerId: string };
  addPlayer: { name: string };
  updatePlayer: { playerId: string; name: string };
  deactivatePlayer: { playerId: string };
  activatePlayer: { playerId: string };
  assignWinnerToBracketSlot: { parentSlotId: string; winningPlayerId: string };
};

export type MessageName = keyof BackendApi;

export type MessageToBackend = {
  [K in MessageName]: BackendApi[K] extends null
    ? { message: K }
    : { message: K; data: BackendApi[K] };
}[MessageName];

export type ClientEnvelope = MessageToBackend & { requestId: string };

export type ServerMessage =
  | { message: "stateSnapshot"; data: AllData }
  | {
      message: "asyncPending";
      data: { requestId: string; action: MessageName };
    }
  | { message: "actionSettled"; data: ActionSettledData }
  | { message: "databaseUnavailable" };

export type ActionSettledData =
  | { requestId: string; ok: true; state: AllData }
  | { requestId: string; ok: false; reason: string };
