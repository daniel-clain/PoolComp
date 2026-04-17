import { randomBytes, randomUUID } from "node:crypto";
import {
  collectPlayerIdsPlacedInSlots,
  computeFirstRoundSize,
  generateSlots,
  inferFirstRoundSizeFromSlotCount,
  isFirstRoundLeafSlotNumber,
  registrationSlotsMatchGeneratedLayout,
} from "../../../shared/bracketLayout.js";
import type { AllData, Player, PoolComp, Slot } from "../../../shared/domain.js";
import type { MessageName } from "../../../shared/messageToBackend.js";
import type { Repository } from "../mongo/repository.js";

export type AsyncPoolCompActionHandler = (
  state: AllData,
  data: any,
) => Promise<AllData>;

function domainError(message: string): Error {
  return new Error(message);
}

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = randomBytes(4).readUInt32BE(0) % (i + 1);
    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex]!,
      shuffled[i]!,
    ];
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
        slotMap.set(slotNumber, {
          id: `s${slotNumber}`,
          kind: "player",
          playerId: leftChild.playerId,
        });
      } else if (rightIsPlayer && leftIsBye) {
        slotMap.set(slotNumber, {
          id: `s${slotNumber}`,
          kind: "player",
          playerId: rightChild.playerId,
        });
      }
    }
  }
}

function buildStartedSlots(
  playerIds: string[],
  firstRoundSize: number,
): Slot[] {
  const totalSlots = firstRoundSize * 2 - 1;
  const totalPairs = firstRoundSize / 2;
  const { playerPlayerPairs, playerByePairs, byeByePairs } =
    computeFirstRoundPairCounts(playerIds.length, firstRoundSize);

  const pairTypes: Array<"playerPlayer" | "playerBye" | "byeBye"> = [];
  for (let index = 0; index < byeByePairs; index++) {
    pairTypes.push("byeBye");
  }
  for (let index = 0; index < playerByePairs; index++) {
    pairTypes.push("playerBye");
  }
  for (let index = 0; index < playerPlayerPairs; index++) {
    pairTypes.push("playerPlayer");
  }
  const shuffledPairTypes = shuffleArray(pairTypes);

  const shuffledPlayerIds = shuffleArray(playerIds);
  let playerCursor = 0;

  const slotMap = new Map<number, Slot>();

  for (let pairIndex = 0; pairIndex < totalPairs; pairIndex++) {
    const leftLeaf = firstRoundSize + pairIndex * 2;
    const rightLeaf = leftLeaf + 1;
    const pairType = shuffledPairTypes[pairIndex]!;

    switch (pairType) {
      case "playerPlayer":
        slotMap.set(leftLeaf, {
          id: `s${leftLeaf}`,
          kind: "player",
          playerId: shuffledPlayerIds[playerCursor]!,
        });
        playerCursor++;
        slotMap.set(rightLeaf, {
          id: `s${rightLeaf}`,
          kind: "player",
          playerId: shuffledPlayerIds[playerCursor]!,
        });
        playerCursor++;
        break;
      case "playerBye":
        slotMap.set(leftLeaf, {
          id: `s${leftLeaf}`,
          kind: "player",
          playerId: shuffledPlayerIds[playerCursor]!,
        });
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
    const pairType = shuffledPairTypes[pairIndex]!;

    if (pairType === "playerBye") {
      const playerSlot = slotMap.get(leftLeaf)!;
      if (playerSlot.kind === "player") {
        slotMap.set(parentSlotNumber, {
          id: `s${parentSlotNumber}`,
          kind: "player",
          playerId: playerSlot.playerId,
        });
      }
    } else if (pairType === "byeBye") {
      slotMap.set(parentSlotNumber, {
        id: `s${parentSlotNumber}`,
        kind: "bye",
      });
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

function championPlayerIdIfDetermined(slots: Slot[]): string | null {
  const rootSlot = slots.find((slot) => slot.id === "s1");
  return rootSlot?.kind === "player" ? rootSlot.playerId : null;
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
        slotMap.set(slot.id, {
          id: slot.id,
          kind: "player",
          playerId: leftChild.playerId,
        });
        changed = true;
      } else if (leftChild.kind === "bye" && rightChild.kind === "player") {
        slotMap.set(slot.id, {
          id: slot.id,
          kind: "player",
          playerId: rightChild.playerId,
        });
        changed = true;
      } else if (leftChild.kind === "bye" && rightChild.kind === "bye") {
        slotMap.set(slot.id, { id: slot.id, kind: "bye" });
        changed = true;
      }
    }
  }
  return slots.map((slot) => slotMap.get(slot.id)!);
}

function sortSlotsByNumericId(slots: Slot[]): Slot[] {
  return [...slots].sort(
    (first, second) =>
      parseInt(first.id.slice(1), 10) - parseInt(second.id.slice(1), 10),
  );
}

function stripPlayerIdFromAllSlots(slots: Slot[], playerId: string): Slot[] {
  return slots.map((slot) =>
    slot.kind === "player" && slot.playerId === playerId
      ? { id: slot.id, kind: "empty" as const }
      : slot,
  );
}

function isFirstRoundLeafByeAvailableForNewPlayer(
  slots: Slot[],
  leafSlotNumber: number,
  firstRoundSize: number,
): boolean {
  if (!isFirstRoundLeafSlotNumber(leafSlotNumber, firstRoundSize)) {
    return false;
  }
  const leafSlot = slots.find(
    (candidate) => candidate.id === `s${leafSlotNumber}`,
  );
  if (!leafSlot || leafSlot.kind !== "bye") {
    return false;
  }

  const parentNumber = Math.floor(leafSlotNumber / 2);
  const secondRoundNumber = Math.floor(parentNumber / 2);
  const secondRoundSlot = slots.find(
    (candidate) => candidate.id === `s${secondRoundNumber}`,
  );
  if (secondRoundSlot?.kind === "player") {
    return false;
  }
  return true;
}

function computeEligibleFirstRoundLeaves(
  slots: Slot[],
  firstRoundSize: number,
): number[] {
  const eligible: number[] = [];
  for (
    let leafNumber = firstRoundSize;
    leafNumber <= firstRoundSize * 2 - 1;
    leafNumber++
  ) {
    const slot = slots.find((candidate) => candidate.id === `s${leafNumber}`);
    if (!slot) continue;
    if (slot.kind === "empty") {
      eligible.push(leafNumber);
    } else if (
      slot.kind === "bye" &&
      isFirstRoundLeafByeAvailableForNewPlayer(slots, leafNumber, firstRoundSize)
    ) {
      eligible.push(leafNumber);
    }
  }
  return eligible;
}

function placePlayerOnFirstRoundLeaf(
  slots: Slot[],
  playerId: string,
  leafNumber: number,
): Slot[] {
  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const leafId = `s${leafNumber}`;
  const leafSlot = byId.get(leafId);
  if (!leafSlot) {
    throw domainError("Bracket slot missing.");
  }

  if (leafSlot.kind === "empty") {
    byId.set(leafId, { id: leafId, kind: "player", playerId });
  } else if (leafSlot.kind === "bye") {
    byId.set(leafId, { id: leafId, kind: "player", playerId });
    const siblingNumber =
      leafNumber % 2 === 0 ? leafNumber + 1 : leafNumber - 1;
    const siblingId = `s${siblingNumber}`;
    const siblingSlot = byId.get(siblingId);
    const parentNumber = Math.floor(leafNumber / 2);
    const parentId = `s${parentNumber}`;
    if (siblingSlot?.kind === "player") {
      const parentSlot = byId.get(parentId);
      if (parentSlot?.kind === "player") {
        byId.set(parentId, { id: parentId, kind: "empty" });
      }
    }
  } else {
    throw domainError("Expected an open first-round position.");
  }

  return sortSlotsByNumericId(Array.from(byId.values()));
}

function incrementalAssignPendingPlayers(
  slots: Slot[],
  registeredPlayerIds: string[],
): Slot[] {
  const placed = collectPlayerIdsPlacedInSlots(slots);
  const pending = registeredPlayerIds.filter(
    (playerId) => !placed.has(playerId),
  );
  if (pending.length === 0) {
    throw domainError(
      "Every registered player already appears in the bracket.",
    );
  }

  const firstRoundSize = inferFirstRoundSizeFromSlotCount(slots.length);
  let workingSlots = slots;
  let remainingPlayerIds = shuffleArray(pending);

  while (remainingPlayerIds.length > 0) {
    const eligibleLeaves = computeEligibleFirstRoundLeaves(
      workingSlots,
      firstRoundSize,
    );
    if (eligibleLeaves.length === 0) {
      throw domainError(
        "Not enough open first-round positions. Some bye positions can no longer accept a player because a later round is already decided.",
      );
    }
    const chosenLeaf = shuffleArray(eligibleLeaves)[0]!;
    const nextPlayerId = remainingPlayerIds.pop()!;
    workingSlots = placePlayerOnFirstRoundLeaf(
      workingSlots,
      nextPlayerId,
      chosenLeaf,
    );
  }

  return workingSlots;
}

export function createPoolCompService(
  repository: Repository,
): Record<MessageName, AsyncPoolCompActionHandler> {
  return {
    async createPoolComp(state) {
      if (state.activePoolComp)
        throw domainError("An active comp already exists.");

      const activePoolComp = {
        id: randomUUID(),
        date: new Date(),
        slots: generateSlots([]),
        registeredPlayers: [],
      };
      await repository.insertActivePoolComp(activePoolComp);
      return repository.load();
    },

    async cancelActivePoolComp(state) {
      if (!state.activePoolComp) throw domainError("No active comp to cancel.");
      await repository.deleteActivePoolCompById(state.activePoolComp.id);
      return repository.load();
    },

    async createMatchups(state) {
      if (!state.activePoolComp) throw domainError("No active comp.");

      const registeredPlayerIds = state.activePoolComp.registeredPlayers.map(
        (registeredPlayer) => registeredPlayer.id,
      );

      let nextSlots: Slot[];

      if (
        registrationSlotsMatchGeneratedLayout(
          state.activePoolComp.slots,
          registeredPlayerIds,
        )
      ) {
        if (registeredPlayerIds.length < 5) {
          throw domainError(
            "Need at least 5 registered players to create matchups.",
          );
        }
        const firstRoundSize = computeFirstRoundSize(registeredPlayerIds.length);
        nextSlots = applyAutomaticByeAdvances(
          buildStartedSlots(registeredPlayerIds, firstRoundSize),
        );
      } else {
        nextSlots = incrementalAssignPendingPlayers(
          state.activePoolComp.slots,
          registeredPlayerIds,
        );
        nextSlots = applyAutomaticByeAdvances(nextSlots);
      }

      await repository.replaceActivePoolComp({
        ...state.activePoolComp,
        slots: nextSlots,
      });
      return repository.load();
    },

    async completeActivePoolComp(state) {
      if (!state.activePoolComp)
        throw domainError("No active comp to complete.");
      if (championPlayerIdIfDetermined(state.activePoolComp.slots) === null) {
        throw domainError(
          "A champion must be decided before the comp can be completed.",
        );
      }

      const completed: PoolComp = {
        id: state.activePoolComp.id,
        date: state.activePoolComp.date,
        slots: state.activePoolComp.slots,
      };

      const activeId = state.activePoolComp.id;
      await repository.insertCompHistoryEntry(completed);
      await repository.deleteActivePoolCompById(activeId);
      return repository.load();
    },

    async togglePlayerInActivePoolComp(
      state,
      data: { playerId: string },
    ) {
      if (!state.activePoolComp) throw domainError("No active comp.");

      const player = state.players.find(
        (candidate) => candidate.id === data.playerId,
      );
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

      const previousRegisteredIds = state.activePoolComp.registeredPlayers.map(
        (registeredPlayer) => registeredPlayer.id,
      );

      let nextSlots: Slot[];
      if (
        registrationSlotsMatchGeneratedLayout(
          state.activePoolComp.slots,
          previousRegisteredIds,
        )
      ) {
        nextSlots = generateSlots(
          registeredPlayers.map((registeredPlayer) => registeredPlayer.id),
        );
      } else if (alreadyRegistered) {
        nextSlots = stripPlayerIdFromAllSlots(
          state.activePoolComp.slots,
          data.playerId,
        );
        nextSlots = applyAutomaticByeAdvances(nextSlots);
      } else {
        nextSlots = state.activePoolComp.slots;
      }

      await repository.replaceActivePoolComp({
        ...state.activePoolComp,
        registeredPlayers,
        slots: nextSlots,
      });
      return repository.load();
    },

    async toggleRegisteredPlayerPaid(state, data: { playerId: string }) {
      if (!state.activePoolComp) throw domainError("No active comp.");
      const registeredIndex =
        state.activePoolComp.registeredPlayers.findIndex(
          (registeredPlayer) => registeredPlayer.id === data.playerId,
        );
      if (registeredIndex === -1) {
        throw domainError("That player is not registered in this comp.");
      }

      const registeredPlayers = state.activePoolComp.registeredPlayers.map(
        (registeredPlayer) =>
          registeredPlayer.id === data.playerId
            ? { ...registeredPlayer, paid: !registeredPlayer.paid }
            : registeredPlayer,
      );

      await repository.replaceActivePoolComp({
        ...state.activePoolComp,
        registeredPlayers,
      });
      return repository.load();
    },

    async addPlayer(state, data: { name: string }) {
      const name = data.name.trim();
      if (!name) throw domainError("Player name cannot be empty.");
      const existingPlayerWithSameName = state.players.find(
        (player) => player.name === name,
      );
      if (existingPlayerWithSameName) {
        if (existingPlayerWithSameName.deactivated) {
          throw domainError(
            "A player with that name already exists but has been deactivated. If it is the same person, reactivate that player instead of adding a new one.",
          );
        }
        throw domainError("A player with that name already exists.");
      }

      const player: Player = { id: randomUUID(), name, deactivated: false };
      try {
        await repository.insertPlayer(player);
      } catch (error: unknown) {
        if (isMongoDuplicateKeyError(error)) {
          throw domainError("Player id collision; try again.");
        }
        throw error;
      }
      return repository.load();
    },

    async deactivatePlayer(state, data: { playerId: string }) {
      const playerIndex = state.players.findIndex(
        (candidate) => candidate.id === data.playerId,
      );
      if (playerIndex === -1) throw domainError("Player not found.");

      const updatedPlayer: Player = {
        ...state.players[playerIndex]!,
        deactivated: true,
      };
      await repository.replacePlayerByPlayerId(data.playerId, updatedPlayer);

      if (state.activePoolComp) {
        const registeredPlayers = state.activePoolComp.registeredPlayers.filter(
          (registeredPlayer) => registeredPlayer.id !== data.playerId,
        );
        const previousRegisteredIds = state.activePoolComp.registeredPlayers.map(
          (registeredPlayer) => registeredPlayer.id,
        );
        if (
          registrationSlotsMatchGeneratedLayout(
            state.activePoolComp.slots,
            previousRegisteredIds,
          )
        ) {
          await repository.replaceActivePoolComp({
            ...state.activePoolComp,
            registeredPlayers,
            slots: generateSlots(
              registeredPlayers.map((registeredPlayer) => registeredPlayer.id),
            ),
          });
        } else {
          let nextSlots = stripPlayerIdFromAllSlots(
            state.activePoolComp.slots,
            data.playerId,
          );
          nextSlots = applyAutomaticByeAdvances(nextSlots);
          await repository.replaceActivePoolComp({
            ...state.activePoolComp,
            registeredPlayers,
            slots: nextSlots,
          });
        }
      }
      return repository.load();
    },

    async activatePlayer(state, data: { playerId: string }) {
      const playerIndex = state.players.findIndex(
        (candidate) => candidate.id === data.playerId,
      );
      if (playerIndex === -1) throw domainError("Player not found.");

      const updatedPlayer: Player = {
        ...state.players[playerIndex]!,
        deactivated: false,
      };
      await repository.replacePlayerByPlayerId(data.playerId, updatedPlayer);
      return repository.load();
    },

    async assignWinnerToBracketSlot(
      state,
      data: { parentSlotId: string; winningPlayerId: string },
    ) {
      if (!state.activePoolComp) throw domainError("No active comp.");

      const parentSlotNumber = parseInt(data.parentSlotId.slice(1));
      const parentSlot = state.activePoolComp.slots.find(
        (slot) => slot.id === data.parentSlotId,
      );
      if (!parentSlot) throw domainError("Slot not found.");
      if (parentSlot.kind !== "empty")
        throw domainError("Slot already assigned.");

      const leftChildId = `s${parentSlotNumber * 2}`;
      const rightChildId = `s${parentSlotNumber * 2 + 1}`;
      const leftChild = state.activePoolComp.slots.find(
        (slot) => slot.id === leftChildId,
      );
      const rightChild = state.activePoolComp.slots.find(
        (slot) => slot.id === rightChildId,
      );
      if (!leftChild || !rightChild)
        throw domainError("Child slots not found.");

      const isValidWinner =
        (leftChild.kind === "player" &&
          leftChild.playerId === data.winningPlayerId) ||
        (rightChild.kind === "player" &&
          rightChild.playerId === data.winningPlayerId);
      if (!isValidWinner)
        throw domainError("Winning player is not in this matchup.");

      const updatedSlots = state.activePoolComp.slots.map((slot) =>
        slot.id === data.parentSlotId
          ? {
              id: slot.id,
              kind: "player" as const,
              playerId: data.winningPlayerId,
            }
          : slot,
      );

      await repository.replaceActivePoolComp({
        ...state.activePoolComp,
        slots: applyAutomaticByeAdvances(updatedSlots),
      });
      return repository.load();
    },

    async updatePlayer(state, data: { playerId: string; name: string }) {
      const name = data.name.trim();
      if (!name) throw domainError("Player name cannot be empty.");

      const playerIndex = state.players.findIndex(
        (candidate) => candidate.id === data.playerId,
      );
      if (playerIndex === -1) throw domainError("Player not found.");

      if (
        state.players.some(
          (candidate) =>
            candidate.id !== data.playerId && candidate.name === name,
        )
      ) {
        throw domainError("Another player already has that name.");
      }

      const existing = state.players[playerIndex]!;
      const updated: Player = {
        id: data.playerId,
        name,
        deactivated: existing.deactivated,
      };
      await repository.replacePlayerByPlayerId(data.playerId, updated);

      if (state.activePoolComp) {
        await repository.replaceActivePoolComp({
          ...state.activePoolComp,
          registeredPlayers: state.activePoolComp.registeredPlayers.map(
            (registeredPlayer) =>
              registeredPlayer.id === data.playerId
                ? { ...registeredPlayer, name }
                : registeredPlayer,
          ),
        });
      }
      return repository.load();
    },
  };
}
