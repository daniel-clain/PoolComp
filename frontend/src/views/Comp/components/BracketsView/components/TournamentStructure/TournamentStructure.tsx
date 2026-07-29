import { useState } from "react";

import type { Slot } from "../../../../../../../../shared/domain";
import { useAppContext } from "../../../../../../AppContext";

import { canSetSlot } from "../../../../../../services/poolComp.service";
import {
  calculateSlotPositions,
} from "../../../../../../services/tournamentStructure.service";
import { Connector } from "./components/Connector";
import { SlotElement } from "./components/Slot";
import { SlotPlayerSelect } from "./components/SlotPlayerSelect";

type Props = {
  slots: Slot[];
  isHistoricalComp: boolean;
};

export function TournamentStructure({ slots, isHistoricalComp }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    null,
  );
  const { userIsCompManager } = useAppContext();

  if (slots.length === 0) return null;

  const layout = calculateSlotPositions(slots);
  const isInteractive = !isHistoricalComp && userIsCompManager


  function handleSlotSelect(slot: Slot) {
    if (!canSetSlot(slot, slots)) return;
    setSelectedSlot(slot);
  }

  return (
    <tournament-structure
      style={
        {
          "--tournament-structure-aspect-ratio": layout.aspectRatio,
        } as React.CSSProperties
      }
    >
      <tournament-structure-inner>
        <svg viewBox={layout.viewBox} preserveAspectRatio="xMidYMid meet">
          {layout.connectors.map((connector, i) => (
            <Connector key={i} connector={connector} />
          ))}
        </svg>
        {layout.slotWithPositions.map((slotWithPosition) => (
          <SlotElement
            key={slotWithPosition.slot.id}
            slotWithPosition={slotWithPosition}
            onSelect={() => isInteractive && handleSlotSelect(slotWithPosition.slot)}
          />
        ))}
        {selectedSlot && (
          <SlotPlayerSelect
            selectedSlot={selectedSlot}
            slots={slots}
            selectPosition={getSelectPosition(selectedSlot)}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </tournament-structure-inner>
    </tournament-structure>
  );

  function getSelectPosition(slot: Slot): { x: number, y: number } {
    const { x, y, height } = layout.slotWithPositions.find(slotWithPosition => slotWithPosition.slot.id === slot.id)!;
    return { x, y: y + height };
  }
}
