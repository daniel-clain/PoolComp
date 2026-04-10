import { type MouseEvent } from "react";
import "./PlayerSelectModal.scss";

type PlayerSelectModalProps = {
  open: boolean;
  onClose: () => void;
  players: string[];
  selectedPlayerNames: string[];
  onTogglePlayer: (name: string) => void;
};

export function PlayerSelectModal({
  open,
  onClose,
  players,
  selectedPlayerNames,
  onTogglePlayer,
}: PlayerSelectModalProps) {
  if (!open) return null;

  return (
    <player-modal-overlay onClick={onClose}>
      <player-modal
        onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <player-modal-title>Select Players</player-modal-title>
        <player-grid>
          {players.map((player) => {
            const isSelected = selectedPlayerNames.includes(player);
            return (
              <button
                key={player}
                onClick={() => onTogglePlayer(player)}
                data-selected={isSelected ? "true" : "false"}
              >
                {player}
              </button>
            );
          })}
        </player-grid>
      </player-modal>
    </player-modal-overlay>
  );
}
