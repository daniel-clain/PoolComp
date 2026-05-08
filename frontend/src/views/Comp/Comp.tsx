import { useAppContext } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import crownImage from "../../assets/crown.png";
import diningVoucherImage from "../../assets/dining-voucher.jpg";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TabBar } from "../../components/TabBar/TabBar";

import { compStarted } from "../../../../shared/tournament-slot.service";
import { activePoolCompHasChampionPlayer, calculateFirstPrizeMoney, canAddMorePlayers } from "../../services/poolComp.service";
import { CompPlayers } from "./components/CompPlayers/CompPlayers";
import { MoneyCalculations } from "./components/MoneyCalculations/MoneyCalculations";
import { TournamentStructure } from "./components/TournamentStructure/TournamentStructure";


export function Comp() {
  const {
    activePoolComp,
    activeHistoricalComp,
    clearHistoricalComp,
    orientation,
    send,
    userIsCompManager,
    compActiveTab,
    setCompActiveTab,
  } = useAppContext();

  const comp = activePoolComp!;

  const firstPrizeMoney =
    !activeHistoricalComp && comp
      ? calculateFirstPrizeMoney(comp.registeredPlayers)
      : null;

  const completeCompDisabled = Boolean(activeHistoricalComp) || !activePoolCompHasChampionPlayer(comp.slots);

  const canAddMorePlayersDisabled = !canAddMorePlayers(comp.slots);

  const randomiseMatchupsDisabled = Boolean(activeHistoricalComp) ||
    (comp.registeredPlayers.length < 5 || compStarted(comp.slots));

  return (
    <comp-view>
      {orientation === "portrait" ? (
        <>
          <comp-details>
            <comp-details-header>
              {compTitle()}
              {eightBallImage()}
            </comp-details-header>
            {textBoxes()}
          </comp-details>
          {compActions()}
          {compMainPanel()}
          {compActionsBottom()}
        </>
      ) : orientation === "landscape" ? (
        <>
          <left-container>
            {compActions()}
            {compMainPanel()}
            {compActionsBottom()}
          </left-container>
          <right-container>
            <comp-details>
              {compTitle()}
              {textBoxes()}
              {eightBallImage()}
            </comp-details>
          </right-container>
        </>
      ) : null}
      <ScalingImage id="bg-leaves-image" src={leavesImage} />
    </comp-view>
  );

  function compMainPanel() {
    if (activeHistoricalComp) {
      return <comp-main-panel><TournamentStructure comp={activeHistoricalComp} /></comp-main-panel>;
    }
    console.log('tournament structure rerender', comp, activePoolComp)
    return (
      <comp-main-panel>
        {compActiveTab === "Tournament" ? (
          <TournamentStructure comp={comp} />
        ) : compActiveTab === "Players" ? (
          <CompPlayers registeredPlayers={comp.registeredPlayers} canAddMorePlayersDisabled={canAddMorePlayersDisabled} />
        ) : compActiveTab === "Money" ? (
          <MoneyCalculations />
        ) : null}
      </comp-main-panel>
    );
  }

  function compTitle() {
    if (activeHistoricalComp) {
      const compDate = new Date(activeHistoricalComp.date).toLocaleDateString();
      return <view-title>Historical Comp ({compDate})</view-title>;
    }
    return <view-title>Comp Brackets</view-title>;
  }

  function textBoxes() {
    const compDate = (activeHistoricalComp ?? comp).date;
    const compDateString = compDate
      ? new Date(compDate).toLocaleDateString()
      : "";
    return (
      <text-box-container>
        <text-box>
          <text-box-label>
            <ScalingImage id="crown-image" src={crownImage} />
          </text-box-label>
          <text-box-value>${firstPrizeMoney}</text-box-value>
        </text-box>
        <text-box>
          <text-box-label>SECOND PRIZE</text-box-label>
          <text-box-images>
            <ScalingImage
              id="second-prize-voucher-back"
              src={diningVoucherImage}
              className="second-prize-voucher-image"
            />
            <ScalingImage
              id="second-prize-voucher-front"
              src={diningVoucherImage}
              className="second-prize-voucher-image"
            />
          </text-box-images>
        </text-box>
        <text-box>
          <text-box-label>DATE</text-box-label>
          <text-box-value>{compDateString}</text-box-value>
        </text-box>
      </text-box-container>
    );
  }

  function eightBallImage() {
    return <ScalingImage id="eight-ball-image" src={ballImage} />;
  }


  function compActions() {

    if (activeHistoricalComp) {
      return (
        <comp-actions>
          <button onClick={clearHistoricalComp}>Back{activePoolComp ? ` to Active Comp` : ''}</button>
        </comp-actions>
      );
    }


    return (
      <comp-actions>
        <TabBar
          tabs={["Tournament", "Players"]}
          selectedTab={compActiveTab}
          onTabSelected={setCompActiveTab}
        />
        {userIsCompManager && (<>
          <button
            type="button"
            disabled={randomiseMatchupsDisabled}
            onClick={() => {
              send(['randomiseMatchups']);
              setCompActiveTab("Tournament");
            }}
          >
            Randomise Matchups
          </button>
          <assign-players-container>
            <button
              type="button"
              onClick={() => {
                send(['assignPlayers']);
              }}
            >
              Assign Players
            </button>
            <label>
              <input type="checkbox" checked={autoAssignPlayers} onChange={() => {
                send(['setAutoAssignPlayers', { autoAssignPlayers: !autoAssignPlayers }]);
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

    return (
      <comp-actions-bottom>
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
