import { randomUUID } from "node:crypto";
import { generateSlots } from "../../../shared/bracketLayout.js";
import type { AllData, Player, PoolComp } from "../../../shared/domain.js";
import type { MessageName } from "../../../shared/messageToBackend.js";
import type { Repository } from "./mongo-db.service.js";
import { assignMatchups } from "./matchup-generation.service.js";

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
      if (!state.activePoolComp) throw domainError("No active comp");
      await repository.deleteActivePoolCompById(state.activePoolComp.id);
      return repository.load();
    },

    async assignMatchups(state) {
      if (!state.activePoolComp) throw domainError("No active comp");
      const updatedSlots = assignMatchups(
        state.activePoolComp.registeredPlayers.map(
          (registeredPlayer) => registeredPlayer.id,
        ),
        state.activePoolComp.slots,
      );

      await repository.replaceActivePoolComp({
        ...state.activePoolComp,
        slots: updatedSlots,
      });
      return repository.load();
    },

    async completeActivePoolComp(state) {
      if (!state.activePoolComp) throw domainError("No active comp");

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

    async toggleRegisterPlayer(state, data: { playerId: string }) {
      if (!state.activePoolComp) throw domainError("No active comp.");

      const player = state.players.find(
        (candidate) => candidate.id === data.playerId,
      );
      if (!player) throw domainError("Player not found.");
      const { registeredPlayers } = state.activePoolComp;
      const alreadyRegistered = registeredPlayers.some(
        (registeredPlayer) => registeredPlayer.id === data.playerId,
      );
      if (!alreadyRegistered && player.deactivated)
        throw domainError("Cannot register a deactivated player.");

      let updatedRegisteredPlayers: RegisteredPlayer[];

      if (alreadyRegistered) {
        updatedRegisteredPlayers = registeredPlayers.filter(
          (p) => p.id != data.playerId,
        );
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
      const registeredIndex = state.activePoolComp.registeredPlayers.findIndex(
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

    async manualAssignPlayerToSlot(
      state,
      data: { slotId: string; playerId: string },
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
