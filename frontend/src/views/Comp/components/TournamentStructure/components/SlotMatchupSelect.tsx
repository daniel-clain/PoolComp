import { useEffect, useRef } from "react";
import { useAppContext } from "../../../../../AppContext";
import {
  getPlayerChoicesForSlot,
} from "../../../../../services/poolComp.service";
import type { SlotWithPosition } from "../../../../../services/tournamentStructure.service";
import type { Slot } from "../../../../../../../shared/domain";


type Props = {
  slotWithPosition: SlotWithPosition;
  onClose: () => void;
  slots: Slot[];
};

export function SlotMatchupSelect({ slotWithPosition, onClose, slots }: Props) {
  const { players, send } = useAppContext();
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
    slotWithPosition.slot.id,
    slots,
    players,
  );

  if (choices.length === 0) return null;

  function handlePick(playerId: string) {
    send(['manualAssignPlayerToSlot', { slotId: slotWithPosition.slot.id, playerId }]);
    onClose();
  }

  return (
    <slot-matchup-select
      ref={panelRef}
      style={{
        left: `${slotWithPosition.x}cqw`,
        top: `${slotWithPosition.y + slotWithPosition.height + 0.5}cqh`,
        width: `${slotWithPosition.width}cqw`,
      }}
    >
      {choices.map((choice) => (
        <button key={choice.playerId} onClick={() => handlePick(choice.playerId)}>
          {choice.playerName}
        </button>
      ))}
    </slot-matchup-select>
  );
}
