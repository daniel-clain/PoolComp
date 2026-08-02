import orderBy from "lodash/orderBy.js";
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
  return roundHasWonMatchup(getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots))

  function roundHasWonMatchup(thisRoundSlots: Slot[]): boolean {
    if (thisRoundSlots.length < 2) return false;

    const matchups = thisRoundSlots.reduce((acc, slot, index, slots) => {
      if (index % 2 === 0) {
        acc.push({ slot1: slot, slot2: slots[index + 1]! })
      }
      return acc
    }, [] as Matchup[])

    const aMatchHasBeenWon = matchups.some(matchup => {
      const isByeMatchup = (matchup.slot1.isBye || matchup.slot2.isBye)
      return isByeMatchup ? false : getMatchupWinner(matchup, tournamentSlots)
    })
    if (aMatchHasBeenWon) return true;

    return roundHasWonMatchup(getNextRoundSlots(thisRoundSlots, tournamentSlots))
  }
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
  return tournamentSlots.some(slot => slot.player)
}


export function getSlotsNextRoundSlot(slot: Slot, tournamentSlots: Slot[]): Slot | undefined {
  return tournamentSlots.find(({ id }) => id === Math.floor((slot.id - 1) / 2))
}


export function getSlotsMatchup(slot: Slot, tournamentSlots: Slot[]): Matchup {
  if (slot.id === 0) {
    throw 'Slot 0 should not be called';
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

export function getMatchupWinner(matchup: Matchup, tournamentSlots: Slot[]): RegisteredPlayer | undefined {

  const winner = getMatchupNextRoundSlot(matchup, tournamentSlots).player;
  return winner;
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

  return bracketPlayers.filter(player => !slots.some(slot => slot.player?.id === player.id));
}

export function getSecondChancePlayersPool(comp: PoolComp, compHistory: PoolComp[]): RegisteredPlayer[] {

  const playersWhoLostTheirFirstGame = comp.registeredPlayers.filter(lostTheirFirstGame);

  const secondChancePlayersPool = playersWhoLostTheirFirstGame.filter(haventWonRecently);
  console.log(`secondChancePlayersPool: `, secondChancePlayersPool);
  return secondChancePlayersPool;

  function lostTheirFirstGame(player: RegisteredPlayer): boolean {
    const playersSlots = orderBy(comp.slots.filter(slot => slot.player?.id === player.id), 'id', 'desc')
    const playersSlot = playersSlots.find(slot => {
      const matchup = getSlotsMatchup(slot, comp.slots)
      const otherSlot = matchup.slot1.player?.id === player.id ? matchup.slot2 : matchup.slot1
      return otherSlot.player?.id
    })
    if (!playersSlot) return false;
    const winnerSlot = getSlotsNextRoundSlot(playersSlot, comp.slots)
    const lostTheirFirstGame = winnerSlot?.player?.id ? winnerSlot.player?.id !== player.id : false;
    return lostTheirFirstGame
  }

  function haventWonRecently(player: RegisteredPlayer): boolean {
    const recentWin = compHistory.find(historicalComp => {
      const orderedSlots: Slot[] = orderBy(historicalComp.slots, 'id');
      const [winner] = orderedSlots
      const hasWon = winner?.player?.id === player.id
      console.log(player.name, player.id, `has won recently`, orderedSlots, new Date(historicalComp.date).toISOString());
      return hasWon;
    });
    return !recentWin;
  }
}