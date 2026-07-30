import type { PoolComp, Slot } from "../../../../shared/domain.js";

import _ from "lodash";

import { getSecondChancePlayersPool, getUnassignedPlayers } from "../../../../shared/tournament-slot.service.js";
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



export function autoAssignUnassignedPlayers(comp: PoolComp, isSecondChanceComp: boolean, compHistory: PoolComp[]): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);
  const unassignedPlayers = getUnassignedPlayers(comp, isSecondChanceComp, compHistory);
  console.log(`unassignedPlayers: ${JSON.stringify(unassignedPlayers)}`);
  unassignedPlayers.forEach(player => {
    updatedSlots = assignPlayer({ ...comp, ...(isSecondChanceComp ? { secondChanceSlots: updatedSlots } : { slots: updatedSlots }) }, player.id, isSecondChanceComp);
  })
  return updatedSlots;
}

export function assignPlayer(comp: PoolComp, playerId: string, isSecondChanceComp: boolean): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);
  console.log(`assigning player ${playerId} to slots: ${JSON.stringify(updatedSlots)}`);
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

export function randomiseAllMatchups(comp: PoolComp, isSecondChanceComp: boolean, compHistory: PoolComp[]): Slot[] {
  const players = isSecondChanceComp ? getSecondChancePlayersPool(comp, compHistory) : comp.registeredPlayers;
  const newFirstRoundSize = getFirstRoundSize(players.length);
  const slots = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize);
  if (isSecondChanceComp) {
    comp.secondChanceSlots = slots;
  } else {
    comp.slots = slots;
  }
  const assignedSlots = autoAssignUnassignedPlayers(comp, isSecondChanceComp, compHistory)
  console.log(`assignedSlots: ${JSON.stringify(assignedSlots)}`);
  return assignedSlots;
}

export function removePlayerFromSlots(comp: PoolComp, playerId: string): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(comp.slots);
  clearPlayerFromTournament(playerId, updatedSlots)
  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots
}

export function handleManualAssignPlayerToSlot(comp: PoolComp, slotId: number, playerId: string | undefined, autoAssignPlayers: boolean, isSecondChanceComp: boolean): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);
  const targetSlot = updatedSlots.find(slot => slot.id === slotId)
  if (slotIsFirstRoundSlot(slotId, updatedSlots)) {
    const playerAlreadyInSlot = targetSlot?.playerId
    if (playerAlreadyInSlot)
      clearPlayerFromTournament(playerAlreadyInSlot, updatedSlots)


    playerId && clearPlayerFromTournament(playerId, updatedSlots)

    clearSlotsAutoAdvance(targetSlot!, updatedSlots)
    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return slot.playerId = playerId

    })
    if (playerAlreadyInSlot && autoAssignPlayers)
      updatedSlots = assignPlayer({ ...comp, slots: updatedSlots }, playerAlreadyInSlot, isSecondChanceComp)
    else {
      applyByeToEmptyFirstRoundSlots(updatedSlots)
      autoAdvanceByeMatchups(updatedSlots)

    }


  } else {

    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return playerId ? slot.playerId = playerId : delete slot.playerId
    })
  }
  return updatedSlots
}
