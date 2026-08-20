import { describe, expect, test } from "vitest";

import type { PoolComp, RegisteredPlayer } from "../../../../../shared/domain.js";
import {
  getFirstRoundSlotsFromAllTournamentSlots,
  slotCanBeChangedWithoutClearingMatchResult,
} from "../../../../../shared/tournament-slot.service.js";
import { handleManualAssignPlayerToSlot } from "../tournament-slot-assignment.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

function createComp(players: RegisteredPlayer[]): PoolComp {
  return {
    id: "comp",
    date: new Date().toISOString(),
    registeredPlayers: players,
    slots: getTournamentSlotsFromFirstRoundSize(4),
  };
}

describe("manual slot changes", function () {
  test("can change a matchup winner when the following round slot is empty", function () {
    const mark = createRegisteredPlayer("Mark H");
    const daniel = createRegisteredPlayer("Daniel");
    const comp = createComp([mark, daniel]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);

    firstRoundSlots[0]!.player = mark;
    firstRoundSlots[1]!.player = daniel;
    comp.slots[1]!.player = mark;

    const updatedSlots = handleManualAssignPlayerToSlot(
      comp,
      1,
      daniel,
      false,
      false,
    );

    expect(updatedSlots[1]?.player).toEqual(daniel);
  });

  test("cannot change a slot after its player has advanced again", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const charlie = createRegisteredPlayer("Charlie");
    const comp = createComp([kim, monique, charlie]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);

    firstRoundSlots[0]!.player = kim;
    firstRoundSlots[1]!.player = monique;
    comp.slots[1]!.player = monique;
    comp.slots[2]!.player = charlie;
    comp.slots[0]!.player = monique;

    expect(slotCanBeChangedWithoutClearingMatchResult(comp.slots[1]!, comp.slots)).toBe(false);
    expect(() =>
      handleManualAssignPlayerToSlot(comp, 1, kim, false, false),
    ).toThrow("Slot cannot be changed because a later matchup has already been assigned");
  });

  test("can change a slot when the next round slot has no player", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const comp = createComp([kim, monique]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeSlot = firstRoundSlots[0]!;
    const kimSlot = firstRoundSlots[1]!;

    byeSlot.isBye = true;
    kimSlot.player = kim;

    expect(slotCanBeChangedWithoutClearingMatchResult(byeSlot, comp.slots)).toBe(true);

    const updatedSlots = handleManualAssignPlayerToSlot(
      comp,
      byeSlot.id,
      monique,
      false,
      false,
    );

    expect(updatedSlots.find(slot => slot.id === byeSlot.id)?.player).toEqual(monique);
    expect(updatedSlots[1]?.player).toBeUndefined();
  });

  test("cannot change a bye when the next round slot has a player", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const comp = createComp([kim, monique]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeSlot = firstRoundSlots[0]!;

    byeSlot.isBye = true;
    firstRoundSlots[1]!.player = kim;
    comp.slots[1]!.player = kim;

    expect(slotCanBeChangedWithoutClearingMatchResult(byeSlot, comp.slots)).toBe(false);
    expect(() =>
      handleManualAssignPlayerToSlot(comp, byeSlot.id, monique, false, false),
    ).toThrow("Slot cannot be changed because a later matchup has already been assigned");
  });
});
