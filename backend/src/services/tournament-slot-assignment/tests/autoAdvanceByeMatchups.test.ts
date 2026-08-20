import { describe, expect, test } from "vitest";

import type { RegisteredPlayer } from "../../../../../shared/domain.js";
import { getFirstRoundSlotsFromAllTournamentSlots, getMatchupNextRoundSlot } from "../../../../../shared/tournament-slot.service.js";
import {
  applyByeToEmptyFirstRoundSlots,
  autoAdvanceByeMatchups,
  getTournamentSlotsFromFirstRoundSize,
} from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

describe("autoAdvanceByeMatchups", function () {
  test("auto advance players with bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.player = createRegisteredPlayer(`player${i + 1}`);
    });
    const [slot1, slot2] = firstRoundSlots;
    delete slot2!.player;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1: slot1!, slot2: slot2! }, tournamentSlots);

    expect(nextRoundSlot.player?.id).toBe(slot1!.player?.id);

  });
  test("should not auto advance players without a bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.player = createRegisteredPlayer(`player${i + 1}`);
    });
    const [slot1, slot2] = firstRoundSlots;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1: slot1!, slot2: slot2! }, tournamentSlots);


    expect(nextRoundSlot.isBye).toBe(undefined);
    expect(nextRoundSlot.player).toBe(undefined);

  });
  test("should auto advance matchup with 2 byes to next round bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.player = createRegisteredPlayer(`player${i + 1}`);
    });
    const [slot1, slot2] = firstRoundSlots;
    delete slot1!.player;
    delete slot2!.player;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1: slot1!, slot2: slot2! }, tournamentSlots);

    expect(nextRoundSlot.player).toBe(undefined);
    expect(nextRoundSlot.isBye).toBe(true);
  });

});
