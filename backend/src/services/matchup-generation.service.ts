import { Slot } from "../../../shared/domain.js";
import {
  eachFirstRoundMatchupDoesntHave2Players,
  eachFirstRoundMatchupDoesntHaveAPlayer,
  getFirstRoundSlots,
  getRandomMatchupWithout2Players,
  getRandomMatchupWithoutPlayer,
  getRandomSlotFromMatchup,
  getRandomUnassignedPlayer,
  getTotalTournamentSlots,
  registeredPlayersAreUnassigned,
} from "./matchup-generation.units.js";

/* Todo:
  - is run after registered player is removed, at start, needs to remove any slot player id that is not in the registered player ids
  - when a player joins late after assignment, byes and auto advancement need to be removed first
  - after a player is manually assigned to a slot, the matchup generation needs to be run again 
*/

export function assignMatchups(
  registeredPlayerIds: string[],
  existingSlots: Slot[],
): Slot[] {
  const firstRoundSize = getFirstRoundSlots(registeredPlayerIds.length);
  console.log("firstRoundSize", firstRoundSize);

  const totalTournamentSlots = getTotalTournamentSlots(firstRoundSize);
  console.log("totalTournamentSlots", totalTournamentSlots);

  const firstRoundSlots = totalTournamentSlots.slice(-firstRoundSize);
  console.log("firstRoundSlots", firstRoundSlots);

  if (existingSlots.length === 0) {
    while (
      registeredPlayersAreUnassigned(registeredPlayerIds, firstRoundSlots) &&
      eachFirstRoundMatchupDoesntHaveAPlayer(firstRoundSlots)
    ) {
      const matchup = getRandomMatchupWithoutPlayer(firstRoundSlots);
      getRandomMatchupWithoutPlayer(firstRoundSlots);
      console.log("matchup", matchup);
      const randomSlot = getRandomSlotFromMatchup(matchup);
      console.log("randomSlot", randomSlot);
      const playerId = getRandomUnassignedPlayer(
        registeredPlayerIds,
        firstRoundSlots,
      );
      console.log("playerId", playerId);
      randomSlot.playerId = playerId;
      console.log("randomSlot", randomSlot);
      console.log("firstRoundSlots", firstRoundSlots);
    }
    while (
      registeredPlayersAreUnassigned(registeredPlayerIds, firstRoundSlots) &&
      eachFirstRoundMatchupDoesntHave2Players(firstRoundSlots)
    ) {
      const matchup = getRandomMatchupWithout2Players(firstRoundSlots);
      const remainingSlot = matchup.slot1.playerId
        ? matchup.slot2
        : matchup.slot1;
      const playerId = getRandomUnassignedPlayer(
        registeredPlayerIds,
        firstRoundSlots,
      );
      remainingSlot.playerId = playerId;
    }
  }
  return firstRoundSlots;
}
