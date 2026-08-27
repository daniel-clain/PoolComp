import type { BackendState, PoolComp, PoolComp_D, RegisteredPlayer, RegisteredPlayer_D, Slot, Slot_D } from "./domain.js";

export function convertToRegisteredPlayerData(registeredPlayer: RegisteredPlayer): RegisteredPlayer_D {
  return {
    playerId: registeredPlayer.id,
    paid: registeredPlayer.paid,
  }
}

export function convertToSlotData(slot: Slot): Slot_D {
  return {
    id: slot.id,
    ...(slot.isBye ? { isBye: true } : {}),
    ...(slot.player ? { playerId: slot.player.id } : {}),
  }
}

export function convertToPoolCompData(poolComp: PoolComp): PoolComp_D {
  return {
    id: poolComp.id,
    date: poolComp.date,
    registeredPlayers: poolComp.registeredPlayers.map((registeredPlayer) =>
      registeredPlayer
        ? convertToRegisteredPlayerData(registeredPlayer)
        : null
    ),
    slots: poolComp.slots.map(convertToSlotData),
    ...(poolComp.secondChanceSlots
      ? { secondChanceSlots: poolComp.secondChanceSlots.map(convertToSlotData) }
      : {}),
  }
}

export function convertToPoolComp(poolCompData: PoolComp_D, backendState: BackendState): PoolComp {
  if (!poolCompData.registeredPlayers || !poolCompData.slots) {
    throw "Pool comp data is invalid";
  }

  const convertedRegisteredPlayers = poolCompData.registeredPlayers.map((registeredPlayerData) =>
    registeredPlayerData
      ? convertToRegisteredPlayer(registeredPlayerData, backendState)
      : null,
  );

  const convertedSlots = poolCompData.slots.map((slotData) =>
    convertToSlot(slotData, convertedRegisteredPlayers),
  );

  const convertedSecondChanceSlots = poolCompData.secondChanceSlots
    ? poolCompData.secondChanceSlots.map((slotData) =>
      convertToSlot(slotData, convertedRegisteredPlayers),
    )
    : undefined;

  return {
    id: poolCompData.id,
    date: poolCompData.date,
    registeredPlayers: convertedRegisteredPlayers,
    slots: convertedSlots,
    ...(convertedSecondChanceSlots
      ? { secondChanceSlots: convertedSecondChanceSlots }
      : {}),
  }
}

export function convertToRegisteredPlayer(
  registeredPlayerData: RegisteredPlayer_D,
  backendState: BackendState,
): RegisteredPlayer {
  const player = backendState.players.find((player) => player.id === registeredPlayerData.playerId);
  if (!player) throw `Player not found: ${registeredPlayerData.playerId}`
  return {
    ...player,
    paid: registeredPlayerData.paid,
  }
}

export function convertToSlot(
  slotData: Slot_D,
  registeredPlayers: Array<RegisteredPlayer | null>,
): Slot {
  const player = registeredPlayers.find(
    (registeredPlayer) => registeredPlayer?.id === slotData.playerId,
  );
  return {
    id: slotData.id,
    ...(slotData.isBye ? { isBye: true } : {}),
    ...(player ? { player } : {}),
  }
}
