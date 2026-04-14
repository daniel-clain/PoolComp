import type { Slot } from "../../../shared/domain";

export type SlotWithPosition = {
  slot: Slot;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
};

export type Connector = {
  path: string;
};

export type TournamentLayout = {
  slotWithPositions: SlotWithPosition[];
  connectors: Connector[];
  viewBox: string;
  aspectRatio: number;
};

export function calculateSlotPositions(slots: Slot[]): TournamentLayout {
  const empty: TournamentLayout = {
    slotWithPositions: [],
    connectors: [],
    viewBox: "0 0 1 1",
    aspectRatio: 1,
  };

  if (slots.length === 0) return empty;

  const totalSlots = slots.length;
  const firstRoundSize = (totalSlots + 1) / 2;
  const totalRounds = Math.log2(firstRoundSize);
  const numColumns = totalRounds + 1;

  const scaleFactor = (firstRoundSize - 8) / 24;
  const boxWidth = 86 - scaleFactor * 20;
  const boxHeight = 34 - scaleFactor * 12;
  const gapY = 14 - scaleFactor * 8;
  const columnGap = 40 - scaleFactor * 14;
  const pitch = boxHeight + gapY;

  const padding = 4;
  const intrinsicWidth =
    numColumns * boxWidth + (numColumns - 1) * columnGap + padding * 2;
  const intrinsicHeight =
    firstRoundSize * boxHeight + (firstRoundSize - 1) * gapY + padding * 2;

  const roundCenters: { x: number; y: number }[][] = [];

  roundCenters[0] = Array.from({ length: firstRoundSize }, (_, index) => ({
    x: padding + boxWidth / 2,
    y: padding + index * pitch + boxHeight / 2,
  }));

  for (let roundIndex = 1; roundIndex <= totalRounds; roundIndex++) {
    const previousRound = roundCenters[roundIndex - 1]!;
    const currentRound: { x: number; y: number }[] = [];
    for (let i = 0; i < previousRound.length; i += 2) {
      currentRound.push({
        x: padding + roundIndex * (boxWidth + columnGap) + boxWidth / 2,
        y: (previousRound[i]!.y + previousRound[i + 1]!.y) / 2,
      });
    }
    roundCenters[roundIndex] = currentRound;
  }

  const positionMap = new Map<
    string,
    { centerX: number; centerY: number; slotWithPosition: SlotWithPosition }
  >();
  const slotWithPositions: SlotWithPosition[] = [];

  for (const slot of slots) {
    const slotNumber = parseInt(slot.id.slice(1));
    const round = totalRounds - Math.floor(Math.log2(slotNumber));
    const firstInRound = Math.pow(2, totalRounds - round);
    const indexInRound = slotNumber - firstInRound;

    const center = roundCenters[round]![indexInRound]!;
    const topLeftX = center.x - boxWidth / 2;
    const topLeftY = center.y - boxHeight / 2;

    const slotWithPosition: SlotWithPosition = {
      slot,
      x: (topLeftX / intrinsicWidth) * 100,
      y: (topLeftY / intrinsicHeight) * 100,
      width: (boxWidth / intrinsicWidth) * 100,
      height: (boxHeight / intrinsicHeight) * 100,
      fontSize: (boxHeight * 0.55 / intrinsicHeight) * 100,
    };
    slotWithPositions.push(slotWithPosition);
    positionMap.set(slot.id, { centerX: center.x, centerY: center.y, slotWithPosition });
  }

  const connectors: Connector[] = [];

  for (const slot of slots) {
    const slotNumber = parseInt(slot.id.slice(1));
    const round = totalRounds - Math.floor(Math.log2(slotNumber));
    if (round === 0) continue;

    const parent = positionMap.get(slot.id);
    const leftChild = positionMap.get(`s${slotNumber * 2}`);
    const rightChild = positionMap.get(`s${slotNumber * 2 + 1}`);
    if (!parent || !leftChild || !rightChild) continue;

    for (const child of [leftChild, rightChild]) {
      const childRightX = child.centerX + boxWidth / 2;
      const parentLeftX = parent.centerX - boxWidth / 2;
      const midX = childRightX + columnGap / 2;

      connectors.push({
        path: `M ${childRightX} ${child.centerY} H ${midX} V ${parent.centerY} H ${parentLeftX}`,
      });
    }
  }

  return {
    slotWithPositions,
    connectors,
    viewBox: `0 0 ${intrinsicWidth} ${intrinsicHeight}`,
    aspectRatio: intrinsicWidth / intrinsicHeight,
  };
}
