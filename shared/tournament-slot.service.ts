import type { Matchup, PoolComp, RegisteredPlayer, Slot } from "./domain.js";

export function getSlotSourceMatchup(slot: Slot, tournamentSlots: Slot[]): Matchup | undefined {
  const [slot1, slot2] = tournamentSlots.filter(s => s.id === slot.id * 2 + 1 || s.id === slot.id * 2 + 2)
  return slot1 && slot2 ? { slot1, slot2 } : undefined;
}

export function getFirstRoundSlotsFromAllTournamentSlots(
  allTournamentSlots: Slot[],
): Slot[] {
  const firstRoundSize = (allTournamentSlots.length + 1) / 2
  return allTournamentSlots.slice(-firstRoundSize)
}

export function getFirstRoundMatchupsFromAllTournamentSlots(
  allTournamentSlots: Slot[],
): Matchup[] {
  return getFirstRoundSlotsFromAllTournamentSlots(allTournamentSlots).reduce((acc, slot, index, firstRoundSlots) => {
    if (index % 2 === 0) {
      acc.push({ slot1: slot, slot2: firstRoundSlots[index + 1]! })
    }
    return acc
  }, [] as Matchup[])
}


export function getMatchupNextRoundSlot(matchup: Matchup, tournamentSlots: Slot[]): Slot {

  return getSlotsNextRoundSlot(matchup.slot1, tournamentSlots)!;
}

export function compStarted(tournamentSlots: Slot[]): boolean {
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots)

  for (let i = 0; i < firstRoundSlots.length; i += 2) {
    const slot1 = firstRoundSlots[i]!;
    const slot2 = firstRoundSlots[i + 1]!;
    const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots)
    if (slot1.playerId && slot2.playerId && nextRoundSlot?.playerId) {
      return true;
    }
  }
  return false;
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


export function tournamentHasHadAssignment(tournamentSlots: Slot[]): boolean {
  return tournamentSlots.some(slot => slot.playerId)
}


export function getSlotsNextRoundSlot(slot: Slot, tournamentSlots: Slot[]): Slot | undefined {
  return tournamentSlots.find(({ id }) => id === Math.floor((slot.id - 1) / 2))
}


export function getSlotsMatchup(slot: Slot, tournamentSlots: Slot[]): Matchup | undefined {
  if (slot.id === 0) {
    return undefined;
  }

  const idIsOdd = slot.id % 2 === 1;
  if (idIsOdd) {
    return {
      slot1: slot,
      slot2: tournamentSlots.find(({ id }) => id === slot.id + 1)!,
    }
  } else {
    return {
      slot1: tournamentSlots.find(({ id }) => id === slot.id - 1)!,
      slot2: slot,
    }
  }
}



export function getSlotTier(slot: Slot, tournamentSlots: Slot[]): number {
  void tournamentSlots;
  return Math.floor(Math.log2(slot.id + 1));
}

export function getUnassignedPlayers(
  comp: PoolComp,
  isSecondChanceComp: boolean,
  compHistory: PoolComp[]
): RegisteredPlayer[] {
  const slots = isSecondChanceComp ? comp.secondChanceSlots! : comp.slots!;
  const bracketPlayers = isSecondChanceComp ? getSecondChancePlayersPool(comp, compHistory) : comp.registeredPlayers;
  console.log(`bracketPlayers: `, bracketPlayers);
  return bracketPlayers.filter(player => !slots.some(slot => slot.playerId === player.id));
}

export function getSecondChancePlayersPool(comp: PoolComp, compHistory: PoolComp[]): RegisteredPlayer[] {
  return comp.registeredPlayers.filter(player => {

    const lostTheirFirstGame = comp.slots.some(slot => {
      if (slot.playerId != player.id) {
        return false;
      }

      const playersSlot = slot
      const playersFirstMatchup = getSlotsMatchup(playersSlot, comp.slots)
      if (!playersFirstMatchup) return false;
      const otherSlot = playersFirstMatchup.slot1.playerId === player.id ? playersFirstMatchup.slot2 : playersFirstMatchup.slot1
      if (!otherSlot.playerId) {
        return false;
      }

      const winnerSlot = getSlotsNextRoundSlot(playersSlot, comp.slots)
      const lostTheirFirstGame = winnerSlot?.playerId == otherSlot.playerId
      return lostTheirFirstGame

    })

    const hasntWonRecently = !compHistory.some(comp => {
      const [winner] = comp.slots
      return winner?.playerId === player.id
    })

    const isInSecondChancePool = lostTheirFirstGame && hasntWonRecently
    isInSecondChancePool && console.log(`${player.name} is in second chance pool`)
    return isInSecondChancePool
  })
}