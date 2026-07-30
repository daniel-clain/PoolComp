import { useEffect, useRef } from "react";
import type { Slot } from "../../../../../../../../../shared/domain";
import { getSecondChancePlayersPool } from "../../../../../../../../../shared/tournament-slot.service";
import { useAppContext } from "../../../../../../../AppContext";
import { getPlayerChoicesForSlot } from "../../../../../../../services/poolComp.service";




type Props = {
  selectedSlot: Slot;
  selectPosition: { x: number, y: number };
  onClose: () => void;
};

export function SlotPlayerSelect({ selectedSlot, selectPosition, onClose, }: Props) {
  const { activePoolComp, players, send, compActiveTab, activeHistoricalComp, compHistory } = useAppContext();
  const panelRef = useRef<HTMLElement>(null);

  const comp = activeHistoricalComp || activePoolComp!;

  const slots = compActiveTab === 'Main Comp' ? comp?.slots! : comp?.secondChanceSlots!;

  const bracketPlayers = compActiveTab === 'Main Comp' ? comp.registeredPlayers : getSecondChancePlayersPool(comp, compHistory);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  const choices = getPlayerChoicesForSlot({ selectedSlot, slots, bracketPlayers });

  if (choices.length === 0) return null;

  function handlePick(playerId: string | undefined) {
    send(['manualAssignPlayerToSlot', { slotId: selectedSlot.id, playerId, isSecondChanceComp: compActiveTab === '2nd Chance Comp' }]);
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
