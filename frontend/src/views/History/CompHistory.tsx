import { useAppContext } from "../../AppContext";
import {
  calculatePrizeMoneyFromPlayerCount,
  countPlayersInComp,
  getFinalistPlayerIds,
} from "../../services/poolComp.service";

export function CompHistory() {
  const { compHistory, players, viewHistoricalComp } = useAppContext();

  function playerName(playerId: string | null): string {
    if (!playerId) return "-";
    return players.find((player) => player.id === playerId)?.name ?? "Unknown";
  }

  return (
    <history-view>
      <view-title>Comp History</view-title>
      {compHistory.length === 0 ? (
        <history-empty>No comp history yet.</history-empty>
      ) : (
        <history-table>
          <history-table-header>
            <history-cell>Date</history-cell>
            <history-cell>Players</history-cell>
            <history-cell>1st Place</history-cell>
            <history-cell>2nd Place</history-cell>
            <history-cell>Prize</history-cell>
          </history-table-header>
          <history-table-body>
            {compHistory.map((comp) => {
              const playerCount = countPlayersInComp(comp.slots);
              const { firstPlaceId, secondPlaceId } = getFinalistPlayerIds(comp.slots);
              const prizeMoney = calculatePrizeMoneyFromPlayerCount(playerCount);
              return (
                <history-row key={comp.id} onClick={() => viewHistoricalComp(comp)}>
                  <history-cell>{new Date(comp.date).toLocaleDateString()}</history-cell>
                  <history-cell>{playerCount}</history-cell>
                  <history-cell>{playerName(firstPlaceId)}</history-cell>
                  <history-cell>{playerName(secondPlaceId)}</history-cell>
                  <history-cell>${prizeMoney}</history-cell>
                </history-row>
              );
            })}
          </history-table-body>
        </history-table>
      )}
    </history-view>
  );
}
