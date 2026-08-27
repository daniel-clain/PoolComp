import type { Matchup, PoolComp, RegisteredPlayer, Slot } from "../../../../shared/domain.js";

import _ from "lodash";

import { getKnownRegisteredPlayers } from "../../../../shared/pool-comp.service.js";
import { getPlayersInTournament, getSecondChancePlayersPool, getUnassignedPlayers, slotCanBeChangedWithoutClearingMatchResult } from "../../../../shared/tournament-slot.service.js";

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
  mapTournamentSlotsToNextRoundSize,
  matchupHasTwoEmptySlots,
  slotIsFirstRoundSlot,
  tournamentNeedsSizeIncrease
} from "./tournament-slot-assignment.units.js";



export function autoAssignUnassignedPlayers(comp: PoolComp, isSecondChanceComp: boolean, compHistory: PoolComp[]): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);
  const unassignedPlayers = getUnassignedPlayers(comp, isSecondChanceComp, compHistory);
  console.log(`unassignedPlayers: ${JSON.stringify(unassignedPlayers)}`);
  unassignedPlayers.forEach(player => {
    updatedSlots = assignPlayer({ ...comp, ...(isSecondChanceComp ? { secondChanceSlots: updatedSlots } : { slots: updatedSlots }) }, player, isSecondChanceComp);
  })
  return updatedSlots;
}

export function assignPlayer(comp: PoolComp, player: RegisteredPlayer, isSecondChanceComp: boolean): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);

  applyByeToEmptyFirstRoundSlots(updatedSlots)
  console.log(`assigning player ${player.name}`);
  const matchupsWithAnAvailableSlot = getMatchupsWithAnAvailableSlot(updatedSlots)
  let availableSlot: Slot
  if (matchupsWithAnAvailableSlot.some(matchupHasTwoEmptySlots)) {
    const matchup = getRandomMatchup(matchupsWithAnAvailableSlot.filter(matchupHasTwoEmptySlots));
    availableSlot = getRandomSlotFromMatchup(matchup);
  } else {
    const matchup = getRandomMatchup(matchupsWithAnAvailableSlot);
    if (!matchup) {
      console.log(`no matchup found`);
    }
    console.log(`matchup: ${JSON.stringify(matchup)}`);
    availableSlot = matchup.slot1.player?.id ? matchup.slot2 : matchup.slot1;
  }
  clearSlotsAutoAdvance(availableSlot!, updatedSlots)
  updatedSlots.find(slot => {
    if (slot.id === availableSlot.id)
      return slot.player = player;
  })

  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots;
}

export function getOtherSlot(slot: Slot, matchup: Matchup): Slot {
  return matchup.slot1.id === slot.id ? matchup.slot2 : matchup.slot1;
}

export function randomiseAllMatchups(comp: PoolComp, isSecondChanceComp: boolean, compHistory: PoolComp[]): Slot[] {
  const players = isSecondChanceComp
    ? getSecondChancePlayersPool(comp, compHistory)
    : getKnownRegisteredPlayers(comp);
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

export function refreshSecondChanceSlots(comp: PoolComp, compHistory: PoolComp[]): Slot[] {
  let updatedSecondChanceSlots: Slot[] = _.cloneDeep(comp.secondChanceSlots!);
  const secondChancePlayersPool = getSecondChancePlayersPool(comp, compHistory);

  removePlayersWhoAreNoLongerInTheSecondChancePool();

  if (tournamentNeedsSizeIncrease(secondChancePlayersPool, updatedSecondChanceSlots)) {
    updatedSecondChanceSlots = mapTournamentSlotsToNextRoundSize(secondChancePlayersPool, updatedSecondChanceSlots);
  }

  return autoAssignUnassignedPlayers(
    { ...comp, secondChanceSlots: updatedSecondChanceSlots },
    true,
    compHistory,
  );

  function removePlayersWhoAreNoLongerInTheSecondChancePool() {
    const playersNoLongerInThePool = getPlayersInTournament(updatedSecondChanceSlots)
      .filter(player => !secondChancePlayersPool.some(poolPlayer => poolPlayer.id === player.id));

    if (!playersNoLongerInThePool.length) return;

    playersNoLongerInThePool.forEach(player => clearPlayerFromTournament(player, updatedSecondChanceSlots));
    applyByeToEmptyFirstRoundSlots(updatedSecondChanceSlots);
    autoAdvanceByeMatchups(updatedSecondChanceSlots);
  }
}

export function removePlayerFromSlots(comp: PoolComp, player: RegisteredPlayer): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(comp.slots);
  clearPlayerFromTournament(player, updatedSlots)
  applyByeToEmptyFirstRoundSlots(updatedSlots)
  autoAdvanceByeMatchups(updatedSlots)

  return updatedSlots
}

export function handleManualAssignPlayerToSlot(comp: PoolComp, slotId: number, player: RegisteredPlayer | undefined, autoAssignPlayers: boolean, isSecondChanceComp: boolean): Slot[] {
  let updatedSlots: Slot[] = _.cloneDeep(isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!);
  const targetSlot = updatedSlots.find(slot => slot.id === slotId)
  if (!targetSlot) {
    throw "Slot not found";
  }
  if (targetSlot.player?.id === player?.id) {
    return updatedSlots;
  }
  if (!slotCanBeChangedWithoutClearingMatchResult(targetSlot, updatedSlots)) {
    throw "Slot cannot be changed because a later matchup has already been assigned";
  }
  if (slotIsFirstRoundSlot(slotId, updatedSlots)) {
    const playerAlreadyInSlot = targetSlot?.player
    if (playerAlreadyInSlot)
      clearPlayerFromTournament(playerAlreadyInSlot, updatedSlots)


    player && clearPlayerFromTournament(player, updatedSlots)

    clearSlotsAutoAdvance(targetSlot, updatedSlots)
    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return slot.player = player

    })
    if (playerAlreadyInSlot && autoAssignPlayers)
      updatedSlots = assignPlayer(
        {
          ...comp,
          ...(isSecondChanceComp ? { secondChanceSlots: updatedSlots } : { slots: updatedSlots }),
        },
        playerAlreadyInSlot,
        isSecondChanceComp,
      )
    else {
      applyByeToEmptyFirstRoundSlots(updatedSlots)
      autoAdvanceByeMatchups(updatedSlots)

    }


  } else {

    updatedSlots.find(slot => {
      if (slot.id === slotId)
        return player ? slot.player = player : delete slot.player
    })
  }
  return updatedSlots
}
