
import { describe, expect, test } from "vitest";

import { RegisteredPlayer, Slot } from "../../../../../shared/domain.js";
import { getFirstRoundSlotsFromAllTournamentSlots } from "../../../../../shared/tournament-slot.service.js";
import {
  applyByeToEmptyFirstRoundSlots,
  clearByeMatchupAutoAdvance,
  eachFirstRoundMatchupDoesntHave2Players,
  eachFirstRoundMatchupDoesntHaveAPlayer,
  getFirstRoundSize,
  getRandomMatchup,
  getRandomMatchupWithout2Players,
  getRandomSlotFromMatchup,
  getRandomUnassignedPlayer,
  getTournamentSlotsFromFirstRoundSize,
  registeredPlayersAreUnassigned,
} from "../tournament-slot-assignment.units.js";



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
      const matchup = getRandomMatchup(firstRoundSlots);
      const randomSlot = getRandomSlotFromMatchup(matchup);
      if (randomSlot.isBye) {
        randomSlot.isBye = false;
        clearByeMatchupAutoAdvance(updatedSlots);
      }
      const playerId = getRandomUnassignedPlayer(
        registeredPlayers,
        firstRoundSlots,
      );
      randomSlot.playerId = playerId;
    }
    while (
      registeredPlayersAreUnassigned(registeredPlayers, firstRoundSlots) &&
      eachFirstRoundMatchupDoesntHave2Players(firstRoundSlots, updatedSlots)
    ) {
      const matchup = getRandomMatchupWithout2Players(firstRoundSlots, updatedSlots);
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

