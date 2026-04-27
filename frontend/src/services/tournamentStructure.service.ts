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

type SlotWithDerivedNumber = {
  slot: Slot;
  derivedSlotNumber: number;
};

type RoundCenter = {
  x: number;
  y: number;
};

type LayoutSizing = {
  slotWidth: number;
  slotHeight: number;
  verticalGap: number;
  horizontalGap: number;
  verticalPitch: number;
  padding: number;
};

type PositionedSlot = {
  centerX: number;
  centerY: number;
  slotWithPosition: SlotWithPosition;
};

function parseSlotNumber(slotId: string): number | null {
  const parsedSlotNumber = Number.parseInt(slotId.slice(1), 10);
  if (!Number.isFinite(parsedSlotNumber)) return null;
  if (parsedSlotNumber < 0) return null;
  return parsedSlotNumber;
}

function detectSlotNumberingOffset(parsedSlotNumbers: number[], totalSlots: number): number {
  if (parsedSlotNumbers.length === 0) return 0;

  const minimumSlotNumber = Math.min(...parsedSlotNumbers);
  const maximumSlotNumber = Math.max(...parsedSlotNumbers);

  const isZeroBasedContiguousRange =
    minimumSlotNumber === 0 && maximumSlotNumber === totalSlots - 1;

  return isZeroBasedContiguousRange ? 1 : 0;
}

function deriveSlotNumbers(slots: Slot[]): SlotWithDerivedNumber[] {
  const parsedSlotNumbers = slots
    .map((slot) => parseSlotNumber(slot.id))
    .filter((parsedSlotNumber): parsedSlotNumber is number => parsedSlotNumber !== null);

  const slotNumberingOffset = detectSlotNumberingOffset(parsedSlotNumbers, slots.length);

  return slots.flatMap((slot) => {
    const parsedSlotNumber = parseSlotNumber(slot.id);
    if (parsedSlotNumber === null) return [];
    return [
      {
        slot,
        derivedSlotNumber: parsedSlotNumber + slotNumberingOffset,
      },
    ];
  });
}

function calculateLayoutSizing(firstRoundSize: number): LayoutSizing {
  const scaleFactor = (firstRoundSize - 8) / 24;
  const slotWidth = 86 - scaleFactor * 20;
  const slotHeight = 34 - scaleFactor * 12;
  const verticalGap = 14 - scaleFactor * 8;
  const horizontalGap = 40 - scaleFactor * 14;
  const verticalPitch = slotHeight + verticalGap;

  return {
    slotWidth,
    slotHeight,
    verticalGap,
    horizontalGap,
    verticalPitch,
    padding: 4,
  };
}

function buildRoundCenters(
  firstRoundSize: number,
  totalRounds: number,
  layoutSizing: LayoutSizing,
): RoundCenter[][] {
  const roundCenters: RoundCenter[][] = [];

  roundCenters[0] = Array.from({ length: firstRoundSize }, (_, index) => ({
    x: layoutSizing.padding + layoutSizing.slotWidth / 2,
    y: layoutSizing.padding + index * layoutSizing.verticalPitch + layoutSizing.slotHeight / 2,
  }));

  for (let roundIndex = 1; roundIndex <= totalRounds; roundIndex++) {
    const previousRoundCenters = roundCenters[roundIndex - 1]!;
    const currentRoundCenters: RoundCenter[] = [];

    for (let index = 0; index < previousRoundCenters.length; index += 2) {
      currentRoundCenters.push({
        x:
          layoutSizing.padding +
          roundIndex * (layoutSizing.slotWidth + layoutSizing.horizontalGap) +
          layoutSizing.slotWidth / 2,
        y: (previousRoundCenters[index]!.y + previousRoundCenters[index + 1]!.y) / 2,
      });
    }

    roundCenters[roundIndex] = currentRoundCenters;
  }

  return roundCenters;
}

function calculateRoundIndex(derivedSlotNumber: number, totalRounds: number): number {
  return totalRounds - Math.floor(Math.log2(derivedSlotNumber));
}

function calculateIntrinsicDimensions(
  firstRoundSize: number,
  totalRounds: number,
  layoutSizing: LayoutSizing,
): { width: number; height: number } {
  const roundColumnCount = totalRounds + 1;
  const intrinsicWidth =
    roundColumnCount * layoutSizing.slotWidth +
    (roundColumnCount - 1) * layoutSizing.horizontalGap +
    layoutSizing.padding * 2;
  const intrinsicHeight =
    firstRoundSize * layoutSizing.slotHeight +
    (firstRoundSize - 1) * layoutSizing.verticalGap +
    layoutSizing.padding * 2;

  return { width: intrinsicWidth, height: intrinsicHeight };
}

export function calculateSlotPositions(slots: Slot[]): TournamentLayout {
  const empty: TournamentLayout = {
    slotWithPositions: [],
    connectors: [],
    viewBox: "0 0 1 1",
    aspectRatio: 1,
  };

  if (slots.length === 0) return empty;

  const slotsWithDerivedNumbers = deriveSlotNumbers(slots);
  if (slotsWithDerivedNumbers.length === 0) return empty;

  const firstRoundSize = (slotsWithDerivedNumbers.length + 1) / 2;
  const totalRounds = Math.log2(firstRoundSize);
  const layoutSizing = calculateLayoutSizing(firstRoundSize);
  const roundCenters = buildRoundCenters(firstRoundSize, totalRounds, layoutSizing);
  const intrinsicDimensions = calculateIntrinsicDimensions(
    firstRoundSize,
    totalRounds,
    layoutSizing,
  );

  const positionByDerivedSlotNumber = new Map<number, PositionedSlot>();
  const slotWithPositions: SlotWithPosition[] = [];

  for (const slotWithDerivedNumber of slotsWithDerivedNumbers) {
    const roundIndex = calculateRoundIndex(
      slotWithDerivedNumber.derivedSlotNumber,
      totalRounds,
    );
    const firstSlotNumberInRound = Math.pow(2, totalRounds - roundIndex);
    const indexWithinRound =
      slotWithDerivedNumber.derivedSlotNumber - firstSlotNumberInRound;

    const center = roundCenters[roundIndex]?.[indexWithinRound];
    if (!center) continue;

    const topLeftX = center.x - layoutSizing.slotWidth / 2;
    const topLeftY = center.y - layoutSizing.slotHeight / 2;

    const slotWithPosition: SlotWithPosition = {
      slot: slotWithDerivedNumber.slot,
      x: (topLeftX / intrinsicDimensions.width) * 100,
      y: (topLeftY / intrinsicDimensions.height) * 100,
      width: (layoutSizing.slotWidth / intrinsicDimensions.width) * 100,
      height: (layoutSizing.slotHeight / intrinsicDimensions.height) * 100,
      fontSize:
        (layoutSizing.slotHeight * 0.55 / intrinsicDimensions.height) * 100,
    };

    slotWithPositions.push(slotWithPosition);
    positionByDerivedSlotNumber.set(slotWithDerivedNumber.derivedSlotNumber, {
      centerX: center.x,
      centerY: center.y,
      slotWithPosition,
    });
  }

  const connectors: Connector[] = [];

  for (const slotWithDerivedNumber of slotsWithDerivedNumbers) {
    const roundIndex = calculateRoundIndex(
      slotWithDerivedNumber.derivedSlotNumber,
      totalRounds,
    );
    if (roundIndex === 0) continue;

    const parentPosition = positionByDerivedSlotNumber.get(
      slotWithDerivedNumber.derivedSlotNumber,
    );
    const leftChildPosition = positionByDerivedSlotNumber.get(
      slotWithDerivedNumber.derivedSlotNumber * 2,
    );
    const rightChildPosition = positionByDerivedSlotNumber.get(
      slotWithDerivedNumber.derivedSlotNumber * 2 + 1,
    );

    if (!parentPosition || !leftChildPosition || !rightChildPosition) continue;

    for (const childPosition of [leftChildPosition, rightChildPosition]) {
      const childRightX = childPosition.centerX + layoutSizing.slotWidth / 2;
      const parentLeftX = parentPosition.centerX - layoutSizing.slotWidth / 2;
      const middleConnectorX = childRightX + layoutSizing.horizontalGap / 2;

      connectors.push({
        path: `M ${childRightX} ${childPosition.centerY} H ${middleConnectorX} V ${parentPosition.centerY} H ${parentLeftX}`,
      });
    }
  }

  return {
    slotWithPositions,
    connectors,
    viewBox: `0 0 ${intrinsicDimensions.width} ${intrinsicDimensions.height}`,
    aspectRatio: intrinsicDimensions.width / intrinsicDimensions.height,
  };
}
