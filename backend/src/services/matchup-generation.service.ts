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



/* 

  - matchmaking system needs to be, algorithm works different for 2 scenarios where players can be added or removed. it doesn re randomise, it respects the positions of existing player slot assignment
  - as each player is added, the algorithm runs for that player and randomly assigns them based on the available slots
  - sepcial scenarios where a adding results in extra round, players retain their relative position, for example, if ther are 4 players in the first round and a 5th one joins, then that requires a new first round of 8, and so of the 4 player they will be re assigned to new slots in the first round of 8 relative to original positions, so old slot 1 will go to new slot 1, old slot 2 will go to new slot 3, old slot 3 will go to new slot 5, old slot 4 will go to new slot 7. in a way, its the same because if they all had byes, they would have the same matchups in the next round of 4. now that they are distributed in the first round of 8, the 5th unassigned player will be processed by the algorithm and placed in a random slot or a random bracket, and the other 3 will be byes. the reverse scenario of there being 5 players and one of them leaving would be a bit different, i think its fine to simply make that players slot a bye, because this scenario is rare, and a sophisticated solution is not worth the complexity
  
  - if the comp wants to mirror the paper based version, then doing its own randomise is unhelpful, there should be an option to manually place them
  - is run after registered player is removed, at start, needs to remove any slot player id that is not in the registered player ids
  - when a player joins late after assignment, auto advancement from byes need to be reverted first, and bye slots need to be empties so that the algorithm can cleanly place the new player
  - if a player is manually assigned to a slot that is already taken, then the original player will become unasigned because their id will no longer be associated with any slot, they are automatically treated as a player who has just been added and they get random assignment to take a random remaining slot
  - the create matchups button should essentially take all the players and re run a fresh assignment. as players are added or removed, the already assigned players retain their position and are not reassigned. only clicking the button does a fresh new shuffle
  - the create matchups button should be disabled if any of the player vs player matchups have been started (verified by a player id being assigned to the next round slot)
  - removing players to make the total count not require the first round removes an unrequired first round. minimum first round slots is 8, and maximum first round slots is 32. need to consider how playins work, because adding 32 brackets takes up so much space that the size of the tournament is squashed way to small for 2 or 3 extras when there are about 15 or 16 free spaces

  
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

  while (
    registeredPlayersAreUnassigned(registeredPlayerIds, firstRoundSlots) &&
    eachFirstRoundMatchupDoesntHaveAPlayer(firstRoundSlots)
  ) {
    const matchup = getRandomMatchupWithoutPlayer(firstRoundSlots);
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
  return totalTournamentSlots;
}
