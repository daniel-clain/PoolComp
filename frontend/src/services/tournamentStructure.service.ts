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

type LayoutSizing = {
  slotWidth: number;
  slotHeight: number;
  verticalGap: number;
  horizontalGap: number;
  verticalPitch: number;
  padding: number;
};

type CenterAndRound = {
  centerX: number;
  centerY: number;
  roundIndex: number;
};

function calculateLayoutSizing(firstRoundSize: number): LayoutSizing {
  const scaleFactor = (firstRoundSize - 8) / 24;
  const slotWidth = 86 - scaleFactor * 20;
  const slotHeight = 34 - scaleFactor * 12;
  const verticalGap = 14 - scaleFactor * 8;
  const horizontalGap = 40 - scaleFactor * 14;

  return {
    slotWidth,
    slotHeight,
    verticalGap,
    horizontalGap,
    verticalPitch: slotHeight + verticalGap,
    padding: 4,
  };
}

/** Backend layout: ids are array indices; first round is the highest ids (slice tail). */
function getBracketCellForSlotId(
  slotId: number,
  firstRoundSize: number,
): { roundIndex: number; indexWithinRound: number } {
  let roundIndex = 0;
  let firstSlotIdInRound = firstRoundSize - 1;
  let slotCountInRound = firstRoundSize;

  while (slotId < firstSlotIdInRound) {
    roundIndex += 1;
    slotCountInRound /= 2;
    firstSlotIdInRound -= slotCountInRound;
  }

  return { roundIndex, indexWithinRound: slotId - firstSlotIdInRound };
}

function buildRoundCenters(
  firstRoundSize: number,
  totalRounds: number,
  layoutSizing: LayoutSizing,
): { x: number; y: number }[][] {
  const centersByRound: { x: number; y: number }[][] = [
    Array.from({ length: firstRoundSize }, (_, rowIndex) => ({
      x: layoutSizing.padding + layoutSizing.slotWidth / 2,
      y:
        layoutSizing.padding +
        rowIndex * layoutSizing.verticalPitch +
        layoutSizing.slotHeight / 2,
    })),
  ];

  for (let roundIndex = 1; roundIndex <= totalRounds; roundIndex++) {
    const previousRound = centersByRound[roundIndex - 1]!;
    const columnX =
      layoutSizing.padding +
      roundIndex * (layoutSizing.slotWidth + layoutSizing.horizontalGap) +
      layoutSizing.slotWidth / 2;

    centersByRound.push(
      Array.from({ length: previousRound.length / 2 }, (__, pairIndex) => {
        const top = previousRound[pairIndex * 2]!;
        const bottom = previousRound[pairIndex * 2 + 1]!;
        return { x: columnX, y: (top.y + bottom.y) / 2 };
      }),
    );
  }

  return centersByRound;
}

export function calculateSlotPositions(slots: Slot[]): TournamentLayout {
  if (slots.length === 0) {
    return {
      slotWithPositions: [],
      connectors: [],
      viewBox: "0 0 1 1",
      aspectRatio: 1,
    };
  }

  const firstRoundSize = (slots.length + 1) / 2;
  const totalRounds = Math.log2(firstRoundSize);
  const layoutSizing = calculateLayoutSizing(firstRoundSize);
  const roundCenters = buildRoundCenters(firstRoundSize, totalRounds, layoutSizing);

  const roundColumnCount = totalRounds + 1;
  const layoutWidth =
    roundColumnCount * layoutSizing.slotWidth +
    (roundColumnCount - 1) * layoutSizing.horizontalGap +
    layoutSizing.padding * 2;
  const layoutHeight =
    firstRoundSize * layoutSizing.slotHeight +
    (firstRoundSize - 1) * layoutSizing.verticalGap +
    layoutSizing.padding * 2;

  function widthAsPercent(pixels: number) {
    return (pixels / layoutWidth) * 100;
  }
  function heightAsPercent(pixels: number) {
    return (pixels / layoutHeight) * 100;
  }

  const slotWithPositions: SlotWithPosition[] = [];
  const centerBySlotId = new Map<number, CenterAndRound>();

  for (const slot of slots) {
    const { roundIndex, indexWithinRound } = getBracketCellForSlotId(
      slot.id,
      firstRoundSize,
    );
    const center = roundCenters[roundIndex]?.[indexWithinRound];
    if (!center) continue;

    const topLeftX = center.x - layoutSizing.slotWidth / 2;
    const topLeftY = center.y - layoutSizing.slotHeight / 2;

    slotWithPositions.push({
      slot,
      x: widthAsPercent(topLeftX),
      y: heightAsPercent(topLeftY),
      width: widthAsPercent(layoutSizing.slotWidth),
      height: heightAsPercent(layoutSizing.slotHeight),
      fontSize: heightAsPercent(layoutSizing.slotHeight * 0.55),
    });

    centerBySlotId.set(slot.id, {
      centerX: center.x,
      centerY: center.y,
      roundIndex,
    });
  }

  const halfSlotWidth = layoutSizing.slotWidth / 2;
  const halfHorizontalGap = layoutSizing.horizontalGap / 2;
  const connectors: Connector[] = [];

  for (const slot of slots) {
    const parent = centerBySlotId.get(slot.id);
    if (!parent || parent.roundIndex === 0) continue;

    const leftChild = centerBySlotId.get(slot.id * 2 + 1);
    const rightChild = centerBySlotId.get(slot.id * 2 + 2);
    if (!leftChild || !rightChild) continue;

    const parentLeftX = parent.centerX - halfSlotWidth;
    for (const child of [leftChild, rightChild]) {
      const childRightX = child.centerX + halfSlotWidth;
      const middleConnectorX = childRightX + halfHorizontalGap;
      connectors.push({
        path: `M ${childRightX} ${child.centerY} H ${middleConnectorX} V ${parent.centerY} H ${parentLeftX}`,
      });
    }
  }

  return {
    slotWithPositions,
    connectors,
    viewBox: `0 0 ${layoutWidth} ${layoutHeight}`,
    aspectRatio: layoutWidth / layoutHeight,
  };
}
