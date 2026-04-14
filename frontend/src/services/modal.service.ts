export type ModalState =
  | null
  | { kind: "selectRegisteredPlayers" }
  | { kind: "updatePlayer"; playerId: string };
