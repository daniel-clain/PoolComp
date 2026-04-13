import type { Slot } from "../../../shared/domain";

export type SlotWithPosition = {
  slot: Slot;
  slotPosition: { x: number; y: number }; // These will be percentages (0-100)
  slotSize: { width: number; height: number }; // Percentages for cqw/cqh
  fontSize: number; // cqw units
};
type Connector = {
  path: string; // SVG path using percentage coordinates
};
export function calculateSlotPositions(slots: Slot[]) {
  // Derive bracket size from slots length
  // For a bracket: totalSlots = bracketSize * 2 - 1
  // So bracketSize = (totalSlots + 1) / 2
  const totalSlots = slots.length;
  const bracketSize = (totalSlots + 1) / 2;

  // Validate it's a valid bracket size (8, 16, or 32)
  if (![8, 16, 32].includes(bracketSize)) {
    throw new Error(`Invalid bracket size derived from ${totalSlots} slots`);
  }

  const totalRounds = Math.log2(bracketSize); // 3, 4, or 5
  const slotsWithPositions: SlotWithPosition[] = [];
  const connectors: Connector[] = [];

  // Calculate round for each slot based on its slot number
  // Slot numbers follow binary tree: 1=champion, 2-3=finals, 4-7=semis, etc.
  function getRoundFromSlotNumber(slotNumber: number): number {
    if (slotNumber === 1) return totalRounds; // Champion is rightmost
    return totalRounds - Math.floor(Math.log2(slotNumber));
  }

  // Calculate vertical position within round
  // For a given round, slots are evenly spaced from top to bottom
  function getVerticalPosition(slotNumber: number, round: number): number {
    const slotsInRound = Math.pow(2, round);
    // Find the index of this slot within its round (0 to slotsInRound-1)
    const firstSlotInRound = Math.pow(2, round);
    const slotIndex = slotNumber - firstSlotInRound;
    // Center the slot in its vertical segment (0% to 100%)
    return ((slotIndex + 0.5) / slotsInRound) * 100;
  }

  // Calculate horizontal position (0% = left/first round, 100% = right/champion)
  function getHorizontalPosition(round: number, totalRounds: number): number {
    // Round 0 (first round) at 0%, Round totalRounds (champion) at 100%
    return (round / totalRounds) * 100;
  }

  // Calculate slot dimensions based on bracket size
  // More slots = smaller boxes
  function getSlotDimensions(bracketSize: number): {
    width: number;
    height: number;
    fontSize: number;
  } {
    // Base sizes for 8-player bracket, scale down for larger brackets
    const baseWidth = 20; // cqw units
    const baseHeight = 10; // cqh units
    const baseFontSize = 3; // cqw units

    const scale = bracketSize === 8 ? 1 : bracketSize === 16 ? 0.7 : 0.5;

    return {
      width: baseWidth * scale,
      height: baseHeight * scale,
      fontSize: baseFontSize * scale,
    };
  }

  const dimensions = getSlotDimensions(bracketSize);

  // First, calculate positions for all slots
  for (const slot of slots) {
    const slotNumber = parseInt(slot.id.slice(1)); // "s1" -> 1
    const round = getRoundFromSlotNumber(slotNumber);
    const horizontalPosition = getHorizontalPosition(round, totalRounds);
    const verticalPosition = getVerticalPosition(slotNumber, round);

    slotsWithPositions.push({
      slot,
      slotPosition: { x: horizontalPosition, y: verticalPosition },
      slotSize: { width: dimensions.width, height: dimensions.height },
      fontSize: dimensions.fontSize,
    });
  }

  // Then calculate connector paths
  for (const slot of slots) {
    const slotNumber = parseInt(slot.id.slice(1));
    const round = getRoundFromSlotNumber(slotNumber);

    // Skip first round (no children to connect from)
    if (round === 0) continue;

    // Find children (slots that feed into this one)
    const leftChildNumber = slotNumber * 2;
    const rightChildNumber = slotNumber * 2 + 1;

    const leftChild = slots.find(
      (s) => parseInt(s.id.slice(1)) === leftChildNumber,
    );
    const rightChild = slots.find(
      (s) => parseInt(s.id.slice(1)) === rightChildNumber,
    );

    if (!leftChild || !rightChild) continue;

    // Get positions
    const leftChildPos = slotsWithPositions.find(
      (p) => p.slot.id === leftChild.id,
    );
    const rightChildPos = slotsWithPositions.find(
      (p) => p.slot.id === rightChild.id,
    );
    const currentPos = slotsWithPositions.find((p) => p.slot.id === slot.id);

    if (!leftChildPos || !rightChildPos || !currentPos) continue;

    // Calculate connector paths using percentages
    // Child slots connect from their right edge to parent's left edge
    const childRightEdgeX =
      leftChildPos.slotPosition.x + leftChildPos.slotSize.width;
    const parentLeftEdgeX = currentPos.slotPosition.x;
    const midX = (childRightEdgeX + parentLeftEdgeX) / 2;

    // Left child connector (from left child to parent)
    connectors.push({
      path: `M ${childRightEdgeX}% ${leftChildPos.slotPosition.y}% H ${midX}% V ${currentPos.slotPosition.y}% H ${parentLeftEdgeX}%`,
    });

    // Right child connector
    const rightChildRightEdgeX =
      rightChildPos.slotPosition.x + rightChildPos.slotSize.width;
    connectors.push({
      path: `M ${rightChildRightEdgeX}% ${rightChildPos.slotPosition.y}% H ${midX}% V ${currentPos.slotPosition.y}% H ${parentLeftEdgeX}%`,
    });
  }

  return { slotWithPositions: slotsWithPositions, connectors };
}
