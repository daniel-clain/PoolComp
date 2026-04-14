import type { MutableRefObject } from "react";
import { poolCompConfig, type Player, type RegisteredPlayer, type Slot } from "../../../shared/domain";
import type { MessageToBackend } from "../../../shared/messageToBackend";

export type SlotPlayerChoice = {
  playerId: string;
  playerName: string;
};

export function canSelectWinnerForSlot(
  slotId: string,
  slots: Slot[],
): boolean {
  const slot = slots.find((candidate) => candidate.id === slotId);
  if (!slot || slot.kind !== "empty") return false;

  const slotNumber = parseInt(slotId.slice(1));
  const leftChild = slots.find((candidate) => candidate.id === `s${slotNumber * 2}`);
  const rightChild = slots.find((candidate) => candidate.id === `s${slotNumber * 2 + 1}`);
  if (!leftChild || !rightChild) return false;

  return leftChild.kind === "player" && rightChild.kind === "player";
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
    if (child?.kind === "player") {
      const player = players.find((candidate) => candidate.id === child.playerId);
      if (player) {
        choices.push({ playerId: player.id, playerName: player.name });
      }
    }
  }
  return choices;
}

export function countPlayersInComp(slots: Slot[]): number {
  const uniquePlayerIds = new Set(
    slots.filter((slot): slot is Extract<typeof slot, { kind: "player" }> => slot.kind === "player")
      .map((slot) => slot.playerId),
  );
  return uniquePlayerIds.size;
}

export function getFinalistPlayerIds(slots: Slot[]): { firstPlaceId: string | null; secondPlaceId: string | null } {
  const root = slots.find((slot) => slot.id === "s1");
  if (!root || root.kind !== "player") return { firstPlaceId: null, secondPlaceId: null };

  const firstPlaceId = root.playerId;
  const leftChild = slots.find((slot) => slot.id === "s2");
  const rightChild = slots.find((slot) => slot.id === "s3");

  let secondPlaceId: string | null = null;
  if (leftChild?.kind === "player" && leftChild.playerId !== firstPlaceId) {
    secondPlaceId = leftChild.playerId;
  } else if (rightChild?.kind === "player" && rightChild.playerId !== firstPlaceId) {
    secondPlaceId = rightChild.playerId;
  }

  return { firstPlaceId, secondPlaceId };
}

export function calculatePrizeMoneyFromPlayerCount(playerCount: number): number {
  return (playerCount * poolCompConfig.buyIn) / poolCompConfig.bigCompContribution + poolCompConfig.barInput;
}

export function createPoolCompService(
  sendMessageToBackendRef: MutableRefObject<((message: MessageToBackend) => void) | null>,
) {
  function send(message: MessageToBackend) {
    sendMessageToBackendRef.current?.(message);
  }

  function calculateFirstPrizeMoney(registeredPlayers: RegisteredPlayer[]) {
    return (
      (registeredPlayers.length * poolCompConfig.buyIn) /
        poolCompConfig.bigCompContribution +
      poolCompConfig.barInput
    );
  }

  const messagesToBackend = {
    createPoolComp: () => {
      send({ message: "createPoolComp" });
    },
    cancelActivePoolComp: () => {
      send({ message: "cancelActivePoolComp" });
    },
    startActivePoolComp: () => {
      send({ message: "startActivePoolComp" });
    },
    completeActivePoolComp: () => {
      send({ message: "completeActivePoolComp" });
    },
    togglePlayerInActivePoolComp: (playerId: string) => {
      send({ message: "togglePlayerInActivePoolComp", data: { playerId } });
    },
    addPlayer: (name: string) => {
      send({ message: "addPlayer", data: { name } });
    },
    updatePlayer: (playerId: string, name: string) => {
      send({ message: "updatePlayer", data: { playerId, name } });
    },
    deactivatePlayer: (playerId: string) => {
      send({ message: "deactivatePlayer", data: { playerId } });
    },
    activatePlayer: (playerId: string) => {
      send({ message: "activatePlayer", data: { playerId } });
    },
    assignWinnerToBracketSlot: (parentSlotId: string, winningPlayerId: string) => {
      send({ message: "assignWinnerToBracketSlot", data: { parentSlotId, winningPlayerId } });
    },
  };

  return {
    ...messagesToBackend,
    calculateFirstPrizeMoney,
  };
}
