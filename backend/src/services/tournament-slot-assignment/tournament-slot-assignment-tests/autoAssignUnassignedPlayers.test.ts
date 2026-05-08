import { describe, expect, test } from "vitest";
import type { PoolComp, RegisteredPlayer, Slot } from "../../../../../shared/domain.js";
import { autoAssignUnassignedPlayers } from "../tournament-slot-assignment.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";



describe("autoAssignUnassignedPlayers", function () {
  test("does not place a late player into a bye path that already has a resolved player versus player result", function () {
    const slots: Slot[] = getTournamentSlotsFromFirstRoundSize(16)

    const firstRoundPlayerIds = [
      "Maria",
      "Chris",
      "Daniel",
      "Steve",
      "Kat",
      "Mel",
      "Alan",
      undefined,
      "George",
      "Peter",
      "Kim",
      "Darren",
      "Jason",
      "Mitch",
      "Greg",
      undefined,
    ]

    firstRoundPlayerIds.forEach((playerId, index) => {
      const firstRoundSlot = slots[15 + index]!
      if (playerId) {
        firstRoundSlot.playerId = playerId
      }
    })

    slots[7]!.playerId = "Maria"
    slots[8]!.playerId = "Daniel"
    slots[9]!.playerId = "Kat"
    slots[10]!.playerId = "Alan"
    slots[13]!.playerId = "Jason"
    slots[14]!.playerId = "Greg"
    slots[3]!.playerId = "Daniel"
    slots[6]!.playerId = "Greg"

    const registeredPlayers: RegisteredPlayer[] = [
      "Maria",
      "Chris",
      "Daniel",
      "Kat",
      "Mel",
      "Alan",
      "George",
      "Peter",
      "Kim",
      "Darren",
      "Jason",
      "Mitch",
      "Greg",
      "LatePlayer",
    ].map(playerId => ({ playerId, paid: true }))

    const activePoolComp: PoolComp = {
      id: "active",
      date: new Date("2026-05-06T10:00:00.000Z"),
      slots,
      registeredPlayers,
    }

    const updatedSlots = autoAssignUnassignedPlayers(activePoolComp)
    const firstRoundSlots = updatedSlots.slice(15)

    const alanMatchupSlots = [firstRoundSlots[6], firstRoundSlots[7]]
    const gregMatchupSlots = [firstRoundSlots[14], firstRoundSlots[15]]

    const latePlayerAssignedToAlanMatchup = alanMatchupSlots.some(
      (slot) => slot?.playerId === "LatePlayer",
    )
    const latePlayerAssignedToGregMatchup = gregMatchupSlots.some(
      (slot) => slot?.playerId === "LatePlayer",
    )

    expect(latePlayerAssignedToAlanMatchup).toBe(true)
    expect(latePlayerAssignedToGregMatchup).toBe(false)
  });
});
