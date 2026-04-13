import { randomUUID } from "node:crypto";
import {
  bracketLeafCount,
  buildStartedFirstRoundLabels,
} from "../../../shared/bracket.js";
import type { ClientCommand } from "../ws/protocol.js";
import { withWeeklyPrizePreview } from "./prizeMoney.js";
import {
  type PoolComp,
  type SharedAppState,
  type SharedAppStateCore,
  toSharedAppStateCore,
} from "./types.js";

function cleanName(name: string): string {
  return name.trim();
}

export type DomainError = Error & { __domainError: true };

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof Error && "__domainError" in error;
}

function domainError(message: string): DomainError {
  const error = new Error(message) as DomainError;
  error.__domainError = true;
  return error;
}

export type AppStateStore = {
  getState(): SharedAppState;
  replaceState(nextState: SharedAppState): SharedAppState;
  apply(command: ClientCommand): SharedAppState;
};

export function createAppStateStore(
  initialState: SharedAppState,
): AppStateStore {
  let state: SharedAppStateCore = toSharedAppStateCore(initialState);

  function getState(): SharedAppState {
    return withWeeklyPrizePreview(state);
  }

  function replaceState(nextState: SharedAppState): SharedAppState {
    state = toSharedAppStateCore(nextState);
    return getState();
  }

  function apply(command: ClientCommand): SharedAppState {
    switch (command.type) {
      case "createPoolComp":
        return createPoolComp();
      case "cancelActivePoolComp":
        return cancelActivePoolComp();
      case "startActivePoolComp":
        return startActivePoolComp();
      case "completeActivePoolComp":
        return completeActivePoolComp();
      case "togglePlayerInActivePoolComp":
        return togglePlayerInActivePoolComp(command.name);
      case "addPlayer":
        return addPlayer(command.name);
      case "removePlayer":
        return removePlayer(command.name);
      default:
        throw domainError("Unsupported command");
    }
  }

  function createPoolComp(): SharedAppState {
    if (state.activePoolComp) {
      throw domainError("An active comp already exists.");
    }

    state.activePoolComp = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      players: [],
      started: false,
    };

    return getState();
  }

  function cancelActivePoolComp(): SharedAppState {
    if (!state.activePoolComp) {
      throw domainError("There is no active comp to cancel.");
    }

    state.activePoolComp = null;
    return getState();
  }

  function startActivePoolComp(): SharedAppState {
    if (!state.activePoolComp) {
      throw domainError("There is no active comp to start.");
    }

    if (state.activePoolComp.started) {
      throw domainError("The active comp has already started.");
    }

    const roster = [...state.activePoolComp.players];
    const leafCount = bracketLeafCount(roster.length);
    const firstRoundSlots = buildStartedFirstRoundLabels(
      roster,
      leafCount,
      Math.random,
    );

    state.activePoolComp = {
      ...state.activePoolComp,
      started: true,
      firstRoundSlots,
    };

    return getState();
  }

  function completeActivePoolComp(): SharedAppState {
    const activeComp = state.activePoolComp;

    if (!activeComp) {
      throw domainError("There is no active comp to complete.");
    }

    if (!activeComp.started) {
      throw domainError("You can only complete a comp after it has started.");
    }

    const completedComp: PoolComp = {
      ...activeComp,
      completedAt: new Date().toISOString(),
      status: "completed",
    };

    state.historicalMatches = [completedComp, ...state.historicalMatches];
    state.activePoolComp = null;

    return getState();
  }

  function togglePlayerInActivePoolComp(name: string): SharedAppState {
    const clean = cleanName(name);
    console.log(" name", clean);

    if (!clean) {
      throw domainError("Player name cannot be empty.");
    }

    if (!state.activePoolComp) {
      throw domainError("There is no active comp to update.");
    }

    if (state.activePoolComp.started) {
      throw domainError("You cannot change players after the comp starts.");
    }

    if (!state.players.includes(clean)) {
      throw domainError("Player must exist before being added to the comp.");
    }

    const hasPlayer = state.activePoolComp.players.includes(clean);
    state.activePoolComp = {
      ...state.activePoolComp,
      players: hasPlayer
        ? state.activePoolComp.players.filter((player) => player !== clean)
        : [...state.activePoolComp.players, clean],
    };

    return getState();
  }

  function addPlayer(name: string): SharedAppState {
    const clean = cleanName(name);

    if (!clean) {
      throw domainError("Player name cannot be empty.");
    }

    if (state.players.includes(clean)) {
      throw domainError("Player already exists.");
    }

    state.players = [...state.players, clean];
    return getState();
  }

  function removePlayer(name: string): SharedAppState {
    const clean = cleanName(name);

    if (!clean) {
      throw domainError("Player name cannot be empty.");
    }

    const activePlayers = state.activePoolComp?.players ?? [];
    if (state.activePoolComp?.started && activePlayers.includes(clean)) {
      throw domainError(
        "You cannot remove a player from a started active comp.",
      );
    }

    state.players = state.players.filter((player) => player !== clean);

    if (state.activePoolComp && !state.activePoolComp.started) {
      state.activePoolComp = {
        ...state.activePoolComp,
        players: state.activePoolComp.players.filter(
          (player) => player !== clean,
        ),
      };
    }

    return getState();
  }

  return { getState, replaceState, apply };
}
