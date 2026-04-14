import { useAppContext } from "../../AppContext";
import { SelectRegisteredPlayersContent } from "../../views/Comp/components/SelectRegisteredPlayersContent";
import { UpdatePlayerContent } from "../../views/Players/components/UpdatePlayerContent";
import { Modal } from "./Modal";

export function ModalHost() {
  const { modal, closeModal } = useAppContext();

  if (!modal) return null;

  return (
    <Modal onClose={closeModal}>
      {(() => {
        switch (modal.kind) {
          case "selectRegisteredPlayers":
            return <SelectRegisteredPlayersContent />;
          case "updatePlayer":
            return <UpdatePlayerContent playerId={modal.playerId} />;
        }
      })()}
    </Modal>
  );
}
