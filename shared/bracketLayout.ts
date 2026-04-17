import type { Slot } from "./domain.js";

export function computeFirstRoundSize(playerCount: number): number {
  if (playerCount > 16) return 32;
  if (playerCount > 8) return 16;
  return 8;
}

export function generateSlots(playerIds: string[]): Slot[] {
  const firstRoundSize = computeFirstRoundSize(playerIds.length);
  const totalSlots = firstRoundSize * 2 - 1;
  const slots: Slot[] = [];

  for (let index = 1; index <= totalSlots; index++) {
    const isLeaf = index >= firstRoundSize;
    const leafIndex = index - firstRoundSize;

    if (isLeaf && leafIndex < playerIds.length) {
      slots.push({
        id: `s${index}`,
        kind: "player",
        playerId: playerIds[leafIndex]!,
      });
    } else {
      slots.push({ id: `s${index}`, kind: "empty" });
    }
  }
  return slots;
}

function slotEquals(first: Slot, second: Slot): boolean {
  if (first.kind !== second.kind) return false;
  if (first.id !== second.id) return false;
  if (first.kind === "player" && second.kind === "player") {
    return first.playerId === second.playerId;
  }
  return true;
}

export function registrationSlotsMatchGeneratedLayout(
  slots: Slot[],
  registeredPlayerIds: string[],
): boolean {
  const generatedSlots = generateSlots(registeredPlayerIds);
  if (slots.length !== generatedSlots.length) return false;
  for (let index = 0; index < slots.length; index++) {
    if (!slotEquals(slots[index]!, generatedSlots[index]!)) return false;
  }
  return true;
}

export function collectPlayerIdsPlacedInSlots(slots: Slot[]): Set<string> {
  const playerIds = new Set<string>();
  for (const slot of slots) {
    if (slot.kind === "player") {
      playerIds.add(slot.playerId);
    }
  }
  return playerIds;
}

export function inferFirstRoundSizeFromSlotCount(totalSlots: number): number {
  return (totalSlots + 1) / 2;
}

export function isFirstRoundLeafSlotNumber(
  slotNumber: number,
  firstRoundSize: number,
): boolean {
  return slotNumber >= firstRoundSize && slotNumber <= firstRoundSize * 2 - 1;
}
