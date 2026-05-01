import { useState } from "react";

import type { PoolComp } from "../../../../../../shared/domain";
import { useAppContext } from "../../../../AppContext";
import { canSetSlot } from "../../../../services/poolComp.service";
import {
  calculateSlotPositions,
} from "../../../../services/tournamentStructure.service";
import { Connector } from "./components/Connector";
import { SlotElement } from "./components/Slot";
import { SlotMatchupSelect } from "./components/SlotMatchupSelect";
import type { Slot } from "../../../../../../shared/domain";

type Props = {
  comp: PoolComp;
};

export function TournamentStructure({ comp }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    null,
  );
  const { userIsCompManager } = useAppContext();

  if (comp.slots.length === 0) return null;

  const layout = calculateSlotPositions(comp.slots);
  const isHistoricalComp = !('registeredPlayers' in comp)
  const isInteractive = !isHistoricalComp && userIsCompManager


  function handleSlotSelect(slot: Slot) {
    if (!canSetSlot(slot, comp.slots)) return;
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
          <SlotMatchupSelect
            selectedSlot={layout.slotWithPositions.find(slotWithPosition => slotWithPosition.slot.id === selectedSlot.id)!}
            slots={comp.slots}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </tournament-structure-inner>
    </tournament-structure>
  );
}
