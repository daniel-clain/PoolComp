import type { RefObject } from "react";
import {
  type Player,
  type RegisteredPlayer,
  type Slot,
} from "../../../shared/domain";

import type { MessageToBackend } from "../../../shared/messageToBackend";
import { poolCompConfig } from "../../../shared/poolCompConfig";
import { getSlotSourceMatchup } from "../../../shared/tournament-slot.service";

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
    poolCompConfig.bigComp.weeklyContributionPercentage +
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


  function calculateFirstPrizeMoney(registeredPlayers: RegisteredPlayer[]) {
    return (
      (registeredPlayers.length * poolCompConfig.buyIn) /
      poolCompConfig.bigComp.weeklyContributionPercentage +
      poolCompConfig.barInput
    );
  }


  return {
    send,
    calculateFirstPrizeMoney,
  };
}
export function tournamentHasStarted(tournamentSlots: Slot[]): boolean {
  if (tournamentSlots.length === 0) {
    return false;
  }
  const firstRoundWidth = (tournamentSlots.length + 1) / 2;
  const firstRoundStart = tournamentSlots.length - firstRoundWidth;
  for (let i = 0; i < firstRoundWidth; i = i + 2) {
    const left = tournamentSlots[firstRoundStart + i]!;
    const right = tournamentSlots[firstRoundStart + i + 1]!;
    if (left.playerId && right.playerId) {
      const leftIndex = firstRoundStart + i;
      const parentIndex = Math.floor((leftIndex - 1) / 2);
      if (tournamentSlots[parentIndex]!.playerId) {
        return true;
      }
    }
  }
  return false;
}
