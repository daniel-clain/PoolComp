import { describe, expect, test } from "vitest";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units";
describe("getTournamentSlotsForFirstRoundSize", function () {
    test("if first rounds size is 16, there should be 31 total slots", function () {

        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(16);
        expect(tournamentSlots.length).toBe(31);
    })
})
