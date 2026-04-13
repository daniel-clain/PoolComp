import { useState } from "react";
import { useAppContext } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import crownImage from "../../assets/crown.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { PlayerSelectModal } from "./components/PlayerSelectModal";
import { TournamentStructure } from "./components/TournamentStructure/TournamentStructure";

export function Comp() {
  const {
    activePoolComp,
    cancelActivePoolComp,
    completeActivePoolComp,
    players,
    startActivePoolComp,
    togglePlayerInActivePoolComp,
    orientation,
    calculateFirstPrizeMoney,
  } = useAppContext();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  if (!activePoolComp) return null;

  const sortedPlayers = [...players].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const compDate = new Date(activePoolComp.date).toLocaleDateString();

  const firstPrizeMoney = calculateFirstPrizeMoney(
    activePoolComp.registerdPlayers,
  );
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
          <TournamentStructure />
        </>
      ) : orientation === "landscape" ? (
        <>
          <left-container>
            {compActions()}
            <TournamentStructure />
          </left-container>
          <right-container>
            {
              <comp-details>
                {compTitle()}
                {textBoxes()}
                {eightBallImage()}
              </comp-details>
            }
          </right-container>
        </>
      ) : null}
      <ScalingImage id="bg-leaves-image" src={leavesImage} />

      <PlayerSelectModal
        open={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
      />
    </comp-view>
  );

  function compTitle() {
    return <comp-title>Comp Brackets</comp-title>;
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
    return (
      activePoolComp && (
        <comp-actions>
          {!activePoolComp.started ? (
            <button onClick={() => setIsPlayerModalOpen(true)}>
              Add Players ({activePoolComp.registerdPlayers.length})
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
