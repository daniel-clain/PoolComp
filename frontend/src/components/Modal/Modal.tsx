import { type MouseEvent } from "react";
import { useAppContext } from "../../AppContext";

export function Modal() {
  const { modalContent, setModalContent } = useAppContext();
  if (!modalContent) return null;
  return (
    <modal-overlay onClick={() => setModalContent()}>
      <modal-container
        onClick={stopClicksInsideFromClosingTheModal}
      >

        <modal-content>{modalContent}</modal-content>
      </modal-container>
    </modal-overlay>
  );

  function stopClicksInsideFromClosingTheModal(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }
}
