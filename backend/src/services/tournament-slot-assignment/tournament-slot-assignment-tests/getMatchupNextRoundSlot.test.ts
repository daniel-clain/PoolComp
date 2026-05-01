import { describe, expect, test } from "vitest";
import type { Matchup } from "../../../../../shared/domain.js";
import {
  getMatchupNextRoundSlot,
  getTournamentSlotsFromFirstRoundSize,
} from "../tournament-slot-assignment.units.js";



describe("getMatchupNextRoundSlot", function () {
  test("next round slot for 7 and 8 is 3", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);

    const matchup: Matchup = {
      slot1: tournamentSlots.find((slot) => slot.id === 7)!,
      slot2: tournamentSlots.find((slot) => slot.id === 8)!,
    };
    expect(getMatchupNextRoundSlot(matchup, tournamentSlots).id).toBe(3);

  });

  test('last 2 slots in 16 player tournament should map to the last slot in the next round', function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(16);
    const last2Slots: Matchup = {
      slot1: tournamentSlots.slice(-2)[0]!,
      slot2: tournamentSlots.slice(-1)[0]!,
    }

    const lastSlotInNextRound = tournamentSlots.slice(0, -16).slice(-1)[0]!;
    expect(getMatchupNextRoundSlot(last2Slots, tournamentSlots)).toBe(lastSlotInNextRound);
  });
});