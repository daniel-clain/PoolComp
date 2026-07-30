import type { Matchup, RegisteredPlayer, Slot } from "../../../../shared/domain.js";
import type { PoolCompConfig } from "../../../../shared/poolCompConfig.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import { getFirstRoundMatchupsFromAllTournamentSlots, getFirstRoundSlotsFromAllTournamentSlots, getMatchupNextRoundSlot, getNextRoundSlots, getSlotsMatchup, getSlotsNextRoundSlot } from "../../../../shared/tournament-slot.service.js";


export function tournamentNeedsSizeIncrease(registeredPlayers: RegisteredPlayer[], existingSlots: Slot[]): boolean {
  const existingFirstRoundSize = getFirstRoundSlotsFromAllTournamentSlots(existingSlots).length;
  const newFirstRoundSize = getFirstRoundSize(registeredPlayers.length);
  return newFirstRoundSize > existingFirstRoundSize;
}


export function mapTournamentSlotsToNextRoundSize(registeredPlayers: RegisteredPlayer[], existingSlots: Slot[]): Slot[] {

  const existingFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(existingSlots);
  const newFirstRoundSize = getFirstRoundSize(registeredPlayers.length);
  const newSlots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize);
  const newFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(newSlots);
  existingFirstRoundSlots.forEach((slot, index) => {
    if (slot.playerId) {
      newFirstRoundSlots[index * 2]!.playerId = slot.playerId;
    }
  });
  return newSlots;
}


export function getMatchupsWithAnAvailableSlot(tournamentSlots: Slot[]): Matchup[] {
  const matchups: Matchup[] = getFirstRoundMatchupsFromAllTournamentSlots(tournamentSlots)
  const matchupsWithAnAvailableSlot = matchups.filter(({ slot1, slot2 }) => [slot1, slot2].some(slot => isSlotAvailable(slot, tournamentSlots)));
  return matchupsWithAnAvailableSlot;
}


export function matchupHasTwoEmptySlots(matchup: Matchup): boolean {
  return !matchup.slot1.playerId && !matchup.slot2.playerId;
}


export function matchupHasAnEmptySlot(matchup: Matchup): boolean {
  return !matchup.slot1.playerId || !matchup.slot2.playerId;
}


export function isSlotAvailable(slot: Slot, tournamentSlots: Slot[]): boolean {
  if (slot.playerId) {
    return false;
  }
  const nextRoundSlot = getSlotsNextRoundSlot(slot, tournamentSlots);
  const nextRoundMatchup = nextRoundSlot && getSlotsMatchup(nextRoundSlot, tournamentSlots);

  if (nextRoundMatchup?.slot1.playerId && nextRoundMatchup?.slot2.playerId) {
    const byeMatchupPlayerHasResolvedPVPMatchup = getMatchupNextRoundSlot(nextRoundMatchup, tournamentSlots);
    if (byeMatchupPlayerHasResolvedPVPMatchup.playerId) {
      return false;
    }
  }

  return !slot.playerId;
}


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


export function getRandomMatchup(matchups: Matchup[]): Matchup {
  const randomIndex = Math.floor(Math.random() * matchups.length);
  return matchups[randomIndex]!;
}


export function getRandomSlotFromMatchup(matchup: Matchup): Slot {
  const randomIndex = Math.floor(Math.random() * 2);
  return randomIndex === 0 ? matchup.slot1 : matchup.slot2;
}


export function clearSlotsAutoAdvance(slot: Slot, tournamentSlots: Slot[]) {

  recursiveClear(slot);

  function recursiveClear(slot: Slot) {

    delete slot.isBye;
    delete slot.playerId;

    const nextRoundSlot = getSlotsNextRoundSlot(slot, tournamentSlots);
    nextRoundSlot && recursiveClear(nextRoundSlot)

  }
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
    const nextRoundSlots = getNextRoundSlots(thisRoundSlots, tournamentSlots)
    if (nextRoundSlots.length == 1) {
      return
    }
    advanceRoundSlots(nextRoundSlots)
  }
}


export function slotIsFirstRoundSlot(slotId: number, tournamentSlots: Slot[]): boolean {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  return firstRoundSlots.some(slot => slot.id === slotId)
}


export function clearPlayerFromTournament(playerId: string, tournamentSlots: Slot[]) {
  tournamentSlots.forEach(slot => {
    if (slot.playerId === playerId) {
      delete slot.playerId
    }
  })
}