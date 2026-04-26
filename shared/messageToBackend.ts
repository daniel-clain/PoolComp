import type { AllData } from "./domain.js";
import type { MessagesFromFrontend } from "../backend/src/messages-from-frontend/messages-from-frontend.js";
import type { BackendService } from "../backend/src/services/backend.service.js";





export type MessageName = keyof MessagesFromFrontend

export type MessageData<T> =
  T extends (backendService: BackendService, data: infer Data) => any
  ? Data
  : never

export type MessageToBackend = {
  [K in MessageName]: {
    message: K
    data: MessageData<MessagesFromFrontend[K]>
  }
}[MessageName]






export type BackendApi = {
  createPoolComp: null;
  cancelActivePoolComp: null;
  assignMatchups: null;
  completeActivePoolComp: null;
  addPlayerToComp: { playerId: string };
  removePlayerFromComp: { playerId: string };
  setRegisteredPlayerPaid: { playerId: string };
  unsetRegisteredPlayerPaid: { playerId: string };
  addPlayer: { name: string };
  updatePlayer: { playerId: string; name: string };
  deactivatePlayer: { playerId: string };
  activatePlayer: { playerId: string };
  manualAssignPlayerToSlot: { slotId: string; playerId: string };
};
