import { describe, expect, test } from "vitest";
import { getSlotsMatchup } from "../../../../../shared/tournament-slot.service";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units";

describe("getSlotsMatchup", function () {
  const tournamentSlots = getTournamentSlotsFromFirstRoundSize(32);

  test("slot id 5 should return matchup { slot1: { id: 5 }, slot2: { id: 6 } }", function () {
    expect(getSlotsMatchup({ id: 5 }, tournamentSlots)).toEqual({ slot1: { id: 5 }, slot2: { id: 6 } });
  })
  test("slot id 6 should return matchup { slot1: { id: 5 }, slot2: { id: 6 } }", function () {
    expect(getSlotsMatchup({ id: 6 }, tournamentSlots)).toEqual({ slot1: { id: 5 }, slot2: { id: 6 } });
  })
  test("slot id 7 should return matchup { slot1: { id: 7 }, slot2: { id: 8 } }", function () {
    expect(getSlotsMatchup({ id: 7 }, tournamentSlots)).toEqual({ slot1: { id: 7 }, slot2: { id: 8 } });
  })
  test("slot id 28 should return matchup { slot1: { id: 27 }, slot2: { id: 28 } }", function () {
    expect(getSlotsMatchup({ id: 28 }, tournamentSlots)).toEqual({ slot1: { id: 27 }, slot2: { id: 28 } });
  })
  test("slot id 0 should throw", function () {
    expect(() => getSlotsMatchup({ id: 0 }, tournamentSlots)).toThrow("Slot 0 should not be called");
  })
})