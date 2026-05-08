import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useAppContext } from "../../AppContext";
import { UpdatePlayerModal } from "./components/UpdatePlayerContent";

export function Players() {
  const { players, send, setModalContent } = useAppContext();
  const [playerName, setPlayerName] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  const visiblePlayers = showDeactivated
    ? players
    : players.filter((player) => !player.deactivated);

  const deactivatedPlayersCount = players.length - visiblePlayers.length;


  function addPlayer() {
    const name = playerName.trim();
    if (!name) return;
    send(['addPlayer', { name }]);
    setPlayerName("");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setPlayerName(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      addPlayer();
    }
  }


  function handlePlayerSelected(playerId: string) {
    const player = players.find((player) => player.id === playerId)!;


    setModalContent(<UpdatePlayerModal player={player} />)
  }

  return (
    <player-view>
      <view-title>Players</view-title>
      <player-input-row>
        <input
          type="text"
          value={playerName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="New player name"
        />
        <button type="button" onClick={addPlayer}>
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
            Show deactivated ({deactivatedPlayersCount})
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
                onClick={() =>
                  handlePlayerSelected(player.id)
                }
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
