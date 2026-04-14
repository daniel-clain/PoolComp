import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useAppContext } from "../../AppContext";

export function Players() {
  const { players, addPlayer, openModal } = useAppContext();
  const [playerName, setPlayerName] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  const visiblePlayers = showDeactivated
    ? players
    : players.filter((player) => !player.deactivated);

  function commitNewPlayer() {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setPlayerName("");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setPlayerName(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commitNewPlayer();
    }
  }

  return (
    <player-view>
      <player-header>
        <view-title>Players</view-title>
      </player-header>
      <player-input-row>
        <input
          type="text"
          value={playerName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="New player name"
        />
        <button type="button" onClick={commitNewPlayer}>
          Add Player
        </button>
      </player-input-row>
      <player-grid-container>
        <player-filter>
          <label>
            <input
              type="checkbox"
              checked={showDeactivated}
              onChange={(event) => setShowDeactivated(event.target.checked)}
            />
            Show deactivated
          </label>
        </player-filter>
        <player-grid>
          {visiblePlayers.length === 0 ? (
            <player-empty>No players added yet.</player-empty>
          ) : (
            visiblePlayers.map((player) => (
              <button
                key={player.id}
                className={player.deactivated ? "is-deactivated" : ""}
                onClick={() => openModal({ kind: "updatePlayer", playerId: player.id })}
              >
                {player.name}
              </button>
            ))
          )}
        </player-grid>
      </player-grid-container>
    </player-view>
  );
}
