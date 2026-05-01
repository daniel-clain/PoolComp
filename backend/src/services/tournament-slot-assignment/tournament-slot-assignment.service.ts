import type { ActivePoolComp, Slot } from "../../../../shared/domain.js";

import {
  getFirstRoundSize,
  getTournamentSlotsFromFirstRoundSize,
  remapWhenFirstRoundSlotCountGrows,
  registeredPlayersAreUnassigned,
  eachFirstRoundMatchupDoesntHaveAPlayer,
  getRandomMatchupWithoutPlayer,
  getRandomSlotFromMatchup,
  getRandomUnassignedPlayer,
  getRandomMatchupWithout2Players,
  eachFirstRoundMatchupDoesntHave2Players,
  getFirstRoundSlotsFromAllTournamentSlots,
  clearByeMatchupAutoAdvance,
  applyByeToEmptyFirstRoundSlots,
  autoAdvanceByeMatchups, slotIsFirstRoundSlot, clearPlayerFromBracket,
} from "./tournament-slot-assignment.units.js";
import _ from "lodash";




export function autoAssignUnassignedPlayers(comp: ActivePoolComp): Slot[] {
  const { registeredPlayers, slots: existingSlots } = comp
  let updatedSlots: Slot[] = _.cloneDeep(existingSlots);

  clearByeMatchupAutoAdvance(updatedSlots)

  const existingFirstRoundSize = getFirstRoundSlotsFromAllTournamentSlots(existingSlots).length;

  const newFirstRoundSize = getFirstRoundSize(registeredPlayers.length);

  // handle when first round size grows
  if (newFirstRoundSize > existingFirstRoundSize) {
    const newSlots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize);
    remapWhenFirstRoundSlotCountGrows(existingSlots, newSlots);
    updatedSlots = newSlots;
  }

  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(updatedSlots);

  while (
    registeredPlayersAreUnassigned(registeredPlayers, updatedSlots) &&
    eachFirstRoundMatchupDoesntHaveAPlayer(firstRoundSlots)
  ) {
    const matchup = getRandomMatchupWithoutPlayer(firstRoundSlots);
    const randomSlot = getRandomSlotFromMatchup(matchup);
    const playerId = getRandomUnassignedPlayer(
      registeredPlayers,
      firstRoundSlots,
    );
    randomSlot.playerId = playerId;
  }
  while (
    registeredPlayersAreUnassigned(registeredPlayers, firstRoundSlots) &&
    eachFirstRoundMatchupDoesntHave2Players(firstRoundSlots)
  ) {
    const matchup = getRandomMatchupWithout2Players(firstRoundSlots);
    const remainingSlot = matchup.slot1.playerId
      ? matchup.slot2
      : matchup.slot1;

    const playerId = getRandomUnassignedPlayer(
      registeredPlayers,
      firstRoundSlots,
    );
    remainingSlot.playerId = playerId;
  }

  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots;
}

export function randomiseAllMatchups(comp: ActivePoolComp): Slot[] {

  const { registeredPlayers } = comp
  const newFirstRoundSize = getFirstRoundSize(registeredPlayers.length);
  const slots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize); return autoAssignUnassignedPlayers({ ...comp, slots })

}

export function removePlayerFromSlots(comp: ActivePoolComp, playerId: string): Slot[] {
  const { slots } = comp
  slots.map((slot) => {
    if (slot.playerId === playerId) {
      return { id: slot.id };
    }
    return slot;
  })
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(slots)
  applyByeToEmptyFirstRoundSlots(firstRoundSlots)
  autoAdvanceByeMatchups(slots)

  return slots
}


export function handleManualAssignPlayerToSlot(comp: ActivePoolComp, slotId: number, playerId: string): Slot[] {
  const { slots: existingSlots } = comp
  let updatedSlots: Slot[] = _.cloneDeep(existingSlots);
  const targetSlot = updatedSlots.find(slot => slot.id === slotId)
  if (slotIsFirstRoundSlot(slotId, updatedSlots)) {
    const playerAlreadyInSlot = targetSlot?.playerId
    if (playerAlreadyInSlot) {
      clearPlayerFromBracket(playerAlreadyInSlot, updatedSlots)
    }
    clearPlayerFromBracket(playerId, updatedSlots)
    updatedSlots.forEach(slot => {
      if (slot.id === slotId) {
        slot.playerId = playerId
      }
    })
    updatedSlots = autoAssignUnassignedPlayers({ ...comp, slots: updatedSlots })

  } else {

    updatedSlots.forEach(slot => {
      if (slot.id === slotId) {
        slot.playerId = playerId
      }
    })
  }
  return updatedSlots
}
