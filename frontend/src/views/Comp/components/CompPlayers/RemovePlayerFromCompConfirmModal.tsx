import type { RegisteredPlayer } from "../../../../../../shared/domain";
import { useAppContext } from "../../../../AppContext";

export function RemovePlayerFromCompConfirmModal({
  player,
}: {
  player: RegisteredPlayer;
}) {
  const { send, setModalContent } = useAppContext();

  function confirmRemove() {
    send(["removePlayerFromComp", { playerId: player.id }]);
    setModalContent();
  }

  function cancel() {
    setModalContent();
  }

  return (
    <remove-player-from-comp-confirm>
      <confirm-heading>Remove player?</confirm-heading>
      <confirm-message>
        Are you sure you want to remove {player.name} from this comp?
      </confirm-message>
      <confirm-actions>
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="button" className="danger" onClick={confirmRemove}>
          Remove
        </button>
      </confirm-actions>
    </remove-player-from-comp-confirm>
  );
}
