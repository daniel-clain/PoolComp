import type { ActivePoolComp, Slot } from "../../../../shared/domain.js";

import _ from "lodash";

import {
  applyByeToEmptyFirstRoundSlots,
  autoAdvanceByeMatchups,
  clearPlayerFromBracket,
  clearSlotsAutoAdvance,
  getFirstRoundSize,
  getMatchupsWithAnAvailableSlot,
  getRandomMatchup,
  getRandomSlotFromMatchup,
  getTournamentSlotsFromFirstRoundSize,
  getUnassignedPlayers,
  matchupHasTwoEmptySlots,
  slotIsFirstRoundSlot
} from "./tournament-slot-assignment.units.js";



export function autoAssignUnassignedPlayers(comp: ActivePoolComp): Slot[] {
  const { registeredPlayers, slots: existingSlots } = comp
  let updatedSlots: Slot[] = _.cloneDeep(existingSlots);



  getUnassignedPlayers(registeredPlayers, updatedSlots).forEach(player => {

    const matchupsWithAnAvailableSlot = getMatchupsWithAnAvailableSlot(updatedSlots)
    let availableSlot: Slot
    if (matchupsWithAnAvailableSlot.some(matchupHasTwoEmptySlots)) {
      const matchup = getRandomMatchup(matchupsWithAnAvailableSlot.filter(matchupHasTwoEmptySlots));
      availableSlot = getRandomSlotFromMatchup(matchup);
    } else {
      const matchup = getRandomMatchup(matchupsWithAnAvailableSlot);
      availableSlot = matchup.slot1.playerId ? matchup.slot2 : matchup.slot1;
    }
    updatedSlots = clearSlotsAutoAdvance(availableSlot!, updatedSlots)
    updatedSlots.find(slot => slot.id === availableSlot.id)!.playerId = player.id;

  })
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
  comp.slots = comp.slots.map((slot) => {
    if (slot.playerId === playerId) {
      return { id: slot.id };
    }
    return slot;
  })
  applyByeToEmptyFirstRoundSlots(comp.slots)
  autoAdvanceByeMatchups(comp.slots)

  return comp.slots
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
