import { useState } from "react";
import { useAppContext } from "../../../../AppContext";
import { canSelectWinnerForSlot } from "../../../../services/poolComp.service";
import { calculateSlotPositions, type SlotWithPosition } from "../../../../services/tournamentStructure.service";
import type { PoolComp } from "../../../../../../shared/domain";
import { Connector } from "./components/Connector";
import { Slot } from "./components/Slot";
import { SlotMatchupSelect } from "./components/SlotMatchupSelect";

type Props = {
  comp: PoolComp;
};

export function TournamentStructure({ comp }: Props) {
  const { activePoolComp, activeHistoricalComp } = useAppContext();
  const [selectedSlot, setSelectedSlot] = useState<SlotWithPosition | null>(null);

  if (comp.slots.length === 0) return null;

  const layout = calculateSlotPositions(comp.slots);
  const isInteractive = activeHistoricalComp === null && activePoolComp?.started === true;

  function handleSlotSelect(slotWithPosition: SlotWithPosition) {
    if (!isInteractive) return;
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
            onSelect={() => handleSlotSelect(slotWithPosition)}
          />
        ))}
        {selectedSlot && isInteractive && (
          <SlotMatchupSelect
            slotWithPosition={selectedSlot}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </tournament-structure-inner>
    </tournament-structure>
  );
}
