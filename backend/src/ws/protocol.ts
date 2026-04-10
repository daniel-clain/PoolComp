import type { SharedAppState } from "../domain/types.js";

export type ClientCommand =
  | { type: "createPoolComp" }
  | { type: "cancelActivePoolComp" }
  | { type: "startActivePoolComp" }
  | { type: "completeActivePoolComp" }
  | { type: "togglePlayerInActivePoolComp"; name: string }
  | { type: "addPlayer"; name: string }
  | { type: "removePlayer"; name: string };

export type ClientMessage = {
  type: "command";
  requestId: string;
  command: ClientCommand;
};

export type ServerMessage =
  | { type: "stateSnapshot"; state: SharedAppState }
  | { type: "stateUpdated"; state: SharedAppState; requestId?: string }
  | { type: "commandRejected"; requestId?: string; reason: string }
  | { type: "serverError"; message: string };

export function parseClientMessage(raw: string): ClientMessage {
  const parsed = JSON.parse(raw) as Partial<ClientMessage>;

  if (parsed.type !== "command" || typeof parsed.requestId !== "string" || !parsed.command) {
    throw new Error("Invalid client message");
  }

  return parsed as ClientMessage;
}