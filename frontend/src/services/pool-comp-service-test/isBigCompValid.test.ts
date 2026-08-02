import { previousThursday, startOfDay, subWeeks } from "date-fns";
import { describe, expect, test } from "vitest";
import { toCompDateOnly } from "../../../../shared/comp-date";
import type { PoolComp, RegisteredPlayer, Slot } from "../../../../shared/domain";
import { isBigCompValid } from "../bigComp.service";

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
}: {
  date: Date;
  isBigComp?: boolean;
  winnerName?: string;
}): PoolComp {
  const winner = createRegisteredPlayer(winnerName);
  const slots: Slot[] = [{ id: 0, player: winner }, { id: 1 }, { id: 2 }];
  const dateOnly = toCompDateOnly(date);

  return {
    id: dateOnly,
    date: dateOnly,
    slots,
    registeredPlayers: [winner],
    ...(isBigComp ? { secondChanceSlots: [{ id: 0 }, { id: 1 }, { id: 2 }] } : {}),
  };
}

function thursdayWeeksAgo(fromDate: Date, weeksAgo: number): Date {
  return subWeeks(previousThursday(startOfDay(fromDate)), weeksAgo);
}

describe("isBigCompValid", function () {
  test("returns true when the last four weekly comps and last six winners look valid", function () {
    const referenceDate = new Date(2026, 7, 20); // Thursday
    const compHistory = [
      createComp({ date: thursdayWeeksAgo(referenceDate, 0) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 1) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 2) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 3), isBigComp: true }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 4) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 5) }),
    ];

    expect(isBigCompValid(compHistory, referenceDate)).toBe(true);
  });

  test("returns errors when history is too short or comps are the wrong type", function () {
    const referenceDate = new Date(2026, 7, 20);
    const compHistory = [
      createComp({ date: thursdayWeeksAgo(referenceDate, 0), isBigComp: true }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 1) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 2) }),
      createComp({ date: thursdayWeeksAgo(referenceDate, 3) }),
    ];

    const result = isBigCompValid(compHistory, referenceDate);

    expect(result).not.toBe(true);
    if (result === true) return;
    expect(result.some((error) => error.includes("last 6 comps"))).toBe(true);
    expect(result.some((error) => error.includes("small comp"))).toBe(true);
    expect(result.some((error) => error.includes("big comp"))).toBe(true);
  });
});
