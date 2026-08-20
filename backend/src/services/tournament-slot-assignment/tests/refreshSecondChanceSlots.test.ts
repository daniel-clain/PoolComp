import { describe, expect, test } from "vitest";

import type { PoolComp, RegisteredPlayer, Slot } from "../../../../../shared/domain.js";
import {
  getFirstRoundSlotsFromAllTournamentSlots,
  getSecondChancePlayersPool,
} from "../../../../../shared/tournament-slot.service.js";
import { refreshSecondChanceSlots } from "../tournament-slot-assignment.service.js";
import { getTournamentSlotsFromFirstRoundSize } from "../tournament-slot-assignment.units.js";

function createRegisteredPlayer(name: string): RegisteredPlayer {
  return { id: name, name, paid: true, deactivated: false };
}

const martin = createRegisteredPlayer("Martin");
const markH = createRegisteredPlayer("Mark H");
const alan = createRegisteredPlayer("Alan");
const daniel = createRegisteredPlayer("Daniel");
const george = createRegisteredPlayer("George");
const gary = createRegisteredPlayer("Gary");

function createMainCompSlots(): Slot[] {
  const slots = getTournamentSlotsFromFirstRoundSize(8);
  const firstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(slots);

  firstRoundSlots[0]!.player = martin;
  firstRoundSlots[1]!.player = markH;
  firstRoundSlots[2]!.player = alan;
  firstRoundSlots[3]!.player = daniel;
  firstRoundSlots[4]!.player = george;
  firstRoundSlots[5]!.player = gary;
  firstRoundSlots[6]!.isBye = true;
  firstRoundSlots[7]!.isBye = true;

  // Alan beats Daniel, George beats Gary. Martin versus Mark H is still unplayed.
  slots.find(slot => slot.id === 4)!.player = alan;
  slots.find(slot => slot.id === 5)!.player = george;
  slots.find(slot => slot.id === 6)!.isBye = true;

  return slots;
}

function createBigComp(secondChanceSlots: Slot[]): PoolComp {
  return {
    id: "comp",
    date: new Date().toISOString(),
    registeredPlayers: [martin, markH, alan, daniel, george, gary],
    slots: createMainCompSlots(),
    secondChanceSlots,
  };
}

function createSecondChanceSlotsWithDanielVersusGary(): Slot[] {
  const secondChanceSlots = getTournamentSlotsFromFirstRoundSize(8);
  const secondChanceFirstRoundSlots = getFirstRoundSlotsFromAllTournamentSlots(secondChanceSlots);

  secondChanceFirstRoundSlots[0]!.player = daniel;
  secondChanceFirstRoundSlots[1]!.player = gary;

  return secondChanceSlots;
}

describe("refreshSecondChanceSlots", function () {
  test("keeps second chance results and adds newly beaten players to the free slots", function () {
    const secondChanceSlots = createSecondChanceSlotsWithDanielVersusGary();
    // Daniel has already beaten Gary in the second chance comp.
    secondChanceSlots.find(slot => slot.id === 3)!.player = daniel;

    const comp = createBigComp(secondChanceSlots);
    // Mark H now loses their first main comp match, so they join the second chance pool.
    comp.slots.find(slot => slot.id === 3)!.player = martin;

    expect(getSecondChancePlayersPool(comp, []).map(player => player.id)).toEqual([
      markH.id,
      daniel.id,
      gary.id,
    ]);

    const updatedSecondChanceSlots = refreshSecondChanceSlots(comp, []);

    expect(updatedSecondChanceSlots.find(slot => slot.id === 3)?.player).toEqual(daniel);
    expect(updatedSecondChanceSlots.some(slot => slot.player?.id === gary.id)).toBe(true);
    expect(updatedSecondChanceSlots.some(slot => slot.player?.id === markH.id)).toBe(true);
  });

  test("removes a player who is no longer a first game loser", function () {
    const comp = createBigComp(createSecondChanceSlotsWithDanielVersusGary());
    // Daniel now wins their first main comp match, so Alan takes their place in the pool.
    comp.slots.find(slot => slot.id === 4)!.player = daniel;

    expect(getSecondChancePlayersPool(comp, []).map(player => player.id)).toEqual([
      alan.id,
      gary.id,
    ]);

    const updatedSecondChanceSlots = refreshSecondChanceSlots(comp, []);

    expect(updatedSecondChanceSlots.some(slot => slot.player?.id === daniel.id)).toBe(false);
    expect(updatedSecondChanceSlots.some(slot => slot.player?.id === alan.id)).toBe(true);
    expect(updatedSecondChanceSlots.some(slot => slot.player?.id === gary.id)).toBe(true);
  });
});
