import orderBy from "lodash/orderBy";
import type { Player, PoolComp } from "../../../shared/domain";
import {
  calculateBigCompFirstPrizeMoney,
  calculateFirstPrizeMoney,
} from "../../../shared/prize-money.service";

export type LeaderboardEntry = {
  player: Player;
  wins: number;
  totalMoneyMade: number;
};

export function getLeaderboard(players: Player[], compHistory: PoolComp[]): LeaderboardEntry[] {
  return orderBy(
    players
      .map((player) => ({
        player,
        wins: countPlayerWins(player.id),
        totalMoneyMade: getPlayerTotalMoneyMade(player.id),
      }))
      .filter(({ wins }) => wins > 0),
    ["wins", "player.name"],
    ["desc", "asc"],
  );

  function countPlayerWins(playerId: string): number {
    return compHistory.filter((comp) => {
      const [winnerSlot] = comp.slots;
      return winnerSlot?.player?.id === playerId;
    }).length;
  }

  function getPlayerTotalMoneyMade(playerId: string): number {
    return compHistory.reduce((totalMoneyMade, comp) => {
      const [winnerSlot] = comp.slots;
      if (winnerSlot?.player?.id !== playerId) {
        return totalMoneyMade;
      }

      const isBigComp = Boolean(comp.secondChanceSlots?.length);
      const prizeMoney = isBigComp
        ? calculateBigCompFirstPrizeMoney(comp, compHistory)
        : calculateFirstPrizeMoney(comp);

      return totalMoneyMade + prizeMoney;
    }, 0);
  }
}
