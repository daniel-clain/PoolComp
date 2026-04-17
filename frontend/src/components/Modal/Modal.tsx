import { type MouseEvent, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ onClose, children }: ModalProps) {
  return (
    <app-modal-overlay onClick={onClose}>
      <app-modal
        onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        {children}
      </app-modal>
    </app-modal-overlay>
  );
}
