import {
  addWeeks,
  format,
  getDate,
  isAfter,
  isBefore,
  isSameDay,
  isThursday,
  nextThursday
} from "date-fns"
import { enAU } from "date-fns/locale"
import type { PoolComp } from "../../../shared/domain"
import { getFinalists } from "./poolComp.service"

export {
  calculateBigCompFirstPrizeMoney,
  calculateBigCompSecondPrizeMoney,
  calculateCompBigCompContribution,
  calculateSecondChanceFirstPrizeMoney,
  getBigCompTotalPrizePool
} from "../../../shared/prize-money.service"

export type BigCompErrors = string[] | false

export function getBigCompErrors(compHistory: PoolComp[], thisBigComp: PoolComp): BigCompErrors {
  const errors: string[] = []

  // comp history has all the comps since the last big comp
  // the last big comp was on the 3rd thursday of the month
  // this comp is the 3rd thursday of the month
  // there is a normal comp on every thursday since the last big comp

  const thisCompIsOnThe3rdThursdayOfTheMonth = dateIsThe3rdThursdayOfTheMonth(thisBigComp.date)
  if (!thisCompIsOnThe3rdThursdayOfTheMonth) {
    errors.push(`This comp is not on the 3rd thursday of the month`)
  }

  const lastBigComp = getLastBigComp()
  if (!lastBigComp) {
    errors.push(`No last big comp found`)
    return errors
  }


  const lastBigCompWasOnThe3rdThursdayOfTheMonth = dateIsThe3rdThursdayOfTheMonth(lastBigComp.date)
  if (!lastBigCompWasOnThe3rdThursdayOfTheMonth) {
    errors.push(`The last big comp (${formatDate(lastBigComp.date)}) was not on the 3rd thursday of the month`)
  }

  const compsSinceTheLastBigComp = getCompsSinceTheLastBigComp()


  compsSinceTheLastBigComp.forEach(comp => {
    const { firstPlace, secondPlace } = getFinalists(comp)
    if (!compOnAThursday(comp)) {
      errors.push(`The comp was not on a Thursday. (Date: ${formatDate(comp.date)}, First Place: ${firstPlace?.name}, Second Place: ${secondPlace?.name})`)
    }
  })


  const datesWithMoreThanOneComp = getDatesWithMoreThanOneComp()
  if (datesWithMoreThanOneComp.length) {
    errors.push(`More than one comp was found on these dates: ${datesWithMoreThanOneComp.join(", ")}`)
  }

  const thursdaysWithoutAComp = getThursdaysWithoutAComp()
  if (thursdaysWithoutAComp.length) {
    errors.push(`No comp was found for these Thursdays: ${thursdaysWithoutAComp.join(", ")}`)
  }

  if (errors.length) {
    console.log("Big comp validation errors:", errors)
    console.log("comp history:", compHistory)
  }

  return errors.length ? errors : false


  ////////////////////////////////////////////////////

  function dateIsThe3rdThursdayOfTheMonth(date: string): boolean {
    const dayOfMonth = getDate(date)
    return isThursday(date) && dayOfMonth >= 15 && dayOfMonth <= 21
  }

  function getLastBigComp(): PoolComp | undefined {
    return compHistory
      .filter(comp => isBigComp(comp) && isBefore(comp.date, thisBigComp.date))
      .reduce<PoolComp | undefined>(mostRecentComp, undefined)

    function mostRecentComp(latestComp: PoolComp | undefined, comp: PoolComp): PoolComp {
      if (!latestComp) return comp
      return isAfter(comp.date, latestComp.date) ? comp : latestComp
    }
  }

  function getCompsSinceTheLastBigComp(): PoolComp[] {
    return compHistory.filter(comp => {
      return isAfter(comp.date, lastBigComp!.date) && isBefore(comp.date, thisBigComp.date)
    })
  }


  function getDatesWithMoreThanOneComp(): string[] {
    const datesAlreadySeen: string[] = []
    const datesWithMoreThanOneComp: string[] = []

    compsSinceTheLastBigComp.forEach(comp => {

      if (!containsDate(datesAlreadySeen, comp.date)) {
        datesAlreadySeen.push(comp.date)
        return
      }

      if (!containsDate(datesWithMoreThanOneComp, comp.date)) {
        datesWithMoreThanOneComp.push(comp.date)
      }
    })

    return datesWithMoreThanOneComp

    function containsDate(dates: string[], dateToFind: string): boolean {
      return dates.some(date => isSameDay(date, dateToFind))
    }
  }

  function getThursdaysWithoutAComp(): Date[] {
    return getEveryThursdaySinceTheLastBigComp().filter(thursday => {
      return !compsSinceTheLastBigComp.some(comp => isSameDay(comp.date, thursday))
    })
  }

  function getEveryThursdaySinceTheLastBigComp(): Date[] {
    const thursdays: Date[] = []
    let thursday = nextThursday(lastBigComp!.date)

    while (isBefore(thursday, thisBigComp.date)) {
      thursdays.push(thursday)
      thursday = addWeeks(thursday, 1)
    }

    return thursdays
  }

  function isBigComp(comp: PoolComp): boolean {
    return Boolean(comp.secondChanceSlots?.length)
  }

  function compOnAThursday(comp: PoolComp): boolean {
    return isThursday(comp.date)
  }

  function formatDate(date: string): string {
    return format(date, "d MMMM yyyy", { locale: enAU })
  }
}
