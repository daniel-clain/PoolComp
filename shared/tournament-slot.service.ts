import type { Matchup, Slot } from "./domain";


export function getSlotSourceMatchup(slot: Slot, tournamentSlots: Slot[]): Matchup | undefined {
    const [slot1, slot2] = tournamentSlots.filter(s => s.id === slot.id * 2 + 1 || s.id === slot.id * 2 + 2)
    return slot1 && slot2 ? { slot1, slot2 } : undefined;
}