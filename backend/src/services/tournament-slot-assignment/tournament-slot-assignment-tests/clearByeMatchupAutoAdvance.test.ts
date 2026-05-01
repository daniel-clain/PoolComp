
import { describe, expect, test } from "vitest";

import {
    clearByeMatchupAutoAdvance,
    getFirstRoundSlotsFromAllTournamentSlots,
    getTournamentSlotsFromFirstRoundSize,
    applyByeToEmptyFirstRoundSlots,
    autoAdvanceByeMatchups,
    getMatchupNextRoundSlot,
} from "../tournament-slot-assignment.units.js";



describe("clearByeMatchupAutoAdvance", function () {
    test("if matchup1 has a bye, next round slot should have no player id", function () {
        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
        const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(tournamentSlots);
        firstRoundSlots.forEach((slot, i) => {
            slot.playerId = `player${i + 1}`;
        });
        const [slot1, slot2] = firstRoundSlots;
        delete slot2.playerId
        applyByeToEmptyFirstRoundSlots(tournamentSlots)
        autoAdvanceByeMatchups(tournamentSlots)
        clearByeMatchupAutoAdvance(tournamentSlots)
        console.log("tournamentSlots", tournamentSlots)
        const nextRoundSlot = getMatchupNextRoundSlot({ slot1, slot2 }, tournamentSlots)
        console.log("nextRoundSlot", nextRoundSlot)
        expect(nextRoundSlot.playerId).toBe(undefined);
    });

    test("should clear all the way to winner slot", function () {
        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);

        tournamentSlots.forEach((slot, i) => {
            if ([14, 6, 2, 0].includes(slot.id)) {
                slot.playerId = `1234`;
            } else {
                slot.isBye = true;
            }
        })
        clearByeMatchupAutoAdvance(tournamentSlots)
        const slotsPlayerAutoAdvancedTo = tournamentSlots.filter(slot => [6, 2, 0].includes(slot.id));
        expect(slotsPlayerAutoAdvancedTo.every(slot => slot.playerId === undefined));
        expect(tournamentSlots.find(slot => slot.id === 14)?.playerId).toBe('1234');
    });
    test("should not clear the player from the first round slot", function () {

        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);

        tournamentSlots.forEach((slot, i) => {
            if ([14, 6, 2, 0].includes(slot.id)) {
                slot.playerId = `1234`;
            } else {
                slot.isBye = true;
            }
        })
        clearByeMatchupAutoAdvance(tournamentSlots)
        expect(tournamentSlots.find(slot => slot.id === 14)?.playerId).toBe('1234');
    });

    test("none of the slots should have isBye set to true", function () {
        const tournamentSlots = getTournamentSlotsFromFirstRoundSize(8);
        tournamentSlots.forEach((slot, i) => {
            slot.isBye = true;
        })
        clearByeMatchupAutoAdvance(tournamentSlots)
        expect(tournamentSlots.every(slot => !slot.isBye));
    });
});

