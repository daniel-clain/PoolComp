import { useState } from "react";
import { useAppContext } from "../../../AppContext";

type Props = {
  playerId: string;
};

export function UpdatePlayerModal({ playerId }: Props) {
  const {
    players,
    send,
    closeModal,
  } = useAppContext();
  const player = players.find((candidate) => candidate.id === playerId);
  const [name, setName] = useState(player?.name ?? "");

  if (!player) return null;

  const trimmedName = name.trim();
  const isDirty = trimmedName !== "" && trimmedName !== player.name;

  function handleSave() {
    if (!isDirty) return;
    send(['updatePlayer', { playerId, name: trimmedName }]);
    closeModal();
  }

  function handleToggleActive() {
    if (player!.deactivated) {
      send(['activatePlayer', { playerId }]);
    } else {
      send(['deactivatePlayer', { playerId }]);
    }
    closeModal();
  }

  return (
    <>
      <app-modal-title>Update Player</app-modal-title>
      <app-modal-body>
        <modal-field>
          <modal-field-label>Player ID</modal-field-label>
          <input type="text" value={player.id} readOnly />
        </modal-field>
        <modal-field>
          <modal-field-label>Name</modal-field-label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </modal-field>
      </app-modal-body>
      <app-modal-actions>
        <button className="danger" onClick={handleToggleActive}>
          {player.deactivated ? "Activate Player" : "Deactivate Player"}
        </button>
        <button onClick={closeModal}>Close</button>
        <button
          className={isDirty ? "is-primary" : ""}
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save
        </button>
      </app-modal-actions>
    </>
  );
}
