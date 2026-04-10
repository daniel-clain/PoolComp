import { useState } from "react";
import { useAppContext } from "../../AppContext";
import ballImage from "../../assets/8ball.png";
import leavesImage from "../../assets/crossleaves.png";
import crownImage from "../../assets/crown.png";
import { ScalingImage } from "../../components/ScalingImage/ScalingImage";
import { formatAud } from "../../utils/utils";
import { BracketSvg } from "./components/BracketSvg";
import { PlayerSelectModal } from "./components/PlayerSelectModal";

export function Comp() {
  const {
    activePoolComp,
    cancelActivePoolComp,
    completeActivePoolComp,
    players: globalPlayers,
    startActivePoolComp,
    togglePlayerInActivePoolComp,
    weeklyPrizePreview,
    orientation,
  } = useAppContext();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  if (!activePoolComp) return null;

  const sortedPlayers = [...globalPlayers].sort((a, b) => a.localeCompare(b));
  const selectedPlayerCount = activePoolComp.players.length;
  const compDate = new Date(activePoolComp.createdAt).toLocaleDateString();

  const firstPrizeDisplay = weeklyPrizePreview
    ? formatAud(weeklyPrizePreview.firstPrize)
    : "—";

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
          {tournamentBrackets()}
        </>
      ) : orientation === "landscape" ? (
        <>
          <left-container>
            {compActions()}
            {tournamentBrackets()}
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
        players={sortedPlayers}
        selectedPlayerNames={activePoolComp.players}
        onTogglePlayer={togglePlayerInActivePoolComp}
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
          <text-box-value>{firstPrizeDisplay}</text-box-value>
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

  function tournamentBrackets() {
    return (
      activePoolComp && (
        <tournament-brackets>
          <BracketSvg playerNames={activePoolComp.players} />
        </tournament-brackets>
      )
    );
  }

  function compActions() {
    return (
      activePoolComp && (
        <comp-actions>
          {!activePoolComp.started ? (
            <button
              className="small"
              onClick={() => setIsPlayerModalOpen(true)}
            >
              Add Players ({selectedPlayerCount})
            </button>
          ) : (
            <button className="small" onClick={completeActivePoolComp}>
              Complete Comp
            </button>
          )}
          {!activePoolComp.started ? (
            <button className="small" onClick={startActivePoolComp}>
              Start Comp
            </button>
          ) : null}
          <button className="small danger" onClick={cancelActivePoolComp}>
            Cancel Comp
          </button>
        </comp-actions>
      )
    );
  }
}
