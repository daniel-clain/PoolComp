import { useState } from "react";
import {
  collectPlayerIdsPlacedInSlots,
  registrationSlotsMatchGeneratedLayout,
} from "../../../../shared/bracketLayout";
import { useAppContext } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import crownImage from "../../assets/crown.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TabBar } from "../../components/TabBar/TabBar";
import { activePoolCompHasChampionPlayer } from "../../services/poolComp.service";
import { CompPlayers } from "./components/CompPlayers/CompPlayers";
import { TournamentStructure } from "./components/TournamentStructure/TournamentStructure";

type CompPanel = "players" | "tournament";

export function Comp() {
  const {
    activePoolComp,
    activeHistoricalComp,
    clearHistoricalComp,
    orientation,
    calculateFirstPrizeMoney,
    send,
  } = useAppContext();

  const [compPanel, setCompPanel] = useState<CompPanel>("players");

  const firstPrizeMoney =
    !activeHistoricalComp && activePoolComp
      ? calculateFirstPrizeMoney(activePoolComp.registeredPlayers)
      : null;

  const completeCompDisabled =
    !activePoolComp || !activePoolCompHasChampionPlayer(activePoolComp.slots);

  const createMatchupsDisabled = (() => {
    if (!activePoolComp) return true;
    const registeredPlayerIds = activePoolComp.registeredPlayers.map(
      (registeredPlayer) => registeredPlayer.id,
    );
    if (
      registrationSlotsMatchGeneratedLayout(
        activePoolComp.slots,
        registeredPlayerIds,
      )
    ) {
      return registeredPlayerIds.length < 5;
    }
    const placedPlayerIds = collectPlayerIdsPlacedInSlots(activePoolComp.slots);
    const pendingPlayerIds = registeredPlayerIds.filter(
      (playerId) => !placedPlayerIds.has(playerId),
    );
    return pendingPlayerIds.length === 0;
  })();

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
      return <TournamentStructure comp={activeHistoricalComp} />;
    }

    if (activePoolComp) {
      return (
        <comp-main-panel>
          {compPanel === "players" ? (
            <CompPlayers />
          ) : (
            <TournamentStructure comp={activePoolComp} />
          )}
        </comp-main-panel>
      );
    }
  }

  function compTitle() {
    if (activeHistoricalComp) {
      const compDate = new Date(activeHistoricalComp.date).toLocaleDateString();
      return <view-title>Historical Comp ({compDate})</view-title>;
    }
    return <view-title>Comp Brackets</view-title>;
  }

  function textBoxes() {
    const compDate = (activeHistoricalComp ?? activePoolComp)?.date;
    const compDateString = compDate
      ? new Date(compDate).toLocaleDateString()
      : "";
    return (
      <text-box-container>
        <text-box>
          <text-box-label>
            <ScalingImage id="crown-image" src={crownImage} />
          </text-box-label>
          <text-box-value>{firstPrizeMoney}</text-box-value>
        </text-box>
        <text-box>
          <text-box-label>SECOND PRIZE</text-box-label>
          <text-box-value>$</text-box-value>
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
          <button onClick={clearHistoricalComp}>Back to Active Comp</button>
        </comp-actions>
      );
    }

    return (
      activePoolComp && (
        <comp-actions>
          <TabBar
            tabLabels={["Players", "Tournament"]}
            selectedTabIndex={compPanel === "players" ? 0 : 1}
            onTabSelected={(selectedTabIndex) => {
              if (selectedTabIndex === 0) {
                setCompPanel("players");
              } else {
                setCompPanel("tournament");
              }
            }}
          />
          <button
            type="button"
            disabled={createMatchupsDisabled}
            onClick={() => {
              send({ message: 'assignMatchups' });
              setCompPanel("tournament");
            }}
          >
            Create Matchups
          </button>
        </comp-actions>
      )
    );
  }

  function compActionsBottom() {
    if (activeHistoricalComp) {
      return null;
    }

    return (
      <comp-actions-bottom>
        <button
          type="button"
          disabled={completeCompDisabled}
          onClick={() => send({ message: 'completeActivePoolComp' })}
        >
          Complete Comp
        </button>
        <button className="danger" onClick={() => send({ message: 'cancelActivePoolComp' })}>
          Cancel Comp
        </button>
      </comp-actions-bottom>
    );
  }
}
