import { useState } from "react";
import { useAppContext } from "../../../../AppContext";
import { calculateSlotPositions } from "../../../../services/tournamentStructure.service";
import { Connector } from "./components/Connector";
import { Slot } from "./components/Slot";
import { SlotPlayerSelectModal } from "./components/SlotPlayerSelectModal";

export function TournamentStructure() {
  const { activePoolComp } = useAppContext();
  const [slotPlayerSelectionModalOpen, setSlotPlayerSelectionModalOpen] =
    useState<string>();
  if (!activePoolComp) return null;

  const { slotWithPositions, connectors } = calculateSlotPositions(
    activePoolComp.slots,
  );

  return (
    <tournament-structure>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {connectors.map((connector, index) => (
          <Connector key={index} connector={connector} />
        ))}
      </svg>
      {slotWithPositions.map((slotWithPosition) => (
        <Slot
          key={slotWithPosition.slot.id}
          slotWithPosition={slotWithPosition}
          setSlotPlayerSelectionModalOpen={() =>
            setSlotPlayerSelectionModalOpen(slotWithPosition.slot.id)
          }
        />
      ))}
      {slotPlayerSelectionModalOpen && (
        <SlotPlayerSelectModal slotId={slotPlayerSelectionModalOpen} />
      )}
    </tournament-structure>
  );
}
