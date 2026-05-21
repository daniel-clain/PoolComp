import orderBy from "lodash/orderBy";
import type { RefObject } from "react";
import {
  type Player,
  type PoolComp,
  type RegisteredPlayer,
  type Slot,
} from "../../../shared/domain";

import type { MessageToBackend } from "../../../shared/messageToBackend";
import { poolCompConfig } from "../../../shared/poolCompConfig";
import { getFirstRoundSlotsFromAllTournamentSlots, getSlotSourceMatchup, tournamentHasHadAssignment } from "../../../shared/tournament-slot.service";

export function canSetSlot(slot: Slot, slots: Slot[]): boolean {

  const sourceMatchup = getSlotSourceMatchup(slot, slots)

  return !sourceMatchup || (Boolean(sourceMatchup?.slot1.playerId) && Boolean(sourceMatchup?.slot2.playerId));
}

export type PlayerChoice = {
  player: Player;
  isUnassigned?: boolean;
}

export function getPlayerChoicesForSlot(
  selectedSlot: Slot,
  slots: Slot[],
  registeredPlayers: RegisteredPlayer[],
  players: Player[],
): PlayerChoice[] {
  const sourceMatchup = getSlotSourceMatchup(selectedSlot, slots)
  if (sourceMatchup) {
    const { slot1, slot2 } = sourceMatchup
    return registeredPlayers.reduce((acc, { playerId }) => {
      if (playerId === slot1.playerId || playerId === slot2.playerId) {
        acc.push({ player: players.find((player) => player.id === playerId)! })
      }
      return acc
    }, [] as PlayerChoice[])
  }
  const { unassignedPlayers, assignedPlayers } = registeredPlayers.reduce((acc, { playerId }) => {
    const player = players.find((player) => player.id === playerId)!
    if (slots.some(slot => slot.playerId === playerId)) {
      acc.assignedPlayers.push({ player })
    } else {
      acc.unassignedPlayers.push({ player, isUnassigned: true })
    }
    return acc
  }, { unassignedPlayers: [] as PlayerChoice[], assignedPlayers: [] as PlayerChoice[] })

  return [
    ...orderBy(unassignedPlayers, 'player.name'),
    ...orderBy(assignedPlayers, 'player.name')]
}


export function activePoolCompHasChampionPlayer(slots: Slot[]): boolean {
  if (!slots.length) return false
  const [firstPlaceSlot] = slots
  return Boolean(firstPlaceSlot.playerId)
}

export function getFinalists(comp: PoolComp, players: Player[]): {
  firstPlace: Player;
  secondPlace: Player;
} {
  const [firstPlaceSlot, finalistSlot1, finalistSlot2] = comp.slots

  const secondPlaceSlot = firstPlaceSlot.playerId === finalistSlot1.playerId ? finalistSlot2 : finalistSlot1

  const firstPlace = players.find((player) => player.id === firstPlaceSlot.playerId)!
  const secondPlace = players.find((player) => player.id === secondPlaceSlot.playerId)!

  return { firstPlace, secondPlace };
}


export function createPoolCompService(
  sendMessageToBackendRef: RefObject<
    ((message: MessageToBackend) => void) | null
  >,
) {

  function send(message: MessageToBackend) {
    sendMessageToBackendRef.current?.(message);
  }

  return {
    send,
  };
}

export function canAddMorePlayers(tournamentSlots: Slot[]): boolean {
  if (!tournamentHasHadAssignment(tournamentSlots)) {
    return true
  }
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  const currentPlayerIds = new Set(
    firstRoundSlots
      .map((slot) => slot.playerId)
      .filter((playerId): playerId is string => Boolean(playerId)),
  )

  if (currentPlayerIds.size === 0) {
    return true
  }

  const playersWithResolvedPlayerVersusPlayerMatchup = new Set<string>()

  for (const slot of tournamentSlots) {
    const sourceMatchup = getSlotSourceMatchup(slot, tournamentSlots)
    if (!sourceMatchup) {
      continue
    }

    if (!slot.playerId) {
      continue
    }

    const firstPlayerId = sourceMatchup.slot1.playerId
    const secondPlayerId = sourceMatchup.slot2.playerId
    if (!firstPlayerId || !secondPlayerId) {
      continue
    }

    playersWithResolvedPlayerVersusPlayerMatchup.add(firstPlayerId)
    playersWithResolvedPlayerVersusPlayerMatchup.add(secondPlayerId)
  }

  const everyCurrentPlayerHasResolvedPlayerVersusPlayerMatchup = Array.from(
    currentPlayerIds,
  ).every((playerId) =>
    playersWithResolvedPlayerVersusPlayerMatchup.has(playerId),
  )

  return !everyCurrentPlayerHasResolvedPlayerVersusPlayerMatchup
}


export function calculateFirstPrizeMoney(registeredPlayers: RegisteredPlayer[]) {
  return (
    (registeredPlayers.length * poolCompConfig.buyIn) *
    (1 - poolCompConfig.bigComp.contributionPercentage) +
    poolCompConfig.barInput
  );
}

export function calculateBigCompMoney(registeredPlayers: RegisteredPlayer[]) {
  return (
    (registeredPlayers.length * poolCompConfig.buyIn) *
    poolCompConfig.bigComp.contributionPercentage -
    poolCompConfig.xmasCut
  );
}