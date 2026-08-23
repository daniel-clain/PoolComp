import { useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Table } from "../../components/Table/Table";
import { getLeaderboard } from "../../services/stats.service";

export function Stats() {
  const { players, compHistory, send } = useAppContext();

  useEffect(() => {
    send(["getFullCompHistory"]);
  }, []);

  const leaderboard = getLeaderboard(players, compHistory);

  return (
    <stats-view>
      <view-title>Stats</view-title>
      {leaderboard.length === 0 ? (
        <no-data-message>No winners yet.</no-data-message>
      ) : (
        <Table
          columns={["Player", "Wins", "Total Money Made"]}
          rows={leaderboard.map(({ player, wins, totalMoneyMade }) => ({
            key: player.id,
            cells: [player.name, wins, `$${totalMoneyMade}`],
          }))}
        />
      )}
    </stats-view>
  );
}
