import type { PoolComp } from "../../../shared/domain"
import { poolCompConfig } from "../../../shared/poolCompConfig"
import { roundToNearest5 } from "../utils/utils"
import { calculateFirstPrizeMoney } from "./poolComp.service"


export function calculateBigCompFirstPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {


  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)

  const mainCompFirstPlacePrizeMoney = roundToNearest5(mainCompPrizePool * poolCompConfig.bigComp.mainCompFirstPlacePercentage)

  return mainCompFirstPlacePrizeMoney

}

function calculateMainCompPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {

  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory)
  const mainCompPrizePool = roundToNearest5(totalBigCompPrizePool * poolCompConfig.bigComp.mainCompPercentage)
  return mainCompPrizePool
}

export function calculateBigCompSecondPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number {


  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)
  const mainCompFirstPlacePrizeMoney = calculateBigCompFirstPrizeMoney(comp, compHistory)

  const mainCompSecondPlacePrizeMoney = mainCompPrizePool - mainCompFirstPlacePrizeMoney
  return mainCompSecondPlacePrizeMoney
}

export function calculateSecondChanceFirstPrizeMoney(comp: PoolComp, compHistory: PoolComp[]): number | undefined {

  const totalBigCompPrizePool = getBigCompTotalPrizePool(comp, compHistory)

  const mainCompPrizePool = calculateMainCompPrizePool(comp, compHistory)
  const secondChanceCompFirstPlacePrizeMoney = totalBigCompPrizePool - mainCompPrizePool


  return secondChanceCompFirstPlacePrizeMoney
}



function getAllCompsSinceLastBigComp(compHistory: PoolComp[]): PoolComp[] {
  const lastBigCompIndex = Math.max(compHistory.findIndex(
    poolComp => poolComp.secondChanceSlots && poolComp.secondChanceSlots.length > 0
  ), 4);
  return compHistory.slice(lastBigCompIndex + 1)
}

export function getBigCompTotalPrizePool(comp: PoolComp, compHistory: PoolComp[]): number {
  const normalFirstPlacePrizeMoney = calculateFirstPrizeMoney(comp)
  const compsSinceLastBigComp = getAllCompsSinceLastBigComp(compHistory)
  const bigCompFund = compsSinceLastBigComp.reduce((acc, comp) => acc + comp.registeredPlayers.length * poolCompConfig.buyIn * poolCompConfig.bigComp.contributionPercentage, 0)
  const totalBigCompPrizePool = bigCompFund + normalFirstPlacePrizeMoney
  return totalBigCompPrizePool
}



export function calculateCompBigCompContribution(comp: PoolComp): number {
  return ((comp.registeredPlayers.length * poolCompConfig.buyIn) *
    poolCompConfig.bigComp.contributionPercentage) - poolCompConfig.xmasCut
}