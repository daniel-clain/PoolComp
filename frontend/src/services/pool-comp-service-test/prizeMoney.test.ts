import { describe, expect, test } from "vitest";
import type { PoolComp, RegisteredPlayer } from "../../../../shared/domain";
import {
  getBigCompTotalPrizePool,
  getChristmasContributionTotal,
  getCompsTowardTheNextBigComp,
} from "../../../../shared/prize-money.service";

function createComp(date: string, numberOfPlayers: number): PoolComp {
  return {
    id: `comp-${date}`,
    date,
    slots: [],
    registeredPlayers: createRegisteredPlayers(numberOfPlayers),
  };
}

function createBigComp(date: string, numberOfPlayers: number): PoolComp {
  return {
    ...createComp(date, numberOfPlayers),
    secondChanceSlots: [{ id: 0 }],
  };
}

function createRegisteredPlayers(numberOfPlayers: number): RegisteredPlayer[] {
  return Array.from({ length: numberOfPlayers }, (_, playerIndex) => ({
    id: `player-${playerIndex}`,
    name: `Player ${playerIndex}`,
    deactivated: false,
    paid: true,
  }));
}

describe("getBigCompTotalPrizePool", function () {
  test("adds up every comp from the previous month's 3rd Thursday", function () {
    const thisBigComp = createBigComp("2026-08-20", 21);
    const compHistory = [
      createComp("2026-08-13", 16),
      createComp("2026-08-06", 17),
      createComp("2026-07-30", 15),
      createComp("2026-07-23", 14),
      createBigComp("2026-07-16", 14),
      createComp("2026-07-09", 100),
    ];

    // 50 + 50 + 55 + 65 + 60 set aside, plus this comp's normal first prize of 155
    expect(getBigCompTotalPrizePool(thisBigComp, compHistory)).toBe(435);
  });

  test("ignores comps held on or after the big comp being calculated", function () {
    const thisBigComp = createBigComp("2026-08-20", 21);
    const compHistory = [
      createComp("2026-08-27", 100),
      thisBigComp,
      createComp("2026-08-13", 16),
      createBigComp("2026-08-06", 14),
    ];

    // 50 + 60 set aside, plus this comp's normal first prize of 155
    expect(getBigCompTotalPrizePool(thisBigComp, compHistory)).toBe(265);
  });

  test("finds the previous month's 3rd Thursday comp even when it is not flagged as a big comp", function () {
    const thisBigComp = createBigComp("2026-08-20", 21);
    const compHistory = [
      createComp("2026-08-13", 16),
      createComp("2026-08-06", 17),
      createComp("2026-07-30", 15),
      createComp("2026-07-23", 14),
      createComp("2026-07-16", 14),
      createComp("2026-07-09", 100),
    ];

    expect(getBigCompTotalPrizePool(thisBigComp, compHistory)).toBe(435);
  });

  test("uses only the comps it has when history starts part way through the month", function () {
    const thisBigComp = createBigComp("2026-08-20", 21);
    const compHistory = [createComp("2026-08-13", 16)];

    // 60 set aside, plus this comp's normal first prize of 155
    expect(getBigCompTotalPrizePool(thisBigComp, compHistory)).toBe(215);
  });
});

describe("getCompsTowardTheNextBigComp", function () {
  test("includes this week and every comp since the last 3rd Thursday", function () {
    const thisComp = createComp("2026-08-06", 17);
    const lastBigComp = createBigComp("2026-07-16", 14);
    const compHistory = [
      createComp("2026-07-30", 15),
      createComp("2026-07-23", 14),
      lastBigComp,
      createComp("2026-07-09", 100),
    ];

    expect(getCompsTowardTheNextBigComp(thisComp, compHistory).map((comp) => comp.date)).toEqual([
      "2026-07-30",
      "2026-07-23",
      "2026-07-16",
      "2026-08-06",
    ]);
  });

  test("starts from this month's 3rd Thursday when this week is after it", function () {
    const thisComp = createComp("2026-07-23", 14);
    const lastBigComp = createBigComp("2026-07-16", 14);
    const compHistory = [
      lastBigComp,
      createComp("2026-07-09", 100),
      createComp("2026-06-18", 12),
    ];

    expect(getCompsTowardTheNextBigComp(thisComp, compHistory).map((comp) => comp.date)).toEqual([
      "2026-07-16",
      "2026-07-23",
    ]);
  });
});

describe("getChristmasContributionTotal", function () {
  test("counts this week and every earlier comp", function () {
    const thisComp = createComp("2026-08-06", 17);
    const compHistory = [
      createComp("2026-08-13", 16),
      createComp("2026-07-30", 15),
      createComp("2026-07-23", 14),
    ];

    expect(getChristmasContributionTotal(thisComp, compHistory)).toBe(60);
  });
});
