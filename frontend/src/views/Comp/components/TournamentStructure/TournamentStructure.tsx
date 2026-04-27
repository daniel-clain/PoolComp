import { useState } from "react";

import type { PoolComp } from "../../../../../../shared/domain";
import { useAppContext } from "../../../../AppContext";
import { canSelectWinnerForSlot } from "../../../../services/poolComp.service";
import {
  calculateSlotPositions,
  type SlotWithPosition,
} from "../../../../services/tournamentStructure.service";
import { Connector } from "./components/Connector";
import { Slot } from "./components/Slot";
import { SlotMatchupSelect } from "./components/SlotMatchupSelect";

type Props = {
  comp: PoolComp;
};

export function TournamentStructure({ comp }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<SlotWithPosition | null>(
    null,
  );
  const { userIsCompManager } = useAppContext();

  if (comp.slots.length === 0) return null;

  const layout = calculateSlotPositions(comp.slots);
  const isHistoricalComp = !('registeredPlayers' in comp)
  const isInteractive = !isHistoricalComp && userIsCompManager


  function handleSlotSelect(slotWithPosition: SlotWithPosition) {
    if (!canSelectWinnerForSlot(slotWithPosition.slot.id, comp.slots)) return;
    setSelectedSlot(slotWithPosition);
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
          <Slot
            key={slotWithPosition.slot.id}
            slotWithPosition={slotWithPosition}
            onSelect={() => isInteractive && handleSlotSelect(slotWithPosition)}
          />
        ))}
        {selectedSlot && (
          <SlotMatchupSelect
            slots={comp.slots}
            slotWithPosition={selectedSlot}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </tournament-structure-inner>
    </tournament-structure>
  );
}
