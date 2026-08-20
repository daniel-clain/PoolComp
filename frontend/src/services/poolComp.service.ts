import orderBy from "lodash/orderBy";
import {
  type Player,
  type PoolComp,
  type Slot
} from "../../../shared/domain";

import { getSlotSourceMatchup, slotCanBeChangedWithoutClearingMatchResult } from "../../../shared/tournament-slot.service";

export function canSetSlot(slot: Slot, slots: Slot[]): boolean {
  if (!slotCanBeChangedWithoutClearingMatchResult(slot, slots)) {
    return false;
  }

  const sourceMatchup = getSlotSourceMatchup(slot, slots)

  return !sourceMatchup || (Boolean(sourceMatchup?.slot1.player?.id) && Boolean(sourceMatchup?.slot2.player?.id));
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
      if (id === slot1.player?.id || id === slot2.player?.id) {
        acc.push({ player: bracketPlayers.find((player) => player.id === id)! })
      }
      return acc
    }, [] as PlayerChoice[])
  }
  const { unassignedPlayers, assignedPlayers } = bracketPlayers.reduce((acc, { id }) => {
    const player = bracketPlayers.find((player) => player.id === id)!
    if (slots.some(slot => slot.player?.id === id)) {
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



export function activePoolCompHasChampionPlayer(comp: PoolComp): boolean {
  if (!tournamentHasChampionPlayer(comp.slots)) return false;
  if (comp.secondChanceSlots && !tournamentHasChampionPlayer(comp.secondChanceSlots)) return false;
  return true;
  function tournamentHasChampionPlayer(slots: Slot[]): boolean {
    if (!slots.length) return false;
    const [firstPlaceSlot] = slots;
    return Boolean(firstPlaceSlot.player?.id);
  }
}

export function getFinalists(comp: PoolComp): {
  firstPlace: Player | undefined;
  secondPlace: Player | undefined;
} {
  const [firstPlaceSlot, finalistSlot1, finalistSlot2] = comp.slots;
  if (!firstPlaceSlot || !finalistSlot1 || !finalistSlot2) {
    return { firstPlace: undefined, secondPlace: undefined };
  }

  const secondPlaceSlot =
    firstPlaceSlot.player?.id === finalistSlot1.player?.id
      ? finalistSlot2
      : finalistSlot1;

  return {
    firstPlace: firstPlaceSlot.player,
    secondPlace: secondPlaceSlot.player,
  };
}



export { calculateFirstPrizeMoney } from "../../../shared/prize-money.service";

