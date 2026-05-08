import type { RegisteredPlayer } from "../../../../../../shared/domain";
import { useAppContext } from "../../../../AppContext";

export function CompPlayers({ registeredPlayers, canAddMorePlayersDisabled }: { registeredPlayers: RegisteredPlayer[], canAddMorePlayersDisabled: boolean }) {
  const {
    players,
    send,
  } = useAppContext();


  const databasePlayersForGrid = players.filter(
    (player) => !player.deactivated,
  );

  return (
    <comp-players>
      <registered-players-panel className="panel-container">
        <panel-heading>Registered for this comp ({registeredPlayers.length})</panel-heading>
        {registeredPlayers.length === 0 ? (
          <no-data-message>No players registered yet.</no-data-message>
        ) : (
          <player-grid>
            {registeredPlayers.map((registeredPlayer) => (
              <registered-player-cell key={registeredPlayer.playerId}>
                <button
                  type="button"
                  className="active"
                  onClick={() =>
                    send(['removePlayerFromComp', { playerId: registeredPlayer.playerId }])
                  }
                >
                  {players.find((player) => player.id === registeredPlayer.playerId)!.name}
                </button>
                <input
                  type="checkbox"
                  checked={registeredPlayer.paid}
                  onChange={() =>
                    send(['togglePlayerPaid', { playerId: registeredPlayer.playerId, paid: !registeredPlayer.paid }])
                  }
                />
              </registered-player-cell>
            ))}
          </player-grid>
        )}
      </registered-players-panel>
      <all-players-panel className="panel-container">
        <panel-heading>All players</panel-heading>
        <player-grid>
          {databasePlayersForGrid.map((player) => {
            const isRegistered = registeredPlayers.some(
              (registeredPlayer) => registeredPlayer.playerId === player.id,
            );
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => send([isRegistered ? 'removePlayerFromComp' : 'addPlayerToComp', { playerId: player.id }])}
                className={isRegistered ? "active" : ""}
                disabled={canAddMorePlayersDisabled}
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
