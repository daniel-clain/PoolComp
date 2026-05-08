import { describe, expect, test } from "vitest";
import type { Slot } from "../../../../shared/domain";
import { canAddMorePlayers } from "../poolComp.service";
describe("canAddMorePlayers", function () {
  test("in and 8 player tournament, if there are 2 bye slots, and each by bye matchup player has a resolved player vs player matchup, then players cant be added to take those bye slots", function () {
    const tournamentSlots: Slot[] = [
      {
        "id": 0
      },
      {
        "id": 1,
        "playerId": "Daniel"
      },
      {
        "id": 2,
        "playerId": "Kat"
      },
      {
        "id": 3,
        "playerId": "Chris"
      },
      {
        "id": 4,
        "playerId": "Daniel"
      },
      {
        "id": 5,
        "playerId": "Darren"
      },
      {
        "id": 6,
        "playerId": "Kat"
      },
      {
        "id": 7,
        "playerId": "Chris"
      },
      {
        "id": 8,
        "playerId": "Steve"
      },
      {
        "id": 9,
        "playerId": "Daniel"
      },
      {
        "id": 10,
        "isBye": true
      },
      {
        "id": 11,
        "playerId": "Darren"
      },
      {
        "id": 12,
        "isBye": true
      },
      {
        "id": 13,
        "playerId": "Kat"
      },
      {
        "id": 14,
        "playerId": "Alan"
      }
    ]
    expect(canAddMorePlayers(tournamentSlots)).toBe(false);
  });
});
