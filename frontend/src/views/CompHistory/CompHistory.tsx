
import { useAppContext } from "../../AppContext";
import {
  calculateFirstPrizeMoney,
  getFinalists,
} from "../../services/poolComp.service";

export function CompHistory() {
  const { compHistory, players, viewHistoricalComp } = useAppContext();



  return (
    <history-view>
      <view-title>Comp History</view-title>
      {compHistory.length === 0 ? (
        <no-data-message>No comp history yet.</no-data-message>
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
              const { firstPlace, secondPlace } = getFinalists(
                comp,
                players,
              );
              const playersCount = comp.registeredPlayers.length;
              const prizeMoney =
                calculateFirstPrizeMoney(comp.registeredPlayers);
              return (
                <history-row
                  key={comp.id}
                  onClick={() => viewHistoricalComp(comp)}
                >
                  <history-cell>
                    {new Date(comp.date).toLocaleDateString()}
                  </history-cell>
                  <history-cell>{playersCount}</history-cell>
                  <history-cell>{firstPlace.name}</history-cell>
                  <history-cell>{secondPlace.name}</history-cell>
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
