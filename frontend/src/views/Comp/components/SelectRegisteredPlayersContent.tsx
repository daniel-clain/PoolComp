import { useAppContext } from "../../../AppContext";

export function SelectRegisteredPlayersContent() {
  const { players, activePoolComp, send } =
    useAppContext();

  return (
    <>
      <app-modal-title>Select Players</app-modal-title>
      <player-grid>
        {players
          .filter((player) => !player.deactivated)
          .map((player) => {
            const isSelected = activePoolComp?.registeredPlayers.some(
              (registeredPlayer) => registeredPlayer.id === player.id,
            );
            return (
              <button
                key={player.id}
                onClick={() =>
                  send({
                    message: isSelected ? "removePlayerFromComp" : "addPlayerToComp",
                    data: { playerId: player.id },
                  })
                }
                className={isSelected ? "is-selected" : ""}
              >
                {player.name}
              </button>
            );
          })}
      </player-grid>
    </>
  );
}
