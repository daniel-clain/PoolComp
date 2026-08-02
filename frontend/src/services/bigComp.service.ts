import {
  differenceInCalendarDays,
  format,
  isSameDay,
  isThursday,
  previousThursday,
  startOfDay,
  subWeeks,
} from "date-fns"
import { enAU } from "date-fns/locale"
import type { PoolComp } from "../../../shared/domain"
import { poolCompConfig } from "../../../shared/poolCompConfig"
import { roundToNearest5 } from "../utils/utils"
import { calculateFirstPrizeMoney } from "./poolComp.service"

export type BigCompValidationResult = true | string[]

export function isBigCompValid(compHistory: PoolComp[], referenceDate: Date = new Date()): BigCompValidationResult {
  const errors: string[] = []
  const weeksNeededForWinners = poolCompConfig.bigComp.weeksFirstPlaceCantEnterSecondChance
  const weeksNeededForPrizePool = 4

  if (compHistory.length < weeksNeededForWinners) {
    errors.push(`Need the last ${weeksNeededForWinners} comps to check recent winners; only ${compHistory.length} available`)
  }

  if (compHistory.length < weeksNeededForPrizePool) {
    errors.push(`Need the last ${weeksNeededForPrizePool} comps for the big comp prize pool; only ${compHistory.length} available`)
    return errors
  }

  const lastFourComps = compHistory.slice(0, weeksNeededForPrizePool)
  const lastSixComps = compHistory.slice(0, weeksNeededForWinners)
  const expectedThursdays = getPreviousThursdays(referenceDate, weeksNeededForPrizePool)

  lastSixComps.forEach((comp, index) => {
    if (!comp.slots[0]?.player) {
      errors.push(`Missing a winner on the ${ordinal(index + 1)} most recent of the last ${weeksNeededForWinners} comps`)
    }
  })

  for (let index = 0; index < 3; index++) {
    if (isBigComp(lastFourComps[index]!)) {
      errors.push(`Expected the ${ordinal(index + 1)} most recent comp to be a small comp`)
    }
  }

  if (!isBigComp(lastFourComps[3]!)) {
    errors.push(`Expected the 4th most recent comp to be a big comp`)
  }

  expectedThursdays.forEach((expectedThursday, index) => {
    const comp = lastFourComps[index]!
    const compDate = new Date(comp.date)

    if (!isThursday(compDate)) {
      errors.push(`The ${ordinal(index + 1)} most recent comp (${formatDate(compDate)}) was not on a Thursday`)
    }

    if (!isSameDay(compDate, expectedThursday)) {
      errors.push(`Expected the ${ordinal(index + 1)} most recent comp on Thursday ${formatDate(expectedThursday)}, found ${formatDate(compDate)}`)
    }
  })

  for (let index = 0; index < 3; index++) {
    const newerCompDate = startOfDay(new Date(lastFourComps[index]!.date))
    const olderCompDate = startOfDay(new Date(lastFourComps[index + 1]!.date))
    const daysApart = differenceInCalendarDays(newerCompDate, olderCompDate)
    if (daysApart !== 7) {
      errors.push(`Expected weekly comps; gap between ${formatDate(olderCompDate)} and ${formatDate(newerCompDate)} was ${daysApart} days`)
    }
  }

  if (errors.length) {
    console.log("Big comp validation errors:", errors)
    console.log("comp history:", compHistory)
  }

  return errors.length ? errors : true

  function isBigComp(comp: PoolComp): boolean {
    return Boolean(comp.secondChanceSlots?.length)
  }

  function getPreviousThursdays(fromDate: Date, count: number): Date[] {
    const thursdays: Date[] = []
    let cursor = previousThursday(startOfDay(fromDate))

    for (let index = 0; index < count; index++) {
      thursdays.push(cursor)
      cursor = subWeeks(cursor, 1)
    }

    return thursdays
  }

  function formatDate(date: Date): string {
    return format(date, "d MMMM yyyy", { locale: enAU })
  }

  function ordinal(value: number): string {
    if (value === 1) return "1st"
    if (value === 2) return "2nd"
    if (value === 3) return "3rd"
    return `${value}th`
  }
}


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