import type { Matchup, Slot } from "../../../../shared/domain.js";
import type { PoolCompConfig } from "../../../../shared/poolCompConfig.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import type { RegisteredPlayer } from "../../../../shared/domain.js";
import { getSlotSourceMatchup } from "../../../../shared/tournament-slot.service.js";


export function getFirstRoundSize(registeredPlayerCount: number): PoolCompConfig["minCompSize"] | 16 | PoolCompConfig["maxCompSize"] {

  let compSize = poolCompConfig.minCompSize
  for (
    ; registeredPlayerCount < poolCompConfig.maxCompSize; compSize = compSize * 2) {
    if (registeredPlayerCount <= compSize) {
      return compSize;
    }
  }
  if (registeredPlayerCount <= 16) {
    return 16;
  }
  return 32;
}


export function getTournamentSlotsFromFirstRoundSize(firstRoundSize: number): Slot[] {

  return Array.from({ length: 2 * firstRoundSize - 1 }, (_, index) => ({ id: index }));
}


export function getFirstRoundSlotsFromAllTournamentSlots(
  allTournamentSlots: Slot[],
): Slot[] {
  const firstRoundSize = (allTournamentSlots.length + 1) / 2
  return allTournamentSlots.slice(-firstRoundSize)
}


export function remapWhenFirstRoundSlotCountGrows(
  existingSlots: Slot[],
  newSlots: Slot[],
) {
  const existingFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(existingSlots);
  const newFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(newSlots);
  existingFirstRoundSlots.forEach((slot, index) => {
    newFirstRoundSlots[index * 2]!.playerId = slot.playerId;
  });
}


export function registeredPlayersAreUnassigned(
  registeredPlayers: RegisteredPlayer[],
  firstRoundSlots: Slot[],
): boolean {
  for (let i = 0; i < registeredPlayers.length; i++) {
    const playerIsAssigned = firstRoundSlots.some(
      (slot) => slot.playerId === registeredPlayers[i]!.id,
    );
    if (!playerIsAssigned) {
      return true;
    }
  }
  return false;
}


export function eachFirstRoundMatchupDoesntHaveAPlayer(
  firstRoundSlots: Slot[],
): boolean {
  for (let index = 0; index < firstRoundSlots.length; index += 2) {
    const slot1 = firstRoundSlots[index]!;
    const slot2 = firstRoundSlots[index + 1]!;
    if (!slot1.playerId && !slot2.playerId) {
      return true;
    }
  }
  return false;
}


export function getRandomMatchupWithoutPlayer(firstRoundSlots: Slot[]): {
  slot1: Slot;
  slot2: Slot;
} {
  const matchupsWithoutPlayers: Matchup[] = [];
  for (let i = 0; i < firstRoundSlots.length; i += 2) {
    if (!firstRoundSlots[i]!.playerId && !firstRoundSlots[i + 1]!.playerId) {
      matchupsWithoutPlayers.push({
        slot1: firstRoundSlots[i]!,
        slot2: firstRoundSlots[i + 1]!,
      });
    }
  }
  const randomIndex = Math.floor(Math.random() * matchupsWithoutPlayers.length);
  return matchupsWithoutPlayers[randomIndex]!;
}


export function getRandomMatchupWithout2Players(firstRoundSlots: Slot[]): {
  slot1: Slot;
  slot2: Slot;
} {
  const matchupsWithout2Players: Matchup[] = [];
  for (let i = 0; i < firstRoundSlots.length; i += 2) {
    if (!firstRoundSlots[i]!.playerId || !firstRoundSlots[i + 1]!.playerId) {
      matchupsWithout2Players.push({
        slot1: firstRoundSlots[i]!,
        slot2: firstRoundSlots[i + 1]!,
      });
    }
  }
  const randomIndex = Math.floor(
    Math.random() * matchupsWithout2Players.length,
  );
  return matchupsWithout2Players[randomIndex]!;
}


export function getRandomSlotFromMatchup(matchup: {
  slot1: Slot;
  slot2: Slot;
}): Slot {
  const randomIndex = Math.floor(Math.random() * 2);
  return randomIndex === 0 ? matchup.slot1 : matchup.slot2;
}


export function clearByeMatchupAutoAdvance(tournamentSlots: Slot[]): void {
  const sortedSlots = tournamentSlots.sort((a, b) => a.id - b.id);
  sortedSlots.forEach(slot => {
    delete slot.isBye
    const sourceMatchup = getSlotSourceMatchup(slot, sortedSlots)
    if (sourceMatchup?.slot1.isBye || sourceMatchup?.slot2.isBye) {
      delete slot.playerId
    }
  })
}



export function getMatchupNextRoundSlot(matchup: Matchup, tournamentSlots: Slot[]): Slot {
  const indexOfFirstMatchupSlot = tournamentSlots.findIndex(
    (tournamentSlot) => tournamentSlot.id === matchup.slot1.id,
  );
  const indexOfSecondMatchupSlot = tournamentSlots.findIndex(
    (tournamentSlot) => tournamentSlot.id === matchup.slot2.id,
  );
  const indexOfParentSlot = Math.floor(
    Math.min(indexOfFirstMatchupSlot, indexOfSecondMatchupSlot) / 2,
  );
  return tournamentSlots[indexOfParentSlot]!;
}


export function getRandomUnassignedPlayer(
  registeredPlayers: RegisteredPlayer[],
  firstRoundSlots: Slot[],
): string {
  return registeredPlayers.find(
    (player) => !firstRoundSlots.some((slot) => slot.playerId === player.id),
  )!.id;
}


export function eachFirstRoundMatchupDoesntHave2Players(
  firstRoundSlots: Slot[],
): boolean {
  for (let index = 0; index < firstRoundSlots.length; index += 2) {
    const slot1 = firstRoundSlots[index]!;
    const slot2 = firstRoundSlots[index + 1]!;
    if (!slot1.playerId || !slot2.playerId) {
      return true;
    }
  }
  return false;
}


export function applyByeToEmptyFirstRoundSlots(tournamentSlots: Slot[]) {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  firstRoundSlots.forEach((slot) => {
    if (slot.playerId === undefined) {
      slot.isBye = true;
    }
  });
}


export function autoAdvanceByeMatchups(tournamentSlots: Slot[]) {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  advanceRoundSlots(firstRoundSlots)


  function advanceRoundSlots(thisRoundSlots: Slot[]) {
    for (let i = 0; i < thisRoundSlots.length; i += 2) {
      const slot1 = thisRoundSlots[i]!;
      const slot2 = thisRoundSlots[i + 1]!;
      if (slot1.isBye || slot2.isBye) {

        const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots);

        if (slot1.isBye && slot2.isBye) {
          nextRoundSlot.isBye = true
        } else {
          nextRoundSlot.playerId = slot1.isBye ? slot2.playerId : slot1.playerId;
        }
      }

    }
    if (thisRoundSlots.length == 2) {
      return
    }
    const nextRoundSlots = getNextRoundSlots(thisRoundSlots, tournamentSlots)
    advanceRoundSlots(nextRoundSlots)
  }
}


export function getNextRoundSlots(thisRoundSlots: Slot[], tournamentSlots: Slot[]): Slot[] {
  return tournamentSlots.reduce((acc, slot) => {
    const minId = Math.min(...thisRoundSlots.map(slot => slot.id))
    const nextRoundSize = thisRoundSlots.length / 2
    if (slot.id < minId && slot.id >= minId - nextRoundSize) {
      acc.push(slot)
    }
    return acc
  }, [] as Slot[])
}

export function slotIsFirstRoundSlot(slotId: number, tournamentSlots: Slot[]): boolean {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  return firstRoundSlots.some(slot => slot.id === slotId)
}

export function clearPlayerFromBracket(playerId: string, tournamentSlots: Slot[]) {
  tournamentSlots.forEach(slot => {
    if (slot.playerId === playerId) {
      delete slot.playerId
    }
  })
}