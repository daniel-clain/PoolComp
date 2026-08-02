import { useCallback } from "react";
import type { PoolComp } from "../../../../shared/domain";
import { useAppContext } from "../../AppContext";
import { Table } from "../../components/Table/Table";
import { getBigCompTotalPrizePool } from "../../services/bigComp.service";
import {
  calculateFirstPrizeMoney,
  getFinalists,
} from "../../services/poolComp.service";

export function CompHistory() {
  const { compHistory, players, viewHistoricalComp } = useAppContext();

  const tableColumns = ['Date', 'Players', '1st Place', '2nd Place', 'Prize Pool', 'Big Comp'] as const;
  type TableColumnName = (typeof tableColumns)[number]


  const getColumnData = useCallback((comp: PoolComp, column: TableColumnName) => {
    const { firstPlace, secondPlace } = getFinalists(
      comp,
      players,
    );
    const isBigComp = Boolean(comp.secondChanceSlots?.length);

    switch (column) {
      case 'Date': {
        const compDateString = comp.date
          ? new Date(comp.date).toLocaleDateString("en-AU", { day: "numeric", month: "long" })
          : "";
        return compDateString;
      }
      case 'Players': {
        return comp.registeredPlayers.length;
      }
      case '1st Place': {


        return firstPlace.name;
      }
      case '2nd Place': {
        return secondPlace.name;
      }
      case 'Prize Pool': {
        const prizeMoney =
          isBigComp ? getBigCompTotalPrizePool(comp, compHistory) : calculateFirstPrizeMoney(comp);
        return `$${prizeMoney}`;
      }
      case 'Big Comp': {
        return isBigComp ? '🤑' : '-';
      }
    }
  }, [players, compHistory]);


  return (
    <history-view>
      <view-title>Comp History</view-title>
      {compHistory.length === 0 ? (
        <no-data-message>No comp history yet.</no-data-message>
      ) : (
        <Table
          columns={[...tableColumns]}
          rows={compHistory.map((comp) => ({
            key: comp.id,
            cells: tableColumns.map((column) => getColumnData(comp, column)),
          }))}
          onRowClick={(compId) => {
            const comp = compHistory.find((historyComp) => historyComp.id === compId);
            if (comp) viewHistoricalComp(comp);
          }}
        />
      )}
    </history-view>
  );
}
