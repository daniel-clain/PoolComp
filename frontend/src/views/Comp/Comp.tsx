import { useAppContext, type CompTab } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TabBar } from "../../components/TabBar/TabBar";

import { useMemo } from "react";
import { compStarted, getSecondChancePlayersPool, getUnassignedPlayers } from "../../../../shared/tournament-slot.service";
import { activePoolCompHasChampionPlayer, canAddMorePlayers } from "../../services/poolComp.service";
import { BracketsView } from "./components/BracketsView/BracketsView";
import { CompPlayers } from "./components/CompPlayers/CompPlayers";
import { MoneyCalculations } from "./components/MoneyCalculations/MoneyCalculations";


export function Comp() {
  const {
    activePoolComp,
    activeHistoricalComp,
    clearHistoricalComp,
    send,
    userIsCompManager,
    compActiveTab,
    setCompActiveTab,
    autoAssignPlayers,
    compHistory,
  } = useAppContext();

  const comp = activeHistoricalComp ?? activePoolComp!;
  const isBigComp = comp.secondChanceSlots

  const activeTabIsSecondChance = compActiveTab === "2nd Chance Comp"

  const tournamentTabActive = compActiveTab === "Main Comp" || activeTabIsSecondChance

  const secondChancePlayerPool = useMemo(() => {
    console.log('getting second chance player pool');
    return getSecondChancePlayersPool(comp, compHistory);
  }, [comp.slots]);
  console.log('secondChancePlayerPool', secondChancePlayerPool);

  return (
    <comp-view>
      <top-row>
        <comp-tabs>
          <TabBar
            tabs={["Main Comp", ...(isBigComp ? ["2nd Chance Comp"] as CompTab[] : []), "Players", "Money"]}
            selectedTab={compActiveTab}
            onTabSelected={setCompActiveTab}
          />
        </comp-tabs>
        {compActions()}
      </top-row>
      {compMainPanel()}
      {compActionsBottom()}
      <ScalingImage id="eight-ball-image" src={ballImage} />
      <ScalingImage id="bg-leaves-image" src={leavesImage} />
    </comp-view>
  );

  function compMainPanel() {

    const canAddMorePlayersDisabled = !canAddMorePlayers(comp.slots);
    return (
      <comp-main-panel>
        {tournamentTabActive ? (
          <BracketsView />
        ) : compActiveTab === "Players" ? (
          <CompPlayers registeredPlayers={comp.registeredPlayers} canAddMorePlayersDisabled={canAddMorePlayersDisabled} />
        ) : compActiveTab === "Money" ? (
          <MoneyCalculations />
        ) : null}
      </comp-main-panel>
    );
  }


  function compActions() {

    if (activeHistoricalComp) {
      return (
        <comp-actions>
          <button onClick={clearHistoricalComp}>Back{activePoolComp ? ` to Active Comp` : ''}</button>
        </comp-actions>
      );
    }

    const unassignedPlayers = getUnassignedPlayers(comp, activeTabIsSecondChance, compHistory).length;

    const randomiseMatchupsDisabled =
      (comp.registeredPlayers.length < 5 || compStarted(comp.slots));


    return (
      <comp-actions>

        {userIsCompManager && (<>
          <button
            type="button"
            disabled={randomiseMatchupsDisabled}
            onClick={() => {
              send(['randomiseMatchups', { isSecondChanceComp: activeTabIsSecondChance }]);
              if (compActiveTab == 'Players') setCompActiveTab("Main Comp");
            }}
          >
            Randomise Matchups
          </button>
          <assign-players-container>
            <button
              type="button"
              disabled={autoAssignPlayers}
              onClick={() => {
                send(['assignPlayers', { isSecondChanceComp: activeTabIsSecondChance }]);
                if (compActiveTab == 'Players') setCompActiveTab("Main Comp");
              }}
            >
              Assign Players ({unassignedPlayers})
            </button>
            <label>
              <input type="checkbox" checked={autoAssignPlayers} onChange={() => {
                send(['setAutoAssignPlayers', { autoAssignPlayers: !autoAssignPlayers, isSecondChanceComp: activeTabIsSecondChance }]);

                if (compActiveTab == 'Players') setCompActiveTab("Main Comp");
              }} />(Auto)</label></assign-players-container>

        </>
        )}
      </comp-actions>
    )
  }

  function compActionsBottom() {
    if (activeHistoricalComp || !userIsCompManager) {
      return null;
    }

    const completeCompDisabled = !activePoolCompHasChampionPlayer(comp.slots);
    return (
      <comp-actions-bottom>
        <button onClick={() => {
          send(['convertToBigComp']);
        }}>Convert to Big Comp</button>
        <button
          type="button"
          disabled={completeCompDisabled}
          onClick={() => send(['completeActivePoolComp'])}
        >
          Complete Comp
        </button>
        <button className="danger" onClick={() => send(['cancelActivePoolComp'])}>
          Cancel Comp
        </button>
      </comp-actions-bottom>
    );
  }

}
