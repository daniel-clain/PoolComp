import { useAppContext } from "../../../../AppContext";

export function CompPlayers() {
  const {
    players,
    activePoolComp,
    togglePlayerInActivePoolComp,
    toggleRegisteredPlayerPaid,
  } = useAppContext();

  if (!activePoolComp) return null;

  const databasePlayersForGrid = players.filter(
    (player) => !player.deactivated,
  );

  return (
    <comp-players>
      <registered-players-panel className="players-panel">
        <comp-players-heading>Registered for this comp</comp-players-heading>
        {activePoolComp.registeredPlayers.length === 0 ? (
          <no-data-message>No players registered yet.</no-data-message>
        ) : (
          <player-grid>
            {activePoolComp.registeredPlayers.map((registeredPlayer) => (
              <registered-player-cell key={registeredPlayer.id}>
                <button
                  type="button"
                  className="active"
                  onClick={() =>
                    togglePlayerInActivePoolComp(registeredPlayer.id)
                  }
                >
                  {registeredPlayer.name}
                </button>
                <input
                  type="checkbox"
                  checked={registeredPlayer.paid}
                  onChange={() =>
                    toggleRegisteredPlayerPaid(registeredPlayer.id)
                  }
                />
              </registered-player-cell>
            ))}
          </player-grid>
        )}
      </registered-players-panel>
      <all-players-panel className="players-panel">
        <comp-players-heading>All players</comp-players-heading>
        <player-grid>
          {databasePlayersForGrid.map((player) => {
            const isSelected = activePoolComp?.registeredPlayers.some(
              (registeredPlayer) => registeredPlayer.id === player.id,
            );
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayerInActivePoolComp(player.id)}
                className={isSelected ? "active" : ""}
              >
                {player.name}
              </button>
            );
          })}
        </player-grid>
      </all-players-panel>
    </comp-players>
  );
}
