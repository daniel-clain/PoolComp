
import random from "lodash/random";
import { describe, expect, test } from "vitest";


import { Slot } from "../../../../../shared/domain.js";
import { getFirstRoundSlotsFromAllTournamentSlots } from "../../../../../shared/tournament-slot.service.js";
import {
  applyByeToEmptyFirstRoundSlots,
  getTournamentSlotsFromFirstRoundSize
} from "../tournament-slot-assignment.units.js";



describe("applyByeToEmptyFirstRoundSlots", function () {
  test("when applying to 14 player tournament, there should be 2 byes", function () {
    let slots: Slot[] = getTournamentSlotsFromFirstRoundSize(16)

    const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(slots);

    firstRoundSlots.forEach((slot, i) => {
      slot.playerId = `player${i + 1}`;
    })
    for (let i = 0; i < 2; i++) {
      const randomSlot = firstRoundSlots[random(firstRoundSlots.length)]!;
      if (!randomSlot.playerId) {
        i--;
        continue;
      }
      delete randomSlot.playerId;
    }

    applyByeToEmptyFirstRoundSlots(slots)

    const byeSlots = slots.filter((slot) => slot.isBye);
    expect(byeSlots.length).toBe(2);
  });
});

