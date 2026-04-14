import { randomBytes, randomUUID } from "node:crypto";
import type { AllData, Player, Slot } from "../../../shared/domain.js";
import type { MessageName } from "../../../shared/messageToBackend.js";

type ActionHandler = (state: AllData, data: any) => AllData;

function domainError(message: string): Error {
  return new Error(message);
}

function computeFirstRoundSize(playerCount: number): number {
  if (playerCount > 16) return 32;
  if (playerCount > 8) return 16;
  return 8;
}

function generateSlots(playerIds: string[]): Slot[] {
  const firstRoundSize = computeFirstRoundSize(playerIds.length);
  const totalSlots = firstRoundSize * 2 - 1;
  const slots: Slot[] = [];

  for (let i = 1; i <= totalSlots; i++) {
    const isLeaf = i >= firstRoundSize;
    const leafIndex = i - firstRoundSize;

    if (isLeaf && leafIndex < playerIds.length) {
      slots.push({ id: `s${i}`, kind: "player", playerId: playerIds[leafIndex]! });
    } else {
      slots.push({ id: `s${i}`, kind: "empty" });
    }
  }
  return slots;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = randomBytes(4).readUInt32BE(0) % (i + 1);
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex]!, shuffled[i]!];
  }
  return shuffled;
}

function computeFirstRoundPairCounts(
  playerCount: number,
  firstRoundSize: number,
): { playerPlayerPairs: number; playerByePairs: number; byeByePairs: number } {
  const totalPairs = firstRoundSize / 2;
  const playerPlayerPairs = Math.max(0, playerCount - totalPairs);
  const playerByePairs = playerCount - 2 * playerPlayerPairs;
  const byeByePairs = totalPairs - playerPlayerPairs - playerByePairs;
  return { playerPlayerPairs, playerByePairs, byeByePairs };
}

function distributeByeByePairIndices(
  byeByeCount: number,
  totalPairs: number,
): number[] {
  if (byeByeCount === 0) return [];
  const indices: number[] = [];
  for (let i = 0; i < byeByeCount; i++) {
    indices.push(Math.round(i * totalPairs / byeByeCount));
  }
  return indices;
}

function propagateByeAdvancement(
  slotMap: Map<number, Slot>,
  firstRoundSize: number,
): void {
  const totalRounds = Math.log2(firstRoundSize);
  for (let round = 1; round <= totalRounds; round++) {
    const firstSlotInRound = Math.pow(2, totalRounds - round);
    const slotsInRound = firstSlotInRound;

    for (let indexInRound = 0; indexInRound < slotsInRound; indexInRound++) {
      const slotNumber = firstSlotInRound + indexInRound;
      if (slotMap.has(slotNumber)) continue;

      const leftChild = slotMap.get(slotNumber * 2);
      const rightChild = slotMap.get(slotNumber * 2 + 1);

      const leftIsPlayer = leftChild?.kind === "player";
      const rightIsPlayer = rightChild?.kind === "player";
      const leftIsBye = leftChild?.kind === "bye";
      const rightIsBye = rightChild?.kind === "bye";

      if (leftIsPlayer && rightIsBye) {
        slotMap.set(slotNumber, { id: `s${slotNumber}`, kind: "player", playerId: leftChild.playerId });
      } else if (rightIsPlayer && leftIsBye) {
        slotMap.set(slotNumber, { id: `s${slotNumber}`, kind: "player", playerId: rightChild.playerId });
      }
    }
  }
}

function buildStartedSlots(playerIds: string[], firstRoundSize: number): Slot[] {
  const totalSlots = firstRoundSize * 2 - 1;
  const totalPairs = firstRoundSize / 2;
  const { playerPlayerPairs, playerByePairs, byeByePairs } =
    computeFirstRoundPairCounts(playerIds.length, firstRoundSize);

  const byeByeIndices = new Set(distributeByeByePairIndices(byeByePairs, totalPairs));

  const pairTypes: Array<"playerPlayer" | "playerBye" | "byeBye"> = [];
  let remainingPlayerBye = playerByePairs;

  for (let pairIndex = 0; pairIndex < totalPairs; pairIndex++) {
    if (byeByeIndices.has(pairIndex)) {
      pairTypes.push("byeBye");
    } else if (remainingPlayerBye > 0) {
      pairTypes.push("playerBye");
      remainingPlayerBye--;
    } else {
      pairTypes.push("playerPlayer");
    }
  }

  const shuffledPlayerIds = shuffleArray(playerIds);
  let playerCursor = 0;

  const slotMap = new Map<number, Slot>();

  for (let pairIndex = 0; pairIndex < totalPairs; pairIndex++) {
    const leftLeaf = firstRoundSize + pairIndex * 2;
    const rightLeaf = leftLeaf + 1;
    const pairType = pairTypes[pairIndex]!;

    switch (pairType) {
      case "playerPlayer":
        slotMap.set(leftLeaf, { id: `s${leftLeaf}`, kind: "player", playerId: shuffledPlayerIds[playerCursor]! });
        playerCursor++;
        slotMap.set(rightLeaf, { id: `s${rightLeaf}`, kind: "player", playerId: shuffledPlayerIds[playerCursor]! });
        playerCursor++;
        break;
      case "playerBye":
        slotMap.set(leftLeaf, { id: `s${leftLeaf}`, kind: "player", playerId: shuffledPlayerIds[playerCursor]! });
        playerCursor++;
        slotMap.set(rightLeaf, { id: `s${rightLeaf}`, kind: "bye" });
        break;
      case "byeBye":
        slotMap.set(leftLeaf, { id: `s${leftLeaf}`, kind: "bye" });
        slotMap.set(rightLeaf, { id: `s${rightLeaf}`, kind: "bye" });
        break;
    }
  }

  for (let pairIndex = 0; pairIndex < totalPairs; pairIndex++) {
    const leftLeaf = firstRoundSize + pairIndex * 2;
    const parentSlotNumber = Math.floor(leftLeaf / 2);
    const pairType = pairTypes[pairIndex]!;

    if (pairType === "playerBye") {
      const playerSlot = slotMap.get(leftLeaf)!;
      if (playerSlot.kind === "player") {
        slotMap.set(parentSlotNumber, { id: `s${parentSlotNumber}`, kind: "player", playerId: playerSlot.playerId });
      }
    } else if (pairType === "byeBye") {
      slotMap.set(parentSlotNumber, { id: `s${parentSlotNumber}`, kind: "bye" });
    }
  }

  propagateByeAdvancement(slotMap, firstRoundSize);

  const slots: Slot[] = [];
  for (let slotNumber = 1; slotNumber <= totalSlots; slotNumber++) {
    const slot = slotMap.get(slotNumber);
    if (slot) {
      slots.push(slot);
    } else {
      slots.push({ id: `s${slotNumber}`, kind: "empty" });
    }
  }

  return slots;
}

function applyAutomaticByeAdvances(slots: Slot[]): Slot[] {
  const slotMap = new Map(slots.map((slot) => [slot.id, slot]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const slot of slotMap.values()) {
      if (slot.kind !== "empty") continue;
      const slotNumber = parseInt(slot.id.slice(1));
      const leftChild = slotMap.get(`s${slotNumber * 2}`);
      const rightChild = slotMap.get(`s${slotNumber * 2 + 1}`);
      if (!leftChild || !rightChild) continue;

      if (leftChild.kind === "player" && rightChild.kind === "bye") {
        slotMap.set(slot.id, { id: slot.id, kind: "player", playerId: leftChild.playerId });
        changed = true;
      } else if (leftChild.kind === "bye" && rightChild.kind === "player") {
        slotMap.set(slot.id, { id: slot.id, kind: "player", playerId: rightChild.playerId });
        changed = true;
      } else if (leftChild.kind === "bye" && rightChild.kind === "bye") {
        slotMap.set(slot.id, { id: slot.id, kind: "bye" });
        changed = true;
      }
    }
  }
  return slots.map((slot) => slotMap.get(slot.id)!);
}

export function createPoolCompService(): Record<MessageName, ActionHandler> {
  return {
    createPoolComp(state) {
      if (state.activePoolComp)
        throw domainError("An active comp already exists.");
      return {
        ...state,
        activePoolComp: {
          id: randomUUID(),
          date: new Date(),
          slots: generateSlots([]),
          registeredPlayers: [],
          started: false,
        },
      };
    },

    cancelActivePoolComp(state) {
      if (!state.activePoolComp) throw domainError("No active comp to cancel.");
      return { ...state, activePoolComp: null };
    },

    startActivePoolComp(state) {
      if (!state.activePoolComp) throw domainError("No active comp to start.");
      if (state.activePoolComp.started)
        throw domainError("Comp already started.");
      if (state.activePoolComp.registeredPlayers.length < 5)
        throw domainError("Need at least 5 players to start.");

      const playerIds = state.activePoolComp.registeredPlayers.map(
        (registeredPlayer) => registeredPlayer.id,
      );
      const firstRoundSize = computeFirstRoundSize(playerIds.length);
      const slots = applyAutomaticByeAdvances(
        buildStartedSlots(playerIds, firstRoundSize),
      );

      return {
        ...state,
        activePoolComp: {
          ...state.activePoolComp,
          started: true,
          slots,
        },
      };
    },

    completeActivePoolComp(state) {
      if (!state.activePoolComp)
        throw domainError("No active comp to complete.");
      if (!state.activePoolComp.started)
        throw domainError("Comp must be started before completing.");

      const completed = {
        id: state.activePoolComp.id,
        date: state.activePoolComp.date,
        slots: state.activePoolComp.slots,
      };

      return {
        ...state,
        activePoolComp: null,
        compHistory: [completed, ...state.compHistory],
      };
    },

    togglePlayerInActivePoolComp(state, data: { playerId: string }) {
      if (!state.activePoolComp) throw domainError("No active comp.");
      if (state.activePoolComp.started)
        throw domainError("Cannot change players after comp starts.");

      const player = state.players.find((candidate) => candidate.id === data.playerId);
      if (!player) throw domainError("Player not found.");

      const alreadyRegistered = state.activePoolComp.registeredPlayers.some(
        (registeredPlayer) => registeredPlayer.id === data.playerId,
      );
      if (!alreadyRegistered && player.deactivated)
        throw domainError("Cannot register a deactivated player.");

      const registeredPlayers = alreadyRegistered
        ? state.activePoolComp.registeredPlayers.filter(
            (registeredPlayer) => registeredPlayer.id !== data.playerId,
          )
        : [
            ...state.activePoolComp.registeredPlayers,
            { ...player, paid: false },
          ];

      const slots = generateSlots(registeredPlayers.map((registeredPlayer) => registeredPlayer.id));

      return {
        ...state,
        activePoolComp: { ...state.activePoolComp, registeredPlayers, slots },
      };
    },

    addPlayer(state, data: { name: string }) {
      const name = data.name.trim();
      if (!name) throw domainError("Player name cannot be empty.");
      if (state.players.some((player) => player.name === name))
        throw domainError("Player already exists.");

      const player: Player = { id: randomUUID(), name, deactivated: false };
      return { ...state, players: [...state.players, player] };
    },

    deactivatePlayer(state, data: { playerId: string }) {
      const playerIndex = state.players.findIndex((candidate) => candidate.id === data.playerId);
      if (playerIndex === -1) throw domainError("Player not found.");

      const players = [...state.players];
      players[playerIndex] = { ...players[playerIndex]!, deactivated: true };

      let activePoolComp = state.activePoolComp;
      if (activePoolComp && !activePoolComp.started) {
        const registeredPlayers = activePoolComp.registeredPlayers.filter(
          (registeredPlayer) => registeredPlayer.id !== data.playerId,
        );
        activePoolComp = {
          ...activePoolComp,
          registeredPlayers,
          slots: generateSlots(registeredPlayers.map((registeredPlayer) => registeredPlayer.id)),
        };
      }

      return { ...state, players, activePoolComp };
    },

    activatePlayer(state, data: { playerId: string }) {
      const playerIndex = state.players.findIndex((candidate) => candidate.id === data.playerId);
      if (playerIndex === -1) throw domainError("Player not found.");

      const players = [...state.players];
      players[playerIndex] = { ...players[playerIndex]!, deactivated: false };

      return { ...state, players };
    },

    assignWinnerToBracketSlot(state, data: { parentSlotId: string; winningPlayerId: string }) {
      if (!state.activePoolComp) throw domainError("No active comp.");
      if (!state.activePoolComp.started) throw domainError("Comp has not started.");

      const parentSlotNumber = parseInt(data.parentSlotId.slice(1));
      const parentSlot = state.activePoolComp.slots.find((slot) => slot.id === data.parentSlotId);
      if (!parentSlot) throw domainError("Slot not found.");
      if (parentSlot.kind !== "empty") throw domainError("Slot already assigned.");

      const leftChildId = `s${parentSlotNumber * 2}`;
      const rightChildId = `s${parentSlotNumber * 2 + 1}`;
      const leftChild = state.activePoolComp.slots.find((slot) => slot.id === leftChildId);
      const rightChild = state.activePoolComp.slots.find((slot) => slot.id === rightChildId);
      if (!leftChild || !rightChild) throw domainError("Child slots not found.");

      const isValidWinner =
        (leftChild.kind === "player" && leftChild.playerId === data.winningPlayerId) ||
        (rightChild.kind === "player" && rightChild.playerId === data.winningPlayerId);
      if (!isValidWinner) throw domainError("Winning player is not in this matchup.");

      const updatedSlots = state.activePoolComp.slots.map((slot) =>
        slot.id === data.parentSlotId
          ? { id: slot.id, kind: "player" as const, playerId: data.winningPlayerId }
          : slot,
      );

      return {
        ...state,
        activePoolComp: {
          ...state.activePoolComp,
          slots: applyAutomaticByeAdvances(updatedSlots),
        },
      };
    },

    updatePlayer(state, data: { playerId: string; name: string }) {
      const name = data.name.trim();
      if (!name) throw domainError("Player name cannot be empty.");

      const playerIndex = state.players.findIndex((candidate) => candidate.id === data.playerId);
      if (playerIndex === -1) throw domainError("Player not found.");

      if (
        state.players.some((candidate) => candidate.id !== data.playerId && candidate.name === name)
      ) {
        throw domainError("Another player already has that name.");
      }

      const existing = state.players[playerIndex]!;
      const updated: Player = { id: data.playerId, name, deactivated: existing.deactivated };
      const players = [...state.players];
      players[playerIndex] = updated;

      let activePoolComp = state.activePoolComp;
      if (activePoolComp) {
        activePoolComp = {
          ...activePoolComp,
          registeredPlayers: activePoolComp.registeredPlayers.map((registeredPlayer) =>
            registeredPlayer.id === data.playerId ? { ...registeredPlayer, name } : registeredPlayer,
          ),
        };
      }

      return { ...state, players, activePoolComp };
    },
  };
}
