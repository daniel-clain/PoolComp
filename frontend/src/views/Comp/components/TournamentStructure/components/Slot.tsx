import { useAppContext } from "../../../../../AppContext";
import type { SlotWithPosition } from "../../../../../services/tournamentStructure.service";

type Props = {
  slotWithPosition: SlotWithPosition;
  setSlotPlayerSelectionModalOpen: (slotId: string) => void;
};

export function Slot({
  slotWithPosition,
  setSlotPlayerSelectionModalOpen,
}: Props) {
  const { players } = useAppContext();
  const { slot, slotPosition, slotSize, fontSize } = slotWithPosition;
  const playerName = players.find((p) => p.id === slot.playerId)?.name;
  return (
    <tournament-slot
      key={slot.id}
      style={{
        left: `${slotPosition.x}cqw`,
        top: `${slotPosition.y}cqh`,
        width: `${slotSize.width}cqw`,
        height: `${slotSize.height}cqh`,
        fontSize: `${fontSize}cqw`,
      }}
      onClick={() => setSlotPlayerSelectionModalOpen(slot.id)}
    >
      {playerName}
    </tournament-slot>
  );
}
