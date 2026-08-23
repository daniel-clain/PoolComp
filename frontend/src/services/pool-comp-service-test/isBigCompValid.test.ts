import { describe, expect, test } from "vitest";
import { toCompDateOnly } from "../../../../shared/comp-date";
import type { PoolComp, RegisteredPlayer, Slot } from "../../../../shared/domain";
import { getBigCompErrors } from "../bigComp.service";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return {
    id: name,
    name,
    deactivated: false,
    paid: true,
  };
}

function createComp({
  date,
  isBigComp = false,
  winnerName = "Winner",
  runnerUpName = "Runner Up",
}: {
  date: Date;
  isBigComp?: boolean;
  winnerName?: string;
  runnerUpName?: string;
}): PoolComp {
  const winner = createRegisteredPlayer(winnerName);
  const runnerUp = createRegisteredPlayer(runnerUpName);
  const slots: Slot[] = [{ id: 0, player: winner }, { id: 1, player: runnerUp }, { id: 2, player: winner }];
  const dateOnly = toCompDateOnly(date);

  return {
    id: dateOnly,
    date: dateOnly,
    slots,
    registeredPlayers: [winner, runnerUp],
    ...(isBigComp ? { secondChanceSlots: [{ id: 0 }, { id: 1 }, { id: 2 }] } : {}),
  };
}

// August 2026: 3rd Thursday is the 20th. July 2026: 3rd Thursday is the 16th.
const thisBigCompDate = new Date(2026, 7, 20);
const lastBigCompDate = new Date(2026, 6, 16);
const thursdaysInBetween = [new Date(2026, 7, 13), new Date(2026, 7, 6), new Date(2026, 6, 30), new Date(2026, 6, 23)];

const thisBigComp = createComp({ date: thisBigCompDate, isBigComp: true });
const lastBigComp = createComp({ date: lastBigCompDate, isBigComp: true });

describe("getBigCompErrors", function () {
  test("returns false when a normal comp sits on every Thursday since the last big comp", function () {
    const compHistory = [...thursdaysInBetween.map((date) => createComp({ date })), lastBigComp];

    expect(getBigCompErrors(compHistory, thisBigComp)).toBe(false);
  });

  test("returns an error when this comp is not on the 3rd Thursday of the month", function () {
    const compOnTheFourthThursday = createComp({ date: new Date(2026, 7, 27), isBigComp: true });
    const compHistory = [
      createComp({ date: thisBigCompDate }),
      ...thursdaysInBetween.map((date) => createComp({ date })),
      lastBigComp,
    ];

    const errors = getBigCompErrors(compHistory, compOnTheFourthThursday);

    expect(errors).toEqual(["This comp is not on the 3rd thursday of the month"]);
  });

  test("returns an error when there is no big comp in the history", function () {
    const compHistory = thursdaysInBetween.map((date) => createComp({ date }));

    expect(getBigCompErrors(compHistory, thisBigComp)).toEqual(["No last big comp found"]);
  });

  test("returns an error when the last big comp was not on the 3rd Thursday of the month", function () {
    const lastBigCompOnTheFourthThursday = createComp({ date: new Date(2026, 6, 23), isBigComp: true });
    const compHistory = [
      createComp({ date: new Date(2026, 7, 13) }),
      createComp({ date: new Date(2026, 7, 6) }),
      createComp({ date: new Date(2026, 6, 30) }),
      lastBigCompOnTheFourthThursday,
    ];

    const errors = getBigCompErrors(compHistory, thisBigComp);

    expect(errors).toEqual(["The last big comp (23 July 2026) was not on the 3rd thursday of the month"]);
  });

  test("returns an error naming every comp since the last big comp that is not on a Thursday", function () {
    const compHistory = [
      ...thursdaysInBetween.map((date) => createComp({ date })),
      createComp({ date: new Date(2026, 7, 11), winnerName: "Tuesday Winner", runnerUpName: "Tuesday Runner Up" }),
      lastBigComp,
    ];

    const errors = getBigCompErrors(compHistory, thisBigComp);

    expect(errors).toEqual([
      "The comp was not on a Thursday. (Date: 11 August 2026, First Place: Tuesday Winner, Second Place: Tuesday Runner Up)",
    ]);
  });

  test("returns an error listing every date that has more than one comp", function () {
    const compHistory = [
      ...thursdaysInBetween.map((date) => createComp({ date })),
      createComp({ date: new Date(2026, 6, 30), winnerName: "Other Winner" }),
      lastBigComp,
    ];

    const errors = getBigCompErrors(compHistory, thisBigComp);

    expect(errors).toEqual(["More than one comp was found on these dates: 2026-07-30"]);
  });

  test("returns an error listing every Thursday since the last big comp that has no comp", function () {
    const compHistory = [createComp({ date: new Date(2026, 7, 13) }), createComp({ date: new Date(2026, 6, 23) }), lastBigComp];

    const errors = getBigCompErrors(compHistory, thisBigComp);

    expect(errors).not.toBe(false);
    if (errors === false) return;
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("No comp was found for these Thursdays:");
  });

  test("treats an extra big comp in between as the last big comp, which then fails the 3rd Thursday check", function () {
    const compHistory = [
      createComp({ date: new Date(2026, 7, 13) }),
      createComp({ date: new Date(2026, 7, 6), isBigComp: true }),
      createComp({ date: new Date(2026, 6, 30) }),
      createComp({ date: new Date(2026, 6, 23) }),
      lastBigComp,
    ];

    const errors = getBigCompErrors(compHistory, thisBigComp);

    expect(errors).toEqual(["The last big comp (6 August 2026) was not on the 3rd thursday of the month"]);
  });
});
