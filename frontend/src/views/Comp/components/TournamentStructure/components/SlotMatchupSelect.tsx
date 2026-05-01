import { useEffect, useRef } from "react";
import { useAppContext } from "../../../../../AppContext";
import {
  getPlayerChoicesForSlot,
} from "../../../../../services/poolComp.service";
import type { SlotWithPosition } from "../../../../../services/tournamentStructure.service";
import type { Slot } from "../../../../../../../shared/domain";


type Props = {
  selectedSlot: SlotWithPosition;
  onClose: () => void;
  slots: Slot[];
};

export function SlotMatchupSelect({ selectedSlot, onClose, slots }: Props) {
  const { activePoolComp, send } = useAppContext();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  const choices = getPlayerChoicesForSlot(
    selectedSlot.slot,
    slots,
    activePoolComp?.registeredPlayers!,
  );

  if (choices.length === 0) return null;

  function handlePick(playerId: string) {
    send(['manualAssignPlayerToSlot', { slotId: selectedSlot.slot.id, playerId }]);
    onClose();
  }

  return (
    <slot-matchup-select
      ref={panelRef}
      style={{
        left: `${selectedSlot.x}cqw`,
        top: `${selectedSlot.y + selectedSlot.height + 0.5}cqh`
      }}
    >
      {choices.map((choice) => (
        <button key={choice.id} onClick={() => handlePick(choice.id)}>
          {choice.name}
        </button>
      ))}
    </slot-matchup-select>
  );
}
