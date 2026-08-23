import { format, parseISO } from "date-fns";
import { enAU } from "date-fns/locale";
import { useAppContext, type CompTab } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TabBar } from "../../components/TabBar/TabBar";

import { canAddMorePlayers, compStarted, getUnassignedPlayers } from "../../../../shared/tournament-slot.service";
import { getBigCompErrors } from "../../services/bigComp.service";
import { activePoolCompHasChampionPlayer } from "../../services/poolComp.service";
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

  const activeTabIsMainComp = compActiveTab === "Main Comp"
  const activeTabIsSecondChance = compActiveTab === "2nd Chance Comp"

  const tournamentTabActive = activeTabIsMainComp || activeTabIsSecondChance

  const canAddMorePlayersDisabled = !canAddMorePlayers(comp.slots);
  const bigCompErrors = getBigCompErrors(compHistory, comp);


  const compDateString = comp.date
    ? format(parseISO(comp.date), "EEE do MMM", { locale: enAU })
    : "";

  return (
    <comp-view>
      <top-row>
        <comp-tabs>
          <TabBar
            tabs={[
              "Main Comp",
              ...(isBigComp ? ["2nd Chance Comp"] as CompTab[] : []),
              "Players",
              "Money"
            ]}
            selectedTab={compActiveTab}
            onTabSelected={setCompActiveTab}
          />
        </comp-tabs>
        <comp-date>{compDateString}</comp-date>
        {compActions()}
      </top-row>
      {compMainPanel()}
      {bigCompErrorsElem && bigCompErrorsElem()}
      {compActionsBottom()}
      <ScalingImage id="eight-ball-image" src={ballImage} />
      <ScalingImage id="bg-leaves-image" src={leavesImage} />
    </comp-view>
  );

  function bigCompErrorsElem() {
    if (!bigCompErrors) return null;

    return (
      <big-comp-errors>
        <status-errors>
          {bigCompErrors.map((error) => (
            <status-error key={error}>{error}</status-error>
          ))}
        </status-errors>
      </big-comp-errors>
    );
  }

  function compMainPanel() {

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

    const randomiseMatchupsDisabled = compStarted(activeTabIsSecondChance ? comp.secondChanceSlots! : comp.slots);


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
              disabled={autoAssignPlayers || (activeTabIsMainComp && canAddMorePlayersDisabled)}
              onClick={() => {
                send(['assignPlayers', { isSecondChanceComp: activeTabIsSecondChance }]);
                if (compActiveTab == 'Players') setCompActiveTab("Main Comp");
              }}
            >
              Assign Players ({unassignedPlayers})
            </button>
            <label>
              <input type="checkbox" disabled={canAddMorePlayersDisabled} checked={autoAssignPlayers} onChange={() => {
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

    const completeCompDisabled = !activePoolCompHasChampionPlayer(comp);
    return (
      <comp-actions-bottom>
        <button
          type="button"
          onClick={() => {
            if (isBigComp) {
              send(['convertToBigComp', { cancel: true }]);
            } else {
              send(['convertToBigComp', {}]);
            }
          }}
        >
          {isBigComp ? 'Is' : 'Convert to'} Big Comp {isBigComp ? '✅' : ''}
        </button>
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
