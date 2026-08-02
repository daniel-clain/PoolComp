import { describe, expect, test } from "vitest";
import { getSlotsNextRoundSlot } from "../../../../../shared/tournament-slot.service";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units";

describe("getSlotsNextRoundSlot", function () {
  const tournamentSlots = getTournamentSlotsFromFirstRoundSize(32);

  test("slot id 5 should return slot id 2", function () {
    expect(getSlotsNextRoundSlot({ id: 5 }, tournamentSlots)).toEqual({ id: 2 });
  })
  test("slot id 7 should return slot id 3", function () {
    expect(getSlotsNextRoundSlot({ id: 7 }, tournamentSlots)).toEqual({ id: 3 });
  })
  test("slot id 8 should return slot id 3", function () {
    expect(getSlotsNextRoundSlot({ id: 8 }, tournamentSlots)).toEqual({ id: 3 });
  })
  test("slot id 18 should return slot id 8", function () {
    expect(getSlotsNextRoundSlot({ id: 18 }, tournamentSlots)).toEqual({ id: 8 });
  })

  test("slot id 0 should return undefined", function () {
    expect(getSlotsNextRoundSlot({ id: 0 }, tournamentSlots)).toBeUndefined();
  })



})