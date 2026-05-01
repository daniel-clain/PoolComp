
import { describe, expect, test } from "vitest";

import {
    getFirstRoundSize,
    getTournamentSlotsFromFirstRoundSize,
    getFirstRoundSlotsFromAllTournamentSlots,
    registeredPlayersAreUnassigned,
    eachFirstRoundMatchupDoesntHaveAPlayer,
    getRandomMatchupWithoutPlayer,
    getRandomSlotFromMatchup,
    clearByeMatchupAutoAdvance,
    getRandomUnassignedPlayer,
    eachFirstRoundMatchupDoesntHave2Players,
    getRandomMatchupWithout2Players,
    applyByeToEmptyFirstRoundSlots,
} from "../tournament-slot-assignment.units.js";
import { RegisteredPlayer, Slot } from "../../../../../shared/domain.js";



describe("applyByeToEmptyFirstRoundSlots", function () {
    test("when applying to 14 player tournament, there should be 2 byes", function () {
        const registeredPlayers: RegisteredPlayer[] = Array.from({ length: 14 }, (_, i) => ({
            id: `player${i + 1}`,
            name: `Player ${i + 1}`,
            deactivated: false,
            paid: true,
        }))


        const newFirstRoundSize = getFirstRoundSize(registeredPlayers.length);
        let updatedSlots: Slot[] = getTournamentSlotsFromFirstRoundSize(newFirstRoundSize)

        const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(updatedSlots);
        while (
            registeredPlayersAreUnassigned(registeredPlayers, updatedSlots) &&
            eachFirstRoundMatchupDoesntHaveAPlayer(firstRoundSlots)
        ) {
            const matchup = getRandomMatchupWithoutPlayer(firstRoundSlots);
            const randomSlot = getRandomSlotFromMatchup(matchup);
            if (randomSlot.isBye) {
                randomSlot.isBye = false;
                clearByeMatchupAutoAdvance(matchup, updatedSlots);
            }
            const playerId = getRandomUnassignedPlayer(
                registeredPlayers,
                firstRoundSlots,
            );
            randomSlot.playerId = playerId;
        }
        while (
            registeredPlayersAreUnassigned(registeredPlayers, firstRoundSlots) &&
            eachFirstRoundMatchupDoesntHave2Players(firstRoundSlots)
        ) {
            const matchup = getRandomMatchupWithout2Players(firstRoundSlots);
            const remainingSlot = matchup.slot1.playerId
                ? matchup.slot2
                : matchup.slot1;
            const playerId = getRandomUnassignedPlayer(
                registeredPlayers,
                firstRoundSlots,
            );
            remainingSlot.playerId = playerId;
        }

        applyByeToEmptyFirstRoundSlots(updatedSlots)

        const byeSlots = updatedSlots.filter((slot) => slot.isBye);
        expect(byeSlots.length).toBe(2);
    });
});

