import { useMemo } from "react";
import type { RegisteredPlayer } from "../../../../../../shared/domain";
import { compStarted } from "../../../../../../shared/tournament-slot.service";
import { useAppContext } from "../../../../AppContext";
import { RemovePlayerFromCompConfirmModal } from "./RemovePlayerFromCompConfirmModal";

export function CompPlayers({
  registeredPlayers,
  canAddMorePlayersDisabled,
}: {
  registeredPlayers: Array<RegisteredPlayer | null>;
  canAddMorePlayersDisabled: boolean;
}) {
  const {
    players,
    send,
    userIsCompManager,
    activePoolComp,
    setModalContent,
  } = useAppContext();

  const compHasStarted = useMemo(() => {
    return activePoolComp?.slots && compStarted(activePoolComp.slots)
  }, [activePoolComp?.slots])


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
            {registeredPlayers.map((registeredPlayer, index) =>
              registeredPlayer
                ? (
                  <registered-player-cell key={registeredPlayer.id}>
                    <button
                      type="button"
                      className="active"
                      onClick={() => askToRemovePlayer(registeredPlayer)}
                      disabled={compHasStarted || !userIsCompManager}
                    >
                      {registeredPlayer.name}
                    </button>
                    <input
                      type="checkbox"
                      checked={registeredPlayer.paid}
                      onChange={() =>
                        send(['togglePlayerPaid', { playerId: registeredPlayer.id, paid: !registeredPlayer.paid }])
                      }
                      disabled={!userIsCompManager}
                    />
                  </registered-player-cell>
                )
                : (
                  <registered-player-cell key={`unknown-player-${index}`}>
                    <button type="button" disabled>
                      Unknown player
                    </button>
                  </registered-player-cell>
                )
            )}
          </player-grid>
        )}
      </registered-players-panel>
      {userIsCompManager && <all-players-panel className="panel-container">
        <panel-heading>All players</panel-heading>
        <player-grid>
          {databasePlayersForGrid.map((player) => {
            const registeredPlayer = registeredPlayers.find(
              (registered) => registered?.id === player.id,
            ) ?? null;
            const isRegistered = Boolean(registeredPlayer);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  if (registeredPlayer) {
                    askToRemovePlayer(registeredPlayer);
                    return;
                  }
                  send(['addPlayerToComp', { playerId: player.id }]);
                }}
                className={isRegistered ? "active" : ""}
                disabled={canAddMorePlayersDisabled || !userIsCompManager}
              >
                {player.name}
              </button>
            );
          })}
        </player-grid>
      </all-players-panel>}
    </comp-players>
  );

  function askToRemovePlayer(player: RegisteredPlayer) {
    setModalContent(<RemovePlayerFromCompConfirmModal player={player} />);
  }
}
