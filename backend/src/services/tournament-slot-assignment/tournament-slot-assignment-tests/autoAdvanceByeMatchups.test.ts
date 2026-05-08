
import { describe, expect, test } from "vitest";

import { getFirstRoundSlotsFromAllTournamentSlots, getMatchupNextRoundSlot } from "../../../../../shared/tournament-slot.service.js";
import {
  applyByeToEmptyFirstRoundSlots,
  autoAdvanceByeMatchups,
  getTournamentSlotsFromFirstRoundSize,
} from "../tournament-slot-assignment.units.js";



describe("autoAdvanceByeMatchups", function () {
  test("auto advance players with bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.playerId = `player${i + 1}`;
    });
    const [slot1, slot2] = firstRoundSlots;
    slot2.playerId = undefined;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots);

    expect(nextRoundSlot.playerId).toBe(slot1.playerId);

  });
  test("should not auto advance players without a bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.playerId = `player${i + 1}`;
    });
    const [slot1, slot2] = firstRoundSlots;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots);


    expect(nextRoundSlot.isBye).toBe(undefined);
    expect(nextRoundSlot.playerId).toBe(undefined);

  });
  test("should auto advance matchup with 2 byes to next round bye", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
    firstRoundSlots.forEach((slot, i) => {
      slot.playerId = `player${i + 1}`;
    });
    const [slot1, slot2] = firstRoundSlots;
    slot1.playerId = undefined;
    slot2.playerId = undefined;
    applyByeToEmptyFirstRoundSlots(tournamentSlots)
    autoAdvanceByeMatchups(tournamentSlots)

    const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots);

    expect(nextRoundSlot.playerId).toBe(undefined);
    expect(nextRoundSlot.isBye).toBe(true);
  });

});
