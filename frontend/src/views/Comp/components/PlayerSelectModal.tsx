import { type MouseEvent } from "react";
import { useAppContext } from "../../../AppContext";
import "./PlayerSelectModal.scss";

type PlayerSelectModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PlayerSelectModal({ open, onClose }: PlayerSelectModalProps) {
  const { players, activePoolComp, togglePlayerInActivePoolComp } =
    useAppContext();

  if (!open) return null;

  return (
    <player-modal-overlay onClick={onClose}>
      <player-modal
        onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <player-modal-title>Select Players</player-modal-title>
        <player-grid>
          {players.map((player) => {
            const isSelected = activePoolComp?.registerdPlayers.some(
              (rp) => rp.id === player.id,
            );
            return (
              <button
                key={player.id}
                onClick={() => togglePlayerInActivePoolComp(player.id)}
                data-selected={isSelected ? "true" : "false"}
              >
                {player.name}
              </button>
            );
          })}
        </player-grid>
      </player-modal>
    </player-modal-overlay>
  );
}
