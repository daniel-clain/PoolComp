import { describe, expect, test } from "vitest";
import type { RegisteredPlayer, Slot } from "../../../../shared/domain";
import { canAddMorePlayers } from "../../../../shared/tournament-slot.service";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return {
    id: name,
    name,
    deactivated: false,
    paid: true,
  };
}

function createPlayerSlot(id: number, playerName: string): Slot {
  return {
    id,
    player: createRegisteredPlayer(playerName),
  };
}

describe("canAddMorePlayers", function () {
  test("in and 8 player tournament, if there are 2 bye slots, and each by bye matchup player has a resolved player vs player matchup, then players cant be added to take those bye slots", function () {
    const tournamentSlots: Slot[] = [
      { id: 0 },
      createPlayerSlot(1, "Daniel"),
      createPlayerSlot(2, "Kat"),
      createPlayerSlot(3, "Chris"),
      createPlayerSlot(4, "Daniel"),
      createPlayerSlot(5, "Darren"),
      createPlayerSlot(6, "Kat"),
      createPlayerSlot(7, "Chris"),
      createPlayerSlot(8, "Steve"),
      createPlayerSlot(9, "Daniel"),
      { id: 10, isBye: true },
      createPlayerSlot(11, "Darren"),
      { id: 12, isBye: true },
      createPlayerSlot(13, "Kat"),
      createPlayerSlot(14, "Alan"),
    ];
    expect(canAddMorePlayers(tournamentSlots)).toBe(false);
  });
});
