import { Matchup, Slot } from "../../../shared/domain.js";

export function getFirstRoundSlots(playersLength: number): number {
  // If there is only 1 player, there are 0 slots
  if (playersLength <= 1) {
    return 0;
  }

  // Start with 2 slots
  let firstRoundSlots = 2;

  // While the slots are smaller than the players, keep doubling
  while (firstRoundSlots < playersLength) {
    firstRoundSlots = firstRoundSlots * 2;
  }

  return firstRoundSlots;
}

export function getTotalTournamentSlots(firstRoundSize: number): Slot[] {
  return Array.from({ length: 2 * firstRoundSize - 1 }, (_, index) => ({
    id: `s${index}`,
  }));
}

export function registeredPlayersAreUnassigned(
  registeredPlayerIds: string[],
  firstRoundSlots: Slot[],
): boolean {
  for (let i = 0; i < registeredPlayerIds.length; i++) {
    const playerIsAssigned = firstRoundSlots.some(
      (slot) => slot.playerId === registeredPlayerIds[i],
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
  console.log("a player ---------firstRoundSlots", firstRoundSlots);
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
    console.log("firstRoundSlots[i]", firstRoundSlots[i]);
    console.log("firstRoundSlots[i + 1]", firstRoundSlots[i + 1]);
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
    console.log("firstRoundSlots[i]", firstRoundSlots[i]);
    console.log("firstRoundSlots[i + 1]", firstRoundSlots[i + 1]);
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

export function getRandomUnassignedPlayer(
  registeredPlayerIds: string[],
  firstRoundSlots: Slot[],
): string {
  return registeredPlayerIds.find(
    (playerId) => !firstRoundSlots.some((slot) => slot.playerId === playerId),
  )!;
}

export function eachFirstRoundMatchupDoesntHave2Players(
  firstRoundSlots: Slot[],
): boolean {
  console.log("2 players ---------firstRoundSlots", firstRoundSlots);
  for (let index = 0; index < firstRoundSlots.length; index += 2) {
    const slot1 = firstRoundSlots[index]!;
    const slot2 = firstRoundSlots[index + 1]!;
    if (!slot1.playerId || !slot2.playerId) {
      return true;
    }
  }
  return false;
}
