import orderBy from "lodash/orderBy";
import type { RefObject } from "react";
import {
  type Player,
  type PoolComp,
  type Slot
} from "../../../shared/domain";

import type { MessageToBackend } from "../../../shared/messageToBackend";
import { poolCompConfig } from "../../../shared/poolCompConfig";
import { getFirstRoundSlotsFromAllTournamentSlots, getSlotSourceMatchup, tournamentHasHadAssignment } from "../../../shared/tournament-slot.service";

export function canSetSlot(slot: Slot, slots: Slot[]): boolean {

  const sourceMatchup = getSlotSourceMatchup(slot, slots)

  return !sourceMatchup || (Boolean(sourceMatchup?.slot1.playerId) && Boolean(sourceMatchup?.slot2.playerId));
}

export type PlayerChoice = {
  player: Player;
  isUnassigned?: boolean;
}

export function getPlayerChoicesForSlot(
  { selectedSlot, slots, bracketPlayers }: {
    selectedSlot: Slot,
    slots: Slot[],
    bracketPlayers: Player[]
  },
): PlayerChoice[] {
  const sourceMatchup = getSlotSourceMatchup(selectedSlot, slots)
  if (sourceMatchup) {
    const { slot1, slot2 } = sourceMatchup
    return bracketPlayers.reduce((acc, { id }) => {
      if (id === slot1.playerId || id === slot2.playerId) {
        acc.push({ player: bracketPlayers.find((player) => player.id === id)! })
      }
      return acc
    }, [] as PlayerChoice[])
  }
  const { unassignedPlayers, assignedPlayers } = bracketPlayers.reduce((acc, { id }) => {
    const player = bracketPlayers.find((player) => player.id === id)!
    if (slots.some(slot => slot.playerId === id)) {
      acc.assignedPlayers.push({ player })
    } else {
      acc.unassignedPlayers.push({ player, isUnassigned: true })
    }
    return acc
  }, { unassignedPlayers: [] as PlayerChoice[], assignedPlayers: [] as PlayerChoice[] })

  return [
    ...orderBy(unassignedPlayers, 'player.name'),
    ...orderBy(assignedPlayers, 'player.name')]
}


export function activePoolCompHasChampionPlayer(slots: Slot[]): boolean {
  if (!slots.length) return false
  const [firstPlaceSlot] = slots
  return Boolean(firstPlaceSlot.playerId)
}

export function getFinalists(comp: PoolComp, players: Player[]): {
  firstPlace: Player;
  secondPlace: Player;
} {
  const [firstPlaceSlot, finalistSlot1, finalistSlot2] = comp.slots

  const secondPlaceSlot = firstPlaceSlot.playerId === finalistSlot1.playerId ? finalistSlot2 : finalistSlot1

  const firstPlace = players.find((player) => player.id === firstPlaceSlot.playerId)!
  const secondPlace = players.find((player) => player.id === secondPlaceSlot.playerId)!

  return { firstPlace, secondPlace };
}


export function createPoolCompService(
  sendMessageToBackendRef: RefObject<
    ((message: MessageToBackend) => void) | null
  >,
) {

  function send(message: MessageToBackend) {
    sendMessageToBackendRef.current?.(message);
  }

  return {
    send,
  };
}

export function canAddMorePlayers(tournamentSlots: Slot[]): boolean {
  if (!tournamentHasHadAssignment(tournamentSlots)) {
    return true
  }
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)
  const currentPlayerIds = new Set(
    firstRoundSlots
      .map((slot) => slot.playerId)
      .filter((playerId): playerId is string => Boolean(playerId)),
  )

  if (currentPlayerIds.size === 0) {
    return true
  }

  const playersWithResolvedPlayerVersusPlayerMatchup = new Set<string>()

  for (const slot of tournamentSlots) {
    const sourceMatchup = getSlotSourceMatchup(slot, tournamentSlots)
    if (!sourceMatchup) {
      continue
    }

    if (!slot.playerId) {
      continue
    }

    const firstPlayerId = sourceMatchup.slot1.playerId
    const secondPlayerId = sourceMatchup.slot2.playerId
    if (!firstPlayerId || !secondPlayerId) {
      continue
    }

    playersWithResolvedPlayerVersusPlayerMatchup.add(firstPlayerId)
    playersWithResolvedPlayerVersusPlayerMatchup.add(secondPlayerId)
  }

  const everyCurrentPlayerHasResolvedPlayerVersusPlayerMatchup = Array.from(
    currentPlayerIds,
  ).every((playerId) =>
    playersWithResolvedPlayerVersusPlayerMatchup.has(playerId),
  )

  return !everyCurrentPlayerHasResolvedPlayerVersusPlayerMatchup
}


export function calculateFirstPrizeMoney(comp: PoolComp) {
  const { registeredPlayers } = comp
  return (
    (registeredPlayers.length * poolCompConfig.buyIn) *
    (1 - poolCompConfig.bigComp.contributionPercentage) +
    poolCompConfig.barInput
  );
}


export function calculateBigCompFirstPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {


  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)

  const mainCompFirstPlacePrizeMoney = roundToNearest5(mainCompPrizePool * poolCompConfig.bigComp.mainCompFirstPlacePercentage)

  return mainCompFirstPlacePrizeMoney

}

function calculateMainCompPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {

  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory)
  const mainCompPrizePool = roundToNearest5(totalBigCompPrizePool * poolCompConfig.bigComp.mainCompPercentage)
  return mainCompPrizePool
}

export function calculateBigCompSecondPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {


  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)
  const mainCompFirstPlacePrizeMoney = calculateBigCompFirstPrizeMoney(comp, compHistory)

  const mainCompSecondPlacePrizeMoney = mainCompPrizePool - mainCompFirstPlacePrizeMoney
  return mainCompSecondPlacePrizeMoney
}

export function calculateSecondChanceFirstPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number | undefined {

  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory)

  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)
  const secondChanceCompFirstPlacePrizeMoney = totalBigCompPrizePool - mainCompPrizePool


  return secondChanceCompFirstPlacePrizeMoney
}



function getAllCompsSinceLastBigComp(compHistory: PoolComp[]): PoolComp[] {
  const lastBigCompIndex = Math.max(compHistory.findIndex(
    poolComp => poolComp.secondChanceSlots && poolComp.secondChanceSlots.length > 0
  ), 4);
  return compHistory.slice(lastBigCompIndex + 1)
}

function getBigCompTotalPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {
  const normalFirstPlacePrizeMoney = calculateFirstPrizeMoney(comp)
  const compsSinceLastBigComp = getAllCompsSinceLastBigComp(compHistory)
  const bigCompFund = compsSinceLastBigComp.reduce((acc, comp) => acc + comp.registeredPlayers.length * poolCompConfig.buyIn * poolCompConfig.bigComp.contributionPercentage, 0)
  const totalBigCompPrizePool = bigCompFund + normalFirstPlacePrizeMoney
  return totalBigCompPrizePool
}



export function calculateCompBigCompContribution(comp: PoolComp): number {
  return ((comp.registeredPlayers.length * poolCompConfig.buyIn) *
    poolCompConfig.bigComp.contributionPercentage) - poolCompConfig.xmasCut
}


export function roundToNearest5(number: number): number {
  return Math.round(number / 5) * 5;
}
