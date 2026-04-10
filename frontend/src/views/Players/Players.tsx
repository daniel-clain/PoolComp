import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useAppContext } from "../../AppContext";

export function Players() {
  const { players, addGlobalPlayer, removeGlobalPlayer } = useAppContext();
  const [playerName, setPlayerName] = useState("");
  const commitNewPlayer = () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      return;
    }
    addGlobalPlayer(trimmed);
    setPlayerName("");
  };

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
      <player-title>Players</player-title>
      <player-input-row>
        <input
          type="text"
          value={playerName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={commitNewPlayer}>
          Add Player
        </button>
      </player-input-row>
      <player-list>
        {players.length === 0 ? (
          <player-empty>No players added yet.</player-empty>
        ) : (
          players.map((player) => (
            <player-row key={player}>
              <player-name>{player}</player-name>
              <button type="button" onClick={() => removeGlobalPlayer(player)}>
                Remove
              </button>
            </player-row>
          ))
        )}
      </player-list>
    </player-view>
  );
}
