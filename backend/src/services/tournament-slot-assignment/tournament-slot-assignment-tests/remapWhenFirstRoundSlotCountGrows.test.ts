
import { describe, expect, test } from "vitest";
import { getFirstRoundSlotsFromAllTournamentSlots } from "../../../../../shared/tournament-slot.service.js";
import { getTournamentSlotsFromFirstRoundSize, remapWhenFirstRoundSlotCountGrows } from "../tournament-slot-assignment.units";
describe("remapWhenFirstRoundSlotCountGrows", function () {
  test("on remap, expect the new 3rd slot playerid to be the same as the 2nd slot playerid", function () {
    const existingSlots = getTournamentSlotsFromFirstRoundSize(8)
    const existingFirstRoundSlots =
      getFirstRoundSlotsFromAllTournamentSlots(existingSlots)
    existingFirstRoundSlots.forEach((slot, index) => {
      slot.playerId = `player${index + 1}`
    })
    const newSlots = getTournamentSlotsFromFirstRoundSize(16)

    remapWhenFirstRoundSlotCountGrows(existingSlots, newSlots);

    const newFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(newSlots);

    expect(newFirstRoundSlots[2]!.playerId).toBe(existingFirstRoundSlots[1]!.playerId);
  })
})
