import type {
  PoolComp,
  PoolComp_D,
  RegisteredPlayer,
} from "./domain.js";

export function poolCompHasUnknownRegisteredPlayers(
  poolComp:
    | Pick<PoolComp, "registeredPlayers">
    | Pick<PoolComp_D, "registeredPlayers">,
): boolean {
  return poolComp.registeredPlayers.some(
    (registeredPlayer) => registeredPlayer === null,
  );
}

export function getKnownRegisteredPlayers(
  poolComp: Pick<PoolComp, "registeredPlayers">,
): RegisteredPlayer[] {
  return poolComp.registeredPlayers.filter(
    (registeredPlayer): registeredPlayer is RegisteredPlayer =>
      registeredPlayer !== null,
  );
}
