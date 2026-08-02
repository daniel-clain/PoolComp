
import type { SlotWithPosition } from "../../../../../../../services/tournamentStructure.service";

type Props = {
  slotWithPosition: SlotWithPosition;
  onSelect: () => void;
};

export function SlotElement({ slotWithPosition, onSelect }: Props) {
  const { slot, x, y, width, height, fontSize } = slotWithPosition;

  let label = "";
  if (slot.player) {
    label = slot.player.name ?? "";
  } else if (slot.isBye) {
    label = "BYE";
  } else {
    label = "";
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
      className={slot.isBye && "danger"}
      onClick={onSelect}
    >
      {label}
    </tournament-slot>
  );
}
