import { describe, expect, test } from "vitest";
import type { PoolComp, RegisteredPlayer, Slot } from "../../../../shared/domain";
import { getSecondChancePlayersPool } from "../../../../shared/tournament-slot.service";

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

function createComp(slots: Slot[], registeredPlayers: RegisteredPlayer[]): PoolComp {
  return {
    id: "comp-1",
    date: new Date(),
    slots,
    registeredPlayers,
  };
}

describe("getSecondChancePlayersPool", function () {
  test("includes a player who lost their first player versus player matchup in the first round", function () {
    const kat = createRegisteredPlayer("Kat");
    const darren = createRegisteredPlayer("Darren");

    const comp = createComp(
      [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        createPlayerSlot(4, "Darren"),
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        createPlayerSlot(9, "Darren"),
        createPlayerSlot(10, "Kat"),
        { id: 11, isBye: true },
        { id: 12 },
        { id: 13, isBye: true },
        { id: 14 },
      ],
      [kat, darren],
    );

    const secondChancePlayers = getSecondChancePlayersPool(comp, []);

    expect(secondChancePlayers).toEqual([kat]);
  });

  test("includes a player who lost their first player versus player matchup after a first round bye", function () {
    const gary = createRegisteredPlayer("Gary");
    const christian = createRegisteredPlayer("Christian");
    const jason = createRegisteredPlayer("Jason");

    // Gary bye in R1 (9 vs 10), then loses first real game to Christian (3 vs 4 → 1)
    const comp = createComp(
      [
        { id: 0 },
        createPlayerSlot(1, "Christian"),
        { id: 2 },
        createPlayerSlot(3, "Christian"),
        createPlayerSlot(4, "Gary"),
        { id: 5 },
        { id: 6 },
        createPlayerSlot(7, "Christian"),
        createPlayerSlot(8, "Jason"),
        createPlayerSlot(9, "Gary"),
        { id: 10, isBye: true },
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
      ],
      [gary, christian, jason],
    );

    const secondChancePlayers = getSecondChancePlayersPool(comp, []);

    expect(secondChancePlayers).toEqual([gary, jason]);
  });

  test("does not include a player who won their first game and later lost", function () {
    const daniel = createRegisteredPlayer("Daniel");
    const darren = createRegisteredPlayer("Darren");
    const kat = createRegisteredPlayer("Kat");

    // Daniel beats Kat in R1 (9 vs 10 → 4), then loses to Darren (3 vs 4 → 1)
    const comp = createComp(
      [
        { id: 0 },
        createPlayerSlot(1, "Darren"),
        { id: 2 },
        createPlayerSlot(3, "Darren"),
        createPlayerSlot(4, "Daniel"),
        { id: 5 },
        { id: 6 },
        createPlayerSlot(7, "Darren"),
        { id: 8, isBye: true },
        createPlayerSlot(9, "Daniel"),
        createPlayerSlot(10, "Kat"),
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
      ],
      [daniel, darren, kat],
    );

    const secondChancePlayers = getSecondChancePlayersPool(comp, []);

    expect(secondChancePlayers).toEqual([kat]);
  });

  test("excludes a player who won first place in one of the last six comps", function () {
    const kat = createRegisteredPlayer("Kat");
    const darren = createRegisteredPlayer("Darren");

    const comp = createComp(
      [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        createPlayerSlot(4, "Darren"),
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        createPlayerSlot(9, "Darren"),
        createPlayerSlot(10, "Kat"),
        { id: 11, isBye: true },
        { id: 12 },
        { id: 13, isBye: true },
        { id: 14 },
      ],
      [kat, darren],
    );

    const compHistory = [
      createComp(
        [createPlayerSlot(0, "Kat"), { id: 1 }, { id: 2 }],
        [kat],
      ),
    ];

    const secondChancePlayers = getSecondChancePlayersPool(comp, compHistory);

    expect(secondChancePlayers).toEqual([]);
  });
});
