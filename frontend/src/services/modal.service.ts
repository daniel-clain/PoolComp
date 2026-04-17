export type ModalState =
  | null
  | { kind: "updatePlayer"; playerId: string };
