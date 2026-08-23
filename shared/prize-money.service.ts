import { addWeeks, getDate, isAfter, isBefore, isThursday, nextThursday, parseISO, startOfMonth, subMonths } from "date-fns";
import type { PoolComp } from "./domain.js";
import { poolCompConfig } from "./poolCompConfig.js";

export function roundToNearest5(value: number): number {
  return Math.round(value / 5) * 5;
}

export function calculateFirstPrizeMoney(comp: PoolComp): number {
  const { registeredPlayers } = comp;
  return (
    registeredPlayers.length * poolCompConfig.buyIn *
    (1 - poolCompConfig.bigComp.contributionPercentage) +
    poolCompConfig.barInput
  );
}

export function calculateCompBigCompContribution(comp: PoolComp): number {
  return (
    comp.registeredPlayers.length *
    poolCompConfig.buyIn *
    poolCompConfig.bigComp.contributionPercentage -
    poolCompConfig.xmasCut
  );
}

export function getBigCompTotalPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {
  const bigCompFund = getCompsFromThePreviousMonthsThirdThursday(comp, compHistory).reduce(
    (accumulator, contributingComp) =>
      accumulator + calculateCompBigCompContribution(contributingComp),
    0,
  );

  return bigCompFund + calculateFirstPrizeMoney(comp);
}

export function getCompsFromThePreviousMonthsThirdThursday(
  comp: PoolComp,
  compHistory: PoolComp[],
): PoolComp[] {
  return getCompsInDateWindow(
    compHistory,
    getThirdThursdayOfThePreviousMonth(comp.date),
    parseISO(comp.date),
  );
}

export function getCompsTowardTheNextBigComp(comp: PoolComp, compHistory: PoolComp[]): PoolComp[] {
  return [
    ...getCompsInDateWindow(
      compHistory,
      getMostRecentThirdThursdayOnOrBefore(comp.date),
      parseISO(comp.date),
    ),
    comp,
  ];
}

export function getChristmasContributionTotal(comp: PoolComp, compHistory: PoolComp[]): number {
  const compsBeforeThisOne = compHistory.filter((historicalComp) =>
    isBefore(parseISO(historicalComp.date), parseISO(comp.date)),
  );

  return (compsBeforeThisOne.length + 1) * poolCompConfig.xmasCut;
}

function getCompsInDateWindow(
  compHistory: PoolComp[],
  windowStart: Date,
  windowEnd: Date,
): PoolComp[] {
  return compHistory.filter((historicalComp) => {
    const historicalCompsDate = parseISO(historicalComp.date);
    return !isBefore(historicalCompsDate, windowStart) && isBefore(historicalCompsDate, windowEnd);
  });
}

export function getThirdThursdayOfTheMonth(date: Date): Date {
  const firstDayOfTheMonth = startOfMonth(date);
  const firstThursdayOfTheMonth = isThursday(firstDayOfTheMonth)
    ? firstDayOfTheMonth
    : nextThursday(firstDayOfTheMonth);

  return addWeeks(firstThursdayOfTheMonth, 2);
}

export function getThirdThursdayOfThePreviousMonth(date: string): Date {
  return getThirdThursdayOfTheMonth(subMonths(parseISO(date), 1));
}

export function getMostRecentThirdThursdayOnOrBefore(date: string): Date {
  const parsedDate = parseISO(date);
  const thisMonthsThirdThursday = getThirdThursdayOfTheMonth(parsedDate);

  if (!isAfter(thisMonthsThirdThursday, parsedDate)) return thisMonthsThirdThursday;

  return getThirdThursdayOfTheMonth(subMonths(parsedDate, 1));
}

export function dateIsTheThirdThursdayOfTheMonth(date: string): boolean {
  const parsedDate = parseISO(date);
  const dayOfTheMonth = getDate(parsedDate);

  return isThursday(parsedDate) && dayOfTheMonth >= 15 && dayOfTheMonth <= 21;
}

export function calculateBigCompFirstPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {
  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory);
  return roundToNearest5(
    mainCompPrizePool * poolCompConfig.bigComp.mainCompFirstPlacePercentage,
  );
}

export function calculateBigCompSecondPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {
  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory);
  const mainCompFirstPlacePrizeMoney = calculateBigCompFirstPrizeMoney(comp, compHistory);
  return mainCompPrizePool - mainCompFirstPlacePrizeMoney;
}

export function calculateSecondChanceFirstPrizeMoney(
  comp: PoolComp,
  compHistory: PoolComp[],
): number {
  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory);
  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory);
  return totalBigCompPrizePool - mainCompPrizePool;
}

function calculateMainCompPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {
  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory);
  return roundToNearest5(totalBigCompPrizePool * poolCompConfig.bigComp.mainCompPercentage);
}
