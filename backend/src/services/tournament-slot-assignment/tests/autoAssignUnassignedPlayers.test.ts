import { describe, expect, test } from "vitest";
import type { PoolComp, RegisteredPlayer, Slot } from "../../../../../shared/domain.js";
import { autoAssignUnassignedPlayers } from "../tournament-slot-assignment.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

describe("autoAssignUnassignedPlayers", function () {
  test("does not place a late player into a bye path that already has a resolved player versus player result", function () {
    const slots: Slot[] = getTournamentSlotsFromFirstRoundSize(16)

    const firstRoundPlayerNames = [
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

    firstRoundPlayerNames.forEach((playerName, index) => {
      const firstRoundSlot = slots[15 + index]!
      if (playerName) {
        firstRoundSlot.player = createRegisteredPlayer(playerName)
      }
    })

    slots[7]!.player = createRegisteredPlayer("Maria")
    slots[8]!.player = createRegisteredPlayer("Daniel")
    slots[9]!.player = createRegisteredPlayer("Kat")
    slots[10]!.player = createRegisteredPlayer("Alan")
    slots[13]!.player = createRegisteredPlayer("Jason")
    slots[14]!.player = createRegisteredPlayer("Greg")
    slots[3]!.player = createRegisteredPlayer("Daniel")
    slots[6]!.player = createRegisteredPlayer("Greg")

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
    ].map(createRegisteredPlayer)

    const activePoolComp: PoolComp = {
      id: "active",
      date: "2026-05-06",
      slots,
      registeredPlayers,
    }

    const updatedSlots = autoAssignUnassignedPlayers(activePoolComp, false, [])
    const firstRoundSlots = updatedSlots.slice(15)

    const alanMatchupSlots = [firstRoundSlots[6], firstRoundSlots[7]]
    const gregMatchupSlots = [firstRoundSlots[14], firstRoundSlots[15]]

    const latePlayerAssignedToAlanMatchup = alanMatchupSlots.some(
      (slot) => slot?.player?.id === "LatePlayer",
    )
    const latePlayerAssignedToGregMatchup = gregMatchupSlots.some(
      (slot) => slot?.player?.id === "LatePlayer",
    )

    expect(latePlayerAssignedToAlanMatchup).toBe(true)
    expect(latePlayerAssignedToGregMatchup).toBe(false)
  });
});
