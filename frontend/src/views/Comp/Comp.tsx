import { useAppContext } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import crownImage from "../../assets/crown.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { TournamentStructure } from "./components/TournamentStructure/TournamentStructure";

export function Comp() {
  const {
    activePoolComp,
    activeHistoricalComp,
    cancelActivePoolComp,
    completeActivePoolComp,
    startActivePoolComp,
    clearHistoricalComp,
    orientation,
    calculateFirstPrizeMoney,
    openModal,
  } = useAppContext();

  const displayComp = activeHistoricalComp ?? activePoolComp;
  const isHistorical = activeHistoricalComp !== null;

  if (!displayComp) return null;

  const compDate = new Date(displayComp.date).toLocaleDateString();

  const firstPrizeMoney =
    !isHistorical && activePoolComp
      ? calculateFirstPrizeMoney(activePoolComp.registeredPlayers)
      : null;

  return (
    <comp-view>
      {orientation === "portrait" ? (
        <>
          <comp-details>
            <comp-details-header>
              {compTitle()}
              {eightBallImage()}
            </comp-details-header>
            {!isHistorical && textBoxes()}
          </comp-details>
          {compActions()}
          <TournamentStructure comp={displayComp} />
        </>
      ) : orientation === "landscape" ? (
        <>
          <left-container>
            {compActions()}
            <TournamentStructure comp={displayComp} />
          </left-container>
          <right-container>
            <comp-details>
              {compTitle()}
              {!isHistorical && textBoxes()}
              {eightBallImage()}
            </comp-details>
          </right-container>
        </>
      ) : null}
      <ScalingImage id="bg-leaves-image" src={leavesImage} />
    </comp-view>
  );

  function compTitle() {
    if (isHistorical) {
      return <view-title>Historical Comp ({compDate})</view-title>;
    }
    return <view-title>Comp Brackets</view-title>;
  }

  function textBoxes() {
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
          <text-box-value>{compDate}</text-box-value>
        </text-box>
      </text-box-container>
    );
  }

  function eightBallImage() {
    return <ScalingImage id="eight-ball-image" src={ballImage} />;
  }

  function compActions() {
    if (isHistorical) {
      return (
        <comp-actions>
          <button onClick={clearHistoricalComp}>Back to Active Comp</button>
        </comp-actions>
      );
    }

    return (
      activePoolComp && (
        <comp-actions>
          {!activePoolComp.started ? (
            <button onClick={() => openModal({ kind: "selectRegisteredPlayers" })}>
              Add Players ({activePoolComp.registeredPlayers.length})
            </button>
          ) : (
            <button onClick={completeActivePoolComp}>Complete Comp</button>
          )}
          {!activePoolComp.started ? (
            <button onClick={startActivePoolComp}>Start Comp</button>
          ) : null}
          <button className="danger" onClick={cancelActivePoolComp}>
            Cancel Comp
          </button>
        </comp-actions>
      )
    );
  }
}
