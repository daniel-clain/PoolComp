export type MessageToBackend =
  | { message: "createPoolComp" }
  | { message: "cancelActivePoolComp" }
  | { message: "startActivePoolComp" }
  | { message: "completeActivePoolComp" }
  | { message: "togglePlayerInActivePoolComp"; data: { playerId: string } }
  | { message: "addPlayer"; data: { name: string } }
  | { message: "removePlayer"; data: { playerId: string } }
  | { message: "updatePlayer"; data: { playerId: string; name: string } };
