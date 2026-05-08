import { useEffect, useRef } from "react";
import type { Slot } from "../../../../../../../shared/domain";
import { useAppContext } from "../../../../../AppContext";
import {
  getPlayerChoicesForSlot,
} from "../../../../../services/poolComp.service";


type Props = {
  selectedSlot: Slot;
  selectPosition: { x: number, y: number };
  onClose: () => void;
  slots: Slot[];
};

export function SlotPlayerSelect({ selectedSlot, selectPosition, onClose, slots }: Props) {
  const { activePoolComp, players, send } = useAppContext();
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
    selectedSlot,
    slots,
    activePoolComp?.registeredPlayers!,
    players,
  );

  if (choices.length === 0) return null;

  function handlePick(playerId: string | undefined) {
    send(['manualAssignPlayerToSlot', { slotId: selectedSlot.id, playerId }]);
    onClose();
  }

  return (
    <slot-matchup-select
      ref={panelRef}
      style={{
        left: `${selectPosition.x}cqw`,
        top: `${selectPosition.y}cqh`
      }}
    >
      {selectedSlot.playerId && (
        <button className="danger" onClick={() => handlePick(undefined)}>
          Clear
        </button>
      )}
      {choices.map(({ player, isUnassigned }) => (
        <button key={player.id} className={isUnassigned ? "primary" : ""} onClick={() => handlePick(player.id)}>
          {player.name}
        </button>
      ))}
    </slot-matchup-select>
  );
}
