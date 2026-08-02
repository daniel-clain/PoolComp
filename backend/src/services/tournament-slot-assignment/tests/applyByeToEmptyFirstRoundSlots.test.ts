
import random from "lodash/random";
import { describe, expect, test } from "vitest";


import { RegisteredPlayer, Slot } from "../../../../../shared/domain.js";
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
      slot.player = { id: `player-${i + 1}`, name: `Player ${i + 1}` } as RegisteredPlayer;
    })
    for (let i = 0; i < 2; i++) {
      const randomSlot = firstRoundSlots[random(firstRoundSlots.length)]!;
      if (!randomSlot.player) {
        i--;
        continue;
      } else {
        delete randomSlot.player;
      }
    }

    applyByeToEmptyFirstRoundSlots(slots)

    const byeSlots = slots.filter((slot) => slot.isBye);
    expect(byeSlots.length).toBe(2);
  });
});

