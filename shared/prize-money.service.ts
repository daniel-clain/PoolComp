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
  const normalFirstPlacePrizeMoney = calculateFirstPrizeMoney(comp);
  const fourMostRecentComps = compHistory.slice(0, 4);
  const bigCompFund = fourMostRecentComps.reduce(
    (accumulator, historyComp) =>
      accumulator +
      historyComp.registeredPlayers.length *
      poolCompConfig.buyIn *
      poolCompConfig.bigComp.contributionPercentage,
    0,
  );
  return bigCompFund + normalFirstPlacePrizeMoney;
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
  console.log('totalBigCompPrizePool', totalBigCompPrizePool);
  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory);
  return totalBigCompPrizePool - mainCompPrizePool;
}

function calculateMainCompPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {
  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory);
  return roundToNearest5(totalBigCompPrizePool * poolCompConfig.bigComp.mainCompPercentage);
}
