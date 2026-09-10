import { describe, expect, test } from "vitest";

import type { PoolComp, RegisteredPlayer } from "../../../../../shared/domain.js";
import {
  getFirstRoundSlotsFromAllTournamentSlots,
  slotCanBeChangedWithoutUndoingALaterMatchResult,
} from "../../../../../shared/tournament-slot.service.js";
import { handleManualAssignPlayerToSlot } from "../tournament-slot-assignment.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

function createComp(players: RegisteredPlayer[], firstRoundSize = 4): PoolComp {
  return {
    id: "comp",
    date: new Date().toISOString(),
    registeredPlayers: players,
    slots: getTournamentSlotsFromFirstRoundSize(firstRoundSize),
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

  test("cannot change a slot after its player has advanced again through a real match", function () {
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

    expect(slotCanBeChangedWithoutUndoingALaterMatchResult(comp.slots[1]!, comp.slots)).toBe(false);
    expect(() =>
      handleManualAssignPlayerToSlot(comp, 1, kim, false, false),
    ).toThrow("Slot cannot be changed because a later matchup has already been assigned");
  });

  test("can change a bye when the next round slot is empty", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const comp = createComp([kim, monique]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeSlot = firstRoundSlots[0]!;
    const kimSlot = firstRoundSlots[1]!;

    byeSlot.isBye = true;
    kimSlot.player = kim;

    expect(slotCanBeChangedWithoutUndoingALaterMatchResult(byeSlot, comp.slots)).toBe(true);

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

  test("can change a bye when the next round player is only bye auto-advance", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const comp = createComp([kim, monique]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeSlot = firstRoundSlots[0]!;

    byeSlot.isBye = true;
    firstRoundSlots[1]!.player = kim;
    comp.slots[1]!.player = kim;

    expect(slotCanBeChangedWithoutUndoingALaterMatchResult(byeSlot, comp.slots)).toBe(true);

    const updatedSlots = handleManualAssignPlayerToSlot(
      comp,
      byeSlot.id,
      monique,
      false,
      false,
    );

    expect(updatedSlots.find(slot => slot.id === byeSlot.id)?.player).toEqual(monique);
    expect(updatedSlots.find(slot => slot.id === firstRoundSlots[1]!.id)?.player).toEqual(kim);
    expect(updatedSlots[1]?.player).toBeUndefined();
  });

  test("can change a bye through a chain of bye auto-advances", function () {
    const daniel = createRegisteredPlayer("Daniel");
    const monique = createRegisteredPlayer("Monique");
    const comp = createComp([daniel, monique], 4);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeAgainstDaniel = firstRoundSlots[0]!;
    const danielSlot = firstRoundSlots[1]!;

    byeAgainstDaniel.isBye = true;
    danielSlot.player = daniel;
    firstRoundSlots[2]!.isBye = true;
    firstRoundSlots[3]!.isBye = true;
    comp.slots[1]!.player = daniel;
    comp.slots[2]!.isBye = true;
    comp.slots[0]!.player = daniel;

    expect(
      slotCanBeChangedWithoutUndoingALaterMatchResult(byeAgainstDaniel, comp.slots),
    ).toBe(true);
    expect(
      slotCanBeChangedWithoutUndoingALaterMatchResult(danielSlot, comp.slots),
    ).toBe(true);

    const updatedSlots = handleManualAssignPlayerToSlot(
      comp,
      byeAgainstDaniel.id,
      monique,
      false,
      false,
    );

    expect(updatedSlots.find(slot => slot.id === byeAgainstDaniel.id)?.player).toEqual(monique);
    expect(updatedSlots.find(slot => slot.id === danielSlot.id)?.player).toEqual(daniel);
    expect(updatedSlots[1]?.player).toBeUndefined();
    expect(updatedSlots[0]?.player).toBeUndefined();
  });

  test("cannot change a bye after the auto-advanced player wins a real later match", function () {
    const kim = createRegisteredPlayer("Kim");
    const monique = createRegisteredPlayer("Monique");
    const charlie = createRegisteredPlayer("Charlie");
    const comp = createComp([kim, monique, charlie]);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(comp.slots);
    const byeSlot = firstRoundSlots[0]!;

    byeSlot.isBye = true;
    firstRoundSlots[1]!.player = kim;
    firstRoundSlots[2]!.player = monique;
    firstRoundSlots[3]!.player = charlie;
    comp.slots[1]!.player = kim;
    comp.slots[2]!.player = monique;
    comp.slots[0]!.player = kim;

    expect(slotCanBeChangedWithoutUndoingALaterMatchResult(byeSlot, comp.slots)).toBe(false);
    expect(() =>
      handleManualAssignPlayerToSlot(comp, byeSlot.id, charlie, false, false),
    ).toThrow("Slot cannot be changed because a later matchup has already been assigned");
  });
});
