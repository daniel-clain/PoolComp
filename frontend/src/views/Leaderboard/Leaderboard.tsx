import { useEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Table } from "../../components/Table/Table";

export function Leaderboard() {
  const { leaderboard, send } = useAppContext();


  useEffect(() => {

    send(["getLeaderboard"]);
  }, []);

  return (
    <leaderboard-view>
      <view-title>Leaderboard</view-title>
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
    </leaderboard-view>
  );


}
