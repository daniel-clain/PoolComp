import { describe, expect, test } from "vitest";
import type { PoolComp, RegisteredPlayer } from "../../../../shared/domain";
import { getBigCompTotalPrizePool } from "../../../../shared/prize-money.service";

function createComp(numberOfPlayers: number): PoolComp {
  const registeredPlayers: RegisteredPlayer[] = Array.from(
    { length: numberOfPlayers },
    (_, playerIndex) => ({
      id: `player-${playerIndex}`,
      name: `Player ${playerIndex}`,
      deactivated: false,
      paid: true,
    }),
  );

  return {
    id: `comp-${numberOfPlayers}`,
    date: "2026-08-20",
    slots: [],
    registeredPlayers,
  };
}

describe("getBigCompTotalPrizePool", function () {
  test("uses the four most recent comps for the big comp fund", function () {
    const activeComp = createComp(15);
    const compHistory = [
      createComp(16),
      createComp(17),
      createComp(15),
      createComp(14),
      createComp(100),
    ];

    expect(getBigCompTotalPrizePool(activeComp, compHistory)).toBe(435);
  });
});
