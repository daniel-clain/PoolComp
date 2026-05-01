import { useAppContext } from "../../../../../AppContext";
import type { SlotWithPosition } from "../../../../../services/tournamentStructure.service";

type Props = {
  slotWithPosition: SlotWithPosition;
  onSelect: () => void;
};

export function SlotElement({ slotWithPosition, onSelect }: Props) {
  const { players } = useAppContext();
  const { slot, x, y, width, height, fontSize } = slotWithPosition;

  let label = "";
  if (slot.playerId) {
    label = players.find((player) => player.id === slot.playerId)?.name ?? "";
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
      className={`is-${slot.playerId ? "player" : slot.isBye ? "bye" : "empty"}`}
      onClick={onSelect}
    >
      {label}
    </tournament-slot>
  );
}
