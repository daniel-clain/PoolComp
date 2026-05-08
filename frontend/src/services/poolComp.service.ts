import type { RefObject } from "react";
import {
  type Player,
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

export function getPlayerChoicesForSlot(
  selectedSlot: Slot,
  slots: Slot[],
  registeredPlayers: Player[],
): Player[] {
  const sourceMatchup = getSlotSourceMatchup(selectedSlot, slots)
  if (!sourceMatchup) return registeredPlayers;

  return [sourceMatchup.slot1.playerId, sourceMatchup.slot2.playerId]
    .map((playerId) =>
      registeredPlayers.find((registeredPlayer) => registeredPlayer.id === playerId),
    )
    .filter((player): player is Player => Boolean(player));
}

export function countPlayersInComp(slots: Slot[]): number {
  const uniquePlayerIds = new Set(
    slots
      .filter(
        (slot): slot is Extract<typeof slot, { playerId: string }> =>
          slot.playerId !== undefined,
      )
      .map((slot: Slot) => slot.playerId),
  );
  return uniquePlayerIds.size;
}

export function activePoolCompHasChampionPlayer(slots: Slot[]): boolean {
  if (!slots.length) return false
  const [firstPlaceSlot] = slots
  return Boolean(firstPlaceSlot.playerId)
}

export function getFinalistPlayerIds(slots: Slot[]): {
  firstPlaceId: string;
  secondPlaceId: string;
} {
  const [firstPlaceSlot, finalistSlot1, finalistSlot2] = slots

  const secondPlaceSlot = firstPlaceSlot.playerId === finalistSlot1.playerId ? finalistSlot2 : finalistSlot1

  return { firstPlaceId: firstPlaceSlot.playerId!, secondPlaceId: secondPlaceSlot.playerId! };
}

export function calculatePrizeMoneyFromPlayerCount(
  playerCount: number,
): number {
  return (
    (playerCount * poolCompConfig.buyIn) /
    poolCompConfig.bigComp.contributionPercentage +
    poolCompConfig.barInput
  );
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