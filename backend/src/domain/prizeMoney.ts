import {
  EMPTY_CORE,
  type SharedAppState,
  type SharedAppStateCore,
  type WeeklyPrizePreview,
} from "./types.js";

export type WeeklyPrizeConfig = {
  buyIn: number;
  barInput: number;
  xmasCut: number;
};

export const DEFAULT_WEEKLY_PRIZE_CONFIG: WeeklyPrizeConfig = {
  buyIn: 10,
  barInput: 50,
  xmasCut: 20,
};

/** Weekly amounts from prize-money.md. No preview when there is no active comp or zero entrants. */
export function computeWeeklyPrizePreview(
  entrantCount: number,
  config: WeeklyPrizeConfig = DEFAULT_WEEKLY_PRIZE_CONFIG,
): WeeklyPrizePreview | null {
  if (entrantCount <= 0) {
    return null;
  }

  const halfPot = (config.buyIn * entrantCount) / 2;

  return {
    entrantCount,
    buyIn: config.buyIn,
    barInput: config.barInput,
    xmasCut: config.xmasCut,
    firstPrize: halfPot + config.barInput,
    bigCompContribution: halfPot - config.xmasCut,
    christmasFundContribution: config.xmasCut,
  };
}

export function withWeeklyPrizePreview(core: SharedAppStateCore): SharedAppState {
  const entrantCount = core.activePoolComp?.players.length ?? 0;
  const weeklyPrizePreview = core.activePoolComp
    ? computeWeeklyPrizePreview(entrantCount)
    : null;

  return {
    ...core,
    weeklyPrizePreview,
  };
}

export const EMPTY_SHARED_STATE: SharedAppState = withWeeklyPrizePreview(EMPTY_CORE);
