import { describe, expect, test } from "vitest";
import type { PoolComp, Slot } from "../../../../shared/domain";
import { getSecondChancePlayersPool } from "../../../../shared/tournament-slot.service";

function createComp(slots: Slot[]): PoolComp {
  return {
    id: "comp-1",
    date: new Date(),
    slots,
    registeredPlayers: [],
  };
}

describe("getSecondChancePlayersPool", function () {
  test("includes a player who lost their first player versus player matchup in the first round", function () {

    const comp = createComp([
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4, playerId: "Darren" },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9, playerId: "Darren" },
      { id: 10, playerId: "Kat" },
      { id: 11, isBye: true },
      { id: 12 },
      { id: 13, isBye: true },
      { id: 14 },
    ]);

    const secondChancePlayers = getSecondChancePlayersPool(comp, []);

    expect(secondChancePlayers).toEqual([{ id: "Kat", name: "Kat", deactivated: false }]);
  });

  test("does not include a player who lost their second player versus player matchup after a first round bye", function () {

    const comp = createComp([
      { id: 0 },
      { id: 1, playerId: "Daniel" },
      { id: 2, playerId: "Darren" },
      { id: 3, playerId: "Daniel" },
      { id: 4, playerId: "Daniel" },
      { id: 5, playerId: "Darren" },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9, playerId: "Daniel" },
      { id: 10, isBye: true },
      { id: 11, playerId: "Darren" },
      { id: 12, isBye: true },
      { id: 13 },
      { id: 14 },
    ]);

    const secondChancePlayers = getSecondChancePlayersPool(comp, []);

    expect(secondChancePlayers).toEqual([]);
  });

  test("excludes a player who won first place in one of the last six comps", function () {

    const comp = createComp([
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4, playerId: "Darren" },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9, playerId: "Darren" },
      { id: 10, playerId: "Kat" },
      { id: 11, isBye: true },
      { id: 12 },
      { id: 13, isBye: true },
      { id: 14 },
    ]);

    const compHistory = [createComp([{ id: 0, playerId: "Kat" }, { id: 1 }, { id: 2 }])];

    const secondChancePlayers = getSecondChancePlayersPool(comp, compHistory);

    expect(secondChancePlayers).toEqual([]);
  });
});
