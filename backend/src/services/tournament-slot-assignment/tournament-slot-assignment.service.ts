import type { ActivePoolComp, Slot } from "../../../../shared/domain.js";

import _ from "lodash";

import { getUnassignedPlayers } from "../../../../shared/tournament-slot.service.js";
import {
  applyByeToEmptyFirstRoundSlots,
  autoAdvanceByeMatchups,
  clearPlayerFromTournament,
  clearSlotsAutoAdvance,
  getFirstRoundSize,
  getMatchupsWithAnAvailableSlot,
  getRandomMatchup,
  getRandomSlotFromMatchup,
  getTournamentSlotsFromFirstRoundSize,
  matchupHasTwoEmptySlots,
  slotIsFirstRoundSlot
} from "./tournament-slot-assignment.units.js";



export function autoAssignUnassignedPlayers(comp: ActivePoolComp): Slot[] {

  const { registeredPlayers, slots } = comp
  let updatedSlots: Slot[] = _.cloneDeep(slots);
  getUnassignedPlayers(registeredPlayers, slots).forEach(player => {
    updatedSlots = assignPlayer({ ...comp, slots: updatedSlots }, player.id);
  })
  return updatedSlots;
}

export function assignPlayer(comp: ActivePoolComp, playerId: string): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(comp.slots);
  const matchupsWithAnAvailableSlot = getMatchupsWithAnAvailableSlot(updatedSlots)
  let availableSlot: Slot
  if (matchupsWithAnAvailableSlot.some(matchupHasTwoEmptySlots)) {
    const matchup = getRandomMatchup(matchupsWithAnAvailableSlot.filter(matchupHasTwoEmptySlots));
    availableSlot = getRandomSlotFromMatchup(matchup);
  } else {
    const matchup = getRandomMatchup(matchupsWithAnAvailableSlot);
    availableSlot = matchup.slot1.playerId ? matchup.slot2 : matchup.slot1;
  }
  clearSlotsAutoAdvance(availableSlot!, updatedSlots)
  updatedSlots.find(slot => {
    if (slot.id === availableSlot.id)
      return slot.playerId = playerId;
  })

  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots;
}

export function randomiseAllMatchups(comp: ActivePoolComp): Slot[] {
  const newFirstRoundSize = getFirstRoundSize(comp.registeredPlayers.length);
  const slots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize); return autoAssignUnassignedPlayers({ ...comp, slots })

}

export function removePlayerFromSlots(comp: ActivePoolComp, playerId: string): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(comp.slots);
  clearPlayerFromTournament(playerId, updatedSlots)
  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots
}


export function handleManualAssignPlayerToSlot(comp: ActivePoolComp, slotId: number, playerId: string, autoAssignPlayers: boolean): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(comp.slots);
  const targetSlot = updatedSlots.find(slot => slot.id === slotId)
  if (slotIsFirstRoundSlot(slotId, updatedSlots)) {
    const playerAlreadyInSlot = targetSlot?.playerId
    if (playerAlreadyInSlot)
      clearPlayerFromTournament(playerAlreadyInSlot, updatedSlots)


    clearPlayerFromTournament(playerId, updatedSlots)

    clearSlotsAutoAdvance(targetSlot!, updatedSlots)
    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return slot.playerId = playerId

    })
    if (playerAlreadyInSlot && autoAssignPlayers)
      updatedSlots = assignPlayer({ ...comp, slots: updatedSlots }, playerAlreadyInSlot)


  } else {

    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return slot.playerId = playerId
    })
  }
  return updatedSlots
}
