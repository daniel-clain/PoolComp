import { useAppContext } from "../../AppContext";
import { UpdatePlayerModal } from "../../views/Players/components/UpdatePlayerContent";
import { Modal } from "./Modal";

export function ModalHost() {
  const { modal, closeModal } = useAppContext();

  if (!modal) return null;

  return (
    <Modal onClose={closeModal}>
      {(() => {
        switch (modal.kind) {
          case "updatePlayer":
            return <UpdatePlayerModal playerId={modal.playerId} />;
        }
      })()}
    </Modal>
  );
}
