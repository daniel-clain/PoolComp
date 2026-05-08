import { describe, expect, test } from "vitest";
import { getFirstRoundMatchupsFromAllTournamentSlots } from "../../../../../shared/tournament-slot.service";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units";


describe("getFirstRoundMatchupsFromAllTournamentSlots", function () {
  test("the second matchup, in an 8 player tournament, should be slot id 9 and 10", function () {
    const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
    const matchups = getFirstRoundMatchupsFromAllTournamentSlots(tournamentSlots);
    const [matchup1, matchup2] = matchups;
    console.log("matchups", matchups)
    expect(matchup2).toStrictEqual({ slot1: { id: 9 }, slot2: { id: 10 } });
  })
})
