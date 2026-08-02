
import sortBy from "lodash/sortBy.js";
import { calculateBigCompFirstPrizeMoney } from "../../../../frontend/src/services/bigComp.service.js";
import { calculateFirstPrizeMoney } from "../../../../frontend/src/services/poolComp.service.js";
import { convertToPoolComp } from "../../../../shared/data-convert.service.js";
import type { LeaderboardEntry } from "../../../../shared/domain.js";
import type { BackendService } from "../../services/backend.service.js";

export async function getLeaderboard(backendService: BackendService): Promise<void> {
  const allHistoryData = (await backendService.mongoDbService.getAllHistoryData()).map(
    (poolCompData) => convertToPoolComp(poolCompData, backendService.backendState),
  );
  const players = backendService.backendState.players;
  const leaderboard: LeaderboardEntry[] = sortBy(
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

  backendService.backendState.leaderboard = leaderboard;

  function countPlayerWins(playerId: string): number {
    return allHistoryData.filter((comp) => {
      const [winnerSlot] = comp.slots;
      return winnerSlot?.player?.id === playerId;
    }).length;
  }

  function getPlayerTotalMoneyMade(playerId: string): number {
    return allHistoryData.reduce((totalMoneyMade, comp) => {
      const [winnerSlot] = comp.slots;
      if (winnerSlot?.player?.id !== playerId) {
        return totalMoneyMade;
      }

      const isBigComp = Boolean(comp.secondChanceSlots?.length);
      const prizeMoney = isBigComp
        ? calculateBigCompFirstPrizeMoney(comp, allHistoryData)
        : calculateFirstPrizeMoney(comp);

      return totalMoneyMade + prizeMoney;
    }, 0);
  }
}