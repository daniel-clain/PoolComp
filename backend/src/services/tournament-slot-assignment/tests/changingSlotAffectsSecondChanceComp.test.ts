import { describe, expect, test } from "vitest";

import type { PoolComp, RegisteredPlayer } from "../../../../../shared/domain.js";
import {
  changingSlotAffectsSecondChanceComp,
  getFirstRoundSlotsFromAllTournamentSlots,
} from "../../../../../shared/tournament-slot.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

function createBigComp(): PoolComp {
  return {
    id: "comp",
    date: new Date().toISOString(),
    registeredPlayers: [createRegisteredPlayer("Kim"), createRegisteredPlayer("Monique")],
    slots: getTournamentSlotsFromFirstRoundSize(4),
    secondChanceSlots: getTournamentSlotsFromFirstRoundSize(4),
  };
}

describe("changingSlotAffectsSecondChanceComp", function () {
  test("a main comp match result affects the second chance comp", function () {
    const comp = createBigComp();

    expect(changingSlotAffectsSecondChanceComp(comp, 1, false)).toBe(true);
  });

  test("a main comp first round seating change does not affect the second chance comp", function () {
    const comp = createBigComp();
    const [firstRoundSlot] = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);

    expect(changingSlotAffectsSecondChanceComp(comp, firstRoundSlot!.id, false)).toBe(false);
  });

  test("a second chance comp change does not affect the second chance comp pool", function () {
    const comp = createBigComp();

    expect(changingSlotAffectsSecondChanceComp(comp, 1, true)).toBe(false);
  });

  test("a comp without a second chance bracket is never affected", function () {
    const comp = createBigComp();
    delete comp.secondChanceSlots;

    expect(changingSlotAffectsSecondChanceComp(comp, 1, false)).toBe(false);
  });
});
