
import type { MessagesFromFrontend } from "../backend/src/messages-from-frontend/messages-from-frontend.js";
import type { BackendService } from "../backend/src/services/backend.service.js";

export type MessageHandlerData<T> =
  T extends (backendService: BackendService, data: infer Data) => any
  ? Data
  : never

export type MessageFromFrontendName = keyof MessagesFromFrontend

export type MessageFromFrontendData<T> =
  T extends (backendService: BackendService, data: infer Data) => any
  ? Data
  : never

export type MessageToBackend = {
  [FuncName in MessageFromFrontendName]:
  Parameters<MessagesFromFrontend[FuncName]> extends [BackendService, infer Data]
  ? [FuncName, Data]
  : [FuncName]
}[MessageFromFrontendName]





/*  createPoolComp: null;
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
 manualAssignPlayerToSlot: { slotId: string; playerId: string }; */
