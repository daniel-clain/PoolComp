import { useAppContext } from "../../../../../AppContext";
import type { SlotWithPosition } from "../../../../../services/tournamentStructure.service";

type Props = {
  slotWithPosition: SlotWithPosition;
  onSelect: () => void;
};

export function Slot({ slotWithPosition, onSelect }: Props) {
  const { players } = useAppContext();
  const { slot, x, y, width, height, fontSize } = slotWithPosition;

  let label = "";
  if (slot.kind === "player") {
    label = players.find((player) => player.id === slot.playerId)?.name ?? "";
  } else if (slot.kind === "bye") {
    label = "BYE";
  }

  return (
    <tournament-slot
      style={{
        left: `${x}cqw`,
        top: `${y}cqh`,
        width: `${width}cqw`,
        height: `${height}cqh`,
        fontSize: `${fontSize}cqh`,
      }}
      className={`is-${slot.kind}`}
      onClick={onSelect}
    >
      {label}
    </tournament-slot>
  );
}
