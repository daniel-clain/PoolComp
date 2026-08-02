import { describe, expect, test } from "vitest";
import { getSlotTier } from "../../../../../shared/tournament-slot.service";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units";

describe("getSlotTier", function () {
  const tournamentSlots = getTournamentSlotsFromFirstRoundSize(32);
  test("slot id 0 should be tier 0", function () {
    expect(getSlotTier({ id: 0 }, tournamentSlots)).toBe(0);
  })
  test("slot id 2 should be tier 1", function () {
    expect(getSlotTier({ id: 2 }, tournamentSlots)).toBe(1);
  })
  test("slot id 3 should be tier 2", function () {
    expect(getSlotTier({ id: 3 }, tournamentSlots)).toBe(2);
  })
  test("slot id 6 should be tier 2", function () {
    expect(getSlotTier({ id: 6 }, tournamentSlots)).toBe(2);
  })
  test("slot id 7 should be tier 3", function () {
    expect(getSlotTier({ id: 7 }, tournamentSlots)).toBe(3);
  })
  test("slot id 14 should be tier 3", function () {
    expect(getSlotTier({ id: 14 }, tournamentSlots)).toBe(3);
  })
  test("slot id 15 should be tier 4", function () {
    expect(getSlotTier({ id: 15 }, tournamentSlots)).toBe(4);
  })
  test("slot id 30 should be tier 4", function () {
    expect(getSlotTier({ id: 30 }, tournamentSlots)).toBe(4);
  })
  test("slot id 31 should be tier 5", function () {
    expect(getSlotTier({ id: 31 }, tournamentSlots)).toBe(5);
  })

})