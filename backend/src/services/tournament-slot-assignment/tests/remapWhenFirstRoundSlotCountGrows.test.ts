
import { describe, expect, test } from "vitest";
import { RegisteredPlayer } from "../../../../../shared/domain.js";
import { getFirstRoundSlotsFromAllTournamentSlots } from "../../../../../shared/tournament-slot.service.js";
import { getTournamentSlotsFromFirstRoundSize, remapWhenFirstRoundSlotCountGrows } from "../tournament-slot-assignment.units.js";
describe("remapWhenFirstRoundSlotCountGrows", function () {
  test("on remap, expect the new 3rd slot playerid to be the same as the 2nd slot playerid", function () {
    const existingSlots = getTournamentSlotsFromFirstRoundSize(8)
    const existingFirstRoundSlots =
      getFirstRoundSlotsFromAllTournamentSlots(existingSlots)
    existingFirstRoundSlots.forEach((slot, index) => {
      slot.player = { id: `player-${index + 1}`, name: `Player ${index + 1}` } as RegisteredPlayer;
    })
    const newSlots = getTournamentSlotsFromFirstRoundSize(16)

    remapWhenFirstRoundSlotCountGrows(existingSlots, newSlots);

    const newFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(newSlots);

    expect(newFirstRoundSlots[2]!.player?.id).toBe(existingFirstRoundSlots[1]!.player?.id);
  })
})
