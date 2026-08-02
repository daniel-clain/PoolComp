import type { Matchup, RegisteredPlayer, Slot } from "../../../../shared/domain.js";
import type { PoolCompConfig } from "../../../../shared/poolCompConfig.js";
import { poolCompConfig } from "../../../../shared/poolCompConfig.js";
import { getFirstRoundMatchupsFromAllTournamentSlots, getFirstRoundSlotsFromAllTournamentSlots, getMatchupNextRoundSlot, getMatchupWinner, getNextRoundSlots, getSlotsMatchup, getSlotsNextRoundSlot } from "../../../../shared/tournament-slot.service.js";
import { getOtherSlot } from "./tournament-slot-assignment.service.js";


export function tournamentNeedsSizeIncrease(playerPool: RegisteredPlayer[], tournamentSlots: Slot[]): boolean {
  const existingFirstRoundSize = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots).length;
  const newFirstRoundSize = getFirstRoundSize(playerPool.length);
  return newFirstRoundSize > existingFirstRoundSize;
}


export function mapTournamentSlotsToNextRoundSize(playerPool: RegisteredPlayer[], tournamentSlots: Slot[]): Slot[] {

  const existingFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
  const newFirstRoundSize = getFirstRoundSize(playerPool.length);
  const newSlots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize);
  const newFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(newSlots);
  existingFirstRoundSlots.forEach((slot, index) => {
    if (slot.player) {
      newFirstRoundSlots[index * 2]!.player = slot.player;
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
  return !matchup.slot1.player && !matchup.slot2.player;
}


export function matchupHasAnEmptySlot(matchup: Matchup): boolean {
  return !matchup.slot1.player || !matchup.slot2.player;
}


export function isSlotAvailable(slot: Slot, tournamentSlots: Slot[]): boolean {
  if (slot.player) {
    return false;
  }
  // if its a bye slot then its available, unless the by player has had their next game
  if (slot.isBye) {
    const byeMatchup = getSlotsMatchup(slot, tournamentSlots);
    const otherSlot = getOtherSlot(slot, byeMatchup);
    if (otherSlot.isBye) {
      return true;
    }
    const autoAdvanceSlot = getSlotsNextRoundSlot(slot, tournamentSlots);
    const byePlayerNextMatchup = autoAdvanceSlot && getSlotsMatchup(autoAdvanceSlot, tournamentSlots);
    const byePlayerNextMatchResolved = byePlayerNextMatchup && getMatchupWinner(byePlayerNextMatchup, tournamentSlots);
    return slot.isBye && !byePlayerNextMatchResolved;
  }
  throw 'slot shold be player or bye'
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
    newFirstRoundSlots[index * 2]!.player = slot.player;
  });
}


export function eachFirstRoundMatchupDoesntHaveAPlayer(
  firstRoundSlots: Slot[],
): boolean {
  for (let index = 0; index < firstRoundSlots.length; index += 2) {
    const slot1 = firstRoundSlots[index]!;
    const slot2 = firstRoundSlots[index + 1]!;
    if (!slot1.player && !slot2.player) {
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
    delete slot.player;

    const nextRoundSlot = getSlotsNextRoundSlot(slot, tournamentSlots);
    nextRoundSlot && recursiveClear(nextRoundSlot)

  }
}



export function applyByeToEmptyFirstRoundSlots(tournamentSlots: Slot[]) {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  firstRoundSlots.forEach((slot) => {
    if (slot.player === undefined) {
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
          nextRoundSlot.player = slot1.isBye ? slot2.player : slot1.player;
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


export function clearPlayerFromTournament(player: RegisteredPlayer, tournamentSlots: Slot[]) {
  tournamentSlots.forEach(slot => {
    if (slot.player?.id === player.id) {
      delete slot.player
    }
  })
}