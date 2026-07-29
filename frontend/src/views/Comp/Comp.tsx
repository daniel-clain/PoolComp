import { useAppContext, type CompTab } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TabBar } from "../../components/TabBar/TabBar";

import { compStarted, getUnassignedPlayers } from "../../../../shared/tournament-slot.service";
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
  } = useAppContext();

  const comp = activeHistoricalComp ?? activePoolComp!;
  const isBigComp = comp.secondChanceSlots

  const tournamentTabActive = compActiveTab === "Brackets" || compActiveTab === "2nd Chance Brackets"

  return (
    <comp-view>
      <top-row>
        <comp-tabs>
          <TabBar
            tabs={["Brackets", ...(isBigComp ? ["2nd Chance Brackets"] as CompTab[] : []), "Players", "Money"]}
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

    const unassignedPlayers = getUnassignedPlayers(comp).length;

    const randomiseMatchupsDisabled =
      (comp.registeredPlayers.length < 5 || compStarted(comp.slots));


    return (
      <comp-actions>

        {userIsCompManager && (<>
          <button
            type="button"
            disabled={randomiseMatchupsDisabled}
            onClick={() => {
              send(['randomiseMatchups']);
              setCompActiveTab("Brackets");
            }}
          >
            Randomise Matchups
          </button>
          <assign-players-container>
            <button
              type="button"
              disabled={autoAssignPlayers}
              onClick={() => {
                send(['assignPlayers']);
                setCompActiveTab("Brackets");
              }}
            >
              Assign Players ({unassignedPlayers})
            </button>
            <label>
              <input type="checkbox" checked={autoAssignPlayers} onChange={() => {
                send(['setAutoAssignPlayers', { autoAssignPlayers: !autoAssignPlayers }]);
                setCompActiveTab("Brackets");
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
