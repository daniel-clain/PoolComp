import type { RefObject } from "react";
import {
  poolCompConfig,
  type Player,
  type RegisteredPlayer,
  type Slot,
} from "../../../shared/domain";

import type { MessageToBackend } from "../../../shared/messageToBackend";


export type SlotPlayerChoice = {
  playerId: string;
  playerName: string;
};


export function canSelectWinnerForSlot(slotId: string, slots: Slot[]): boolean {
  const slot = slots.find((candidate) => candidate.id === slotId);
  if (!slot || slot.playerId === undefined) return false;

  const slotNumber = parseInt(slotId.slice(1));
  const leftChild = slots.find(
    (candidate) => candidate.id === `s${slotNumber * 2}`,
  );
  const rightChild = slots.find(
    (candidate) => candidate.id === `s${slotNumber * 2 + 1}`,
  );
  if (!leftChild || !rightChild) return false;

  return leftChild.playerId !== undefined && rightChild.playerId !== undefined;
}

export function getPlayerChoicesForSlot(
  parentSlotId: string,
  slots: Slot[],
  players: Player[],
): SlotPlayerChoice[] {
  const parentSlotNumber = parseInt(parentSlotId.slice(1));
  const leftChildId = `s${parentSlotNumber * 2}`;
  const rightChildId = `s${parentSlotNumber * 2 + 1}`;
  const leftChild = slots.find((slot) => slot.id === leftChildId);
  const rightChild = slots.find((slot) => slot.id === rightChildId);

  const choices: SlotPlayerChoice[] = [];
  for (const child of [leftChild, rightChild]) {
    if (child?.playerId !== undefined) {
      const player = players.find(
        (candidate) => candidate.id === child.playerId,
      );
      if (player) {
        choices.push({ playerId: player.id, playerName: player.name });
      }
    }
  }
  return choices;
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
  const rootSlot = slots.find((candidate) => candidate.id === "s1");
  return rootSlot?.playerId !== undefined;
}

export function getFinalistPlayerIds(slots: Slot[]): {
  firstPlaceId: string | null;
  secondPlaceId: string | null;
} {
  const root = slots.find((slot) => slot.id === "s1");
  if (!root || root.playerId === undefined)
    return { firstPlaceId: null, secondPlaceId: null };

  const firstPlaceId = root.playerId;
  const leftChild = slots.find((slot) => slot.id === "s2");
  const rightChild = slots.find((slot) => slot.id === "s3");

  let secondPlaceId: string | null = null;
  if (leftChild?.playerId !== undefined && leftChild.playerId !== firstPlaceId) {
    secondPlaceId = leftChild.playerId;
  } else if (
    rightChild?.playerId !== undefined &&
    rightChild.playerId !== firstPlaceId
  ) {
    secondPlaceId = rightChild.playerId;
  }

  return { firstPlaceId, secondPlaceId };
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
