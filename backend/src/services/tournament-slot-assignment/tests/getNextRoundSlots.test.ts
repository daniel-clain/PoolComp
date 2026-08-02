import { describe, expect, test } from "vitest";

import { getFirstRoundSlotsFromAllTournamentSlots, getNextRoundSlots } from "../../../../../shared/tournament-slot.service.js";
import {
    getTournamentSlotsFromFirstRoundSize,
} from "../tournament-slot-assignment.units.js";



describe("getNextRoundSlots", function () {
    test("for 8 player tournament, next round slots should be id 3 to 6", function () {
        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
        const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
        const nextRoundSlots = getNextRoundSlots(firstRoundSlots, tournamentSlots);
        expect(nextRoundSlots.map(slot => slot.id)).toEqual([3, 4, 5, 6]);
    });
});