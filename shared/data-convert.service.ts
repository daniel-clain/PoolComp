import type { BackendState, PoolComp, PoolComp_D, RegisteredPlayer, RegisteredPlayer_D, Slot, Slot_D } from "./domain";

export function convertToRegisteredPlayerData(registeredPlayer: RegisteredPlayer): RegisteredPlayer_D {
  const { id, ...restOfRegisteredPlayer } = registeredPlayer;
  return {
    ...restOfRegisteredPlayer,
    playerId: id
  }
}

export function convertToSlotData(slot: Slot): Slot_D {
  const { player, ...restOfSlot } = slot;
  return {
    ...restOfSlot,
    ...player ? { playerId: player.id } : {},
  }
}

export function convertToPoolCompData(poolComp: PoolComp): PoolComp_D {
  const { registeredPlayers, slots, secondChanceSlots, ...restOfPoolComp } = poolComp;
  return {
    ...restOfPoolComp,
    registeredPlayers: registeredPlayers.map(convertToRegisteredPlayerData),
    slots: slots.map(convertToSlotData),
    ...secondChanceSlots ? { secondChanceSlots: secondChanceSlots.map(convertToSlotData) } : {}
  }
}

export function convertToPoolComp(poolCompData: PoolComp_D, backendState: BackendState): PoolComp {
  if (!poolCompData.registeredPlayers || !poolCompData.slots) {
    throw "Pool comp data is invalid";
  }

  const { registeredPlayers, slots, secondChanceSlots, ...restOfPoolComp } = poolCompData;

  const convertedRegisteredPlayers = registeredPlayers.map(registeredPlayerData => convertToRegisteredPlayer(registeredPlayerData, backendState));


  const convertedSlots = slots.map(slotData => convertToSlot(slotData, convertedRegisteredPlayers));


  const convertedSecondChanceSlots = secondChanceSlots ? secondChanceSlots.map(slotData => convertToSlot(slotData, convertedRegisteredPlayers)) : undefined;


  return {
    ...restOfPoolComp,
    registeredPlayers: convertedRegisteredPlayers,
    slots: convertedSlots,
    ...secondChanceSlots ? { secondChanceSlots: convertedSecondChanceSlots } : {}
  }
}

export function convertToRegisteredPlayer(registeredPlayerData: RegisteredPlayer_D, backendState: BackendState): RegisteredPlayer {
  if (!registeredPlayerData.playerId) {
    console.log("Registered player data is invalid", registeredPlayerData);
  }
  const { playerId, ...restOfRegisteredPlayer } = registeredPlayerData;
  const player = backendState.players.find(player => player.id === playerId);
  if (!player) throw `Player not found: ${playerId}`
  return {
    ...player,
    ...restOfRegisteredPlayer
  }
}

export function convertToSlot(slotData: Slot_D, registeredPlayers: RegisteredPlayer[]): Slot {
  const { playerId, ...restOfSlot } = slotData;
  const player = registeredPlayers.find(player => player.id === playerId);
  return {
    ...restOfSlot,
    ...player ? { player } : {}
  }
}
