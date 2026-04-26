import {
  eachFirstRoundMatchupDoesntHave2Players,
  eachFirstRoundMatchupDoesntHaveAPlayer,
  getFirstRoundSlots,
  getMatchupWithoutPlayer,
  getRandomSlotFromMatchup,
  getRandomUnassignedPlayer,
  getTotalTournamentSlots,
  registeredPlayersAreUnassigned,
} from "./matchup-generation.units.js";

export function testAssignMatchupsUnits() {
  const slotsCount16 = getFirstRoundSlots(14);
  console.log("14 players should equal 16 first round slots", slotsCount16);
  const slotsCount32 = getFirstRoundSlots(17);
  console.log("17 players should equal 32 first round slots", slotsCount32);

  const totalSlots31 = getTotalTournamentSlots(16);
  console.log(
    "16 first round slots should equal 31 total slots",
    totalSlots31.length,
  );
  const totalSlots15 = getTotalTournamentSlots(8);
  console.log(
    "8 first round slots should equal 15 total slots",
    totalSlots15.length,
  );

  const unassignedTrue = registeredPlayersAreUnassigned(
    Array.from({ length: 8 }, (_, index) => `player${index + 1}`),
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: index < 6 ? `player${index + 1}` : undefined,
    })),
  );
  console.log(unassignedTrue, "should equal true");

  const unassignedFalse = registeredPlayersAreUnassigned(
    Array.from({ length: 8 }, (_, index) => `player${index + 1}`),
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: `player${index + 1}`,
    })),
  );
  console.log(unassignedFalse, "should equal false");

  const notAllHavePlayerTrue = eachFirstRoundMatchupDoesntHaveAPlayer(
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: index == 0 ? "player1" : undefined,
    })),
  );
  console.log(
    "eachFirstRoundMatchupDoesntHaveAPlayer should equal true:",
    notAllHavePlayerTrue,
  );
  const notAllHavePlayerFalse = eachFirstRoundMatchupDoesntHaveAPlayer(
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: `player${index + 1}`,
    })),
  );
  console.log(
    "eachFirstRoundMatchupDoesntHaveAPlayer should equal false:",
    notAllHavePlayerFalse,
  );

  const matchup = getMatchupWithoutPlayer(
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: index < 6 ? `player${index + 1}` : undefined,
    })),
  );
  console.log(
    "getMatchupWithoutPlayer should equal { slot1: { id: 's6' }, slot2: { id: 's7'  } }",
    matchup,
  );
  const randomSlot = getRandomSlotFromMatchup({
    slot1: { id: "s6" },
    slot2: { id: "s7" },
  });
  console.log("should equal s6 or s7", randomSlot);

  const randomUnassigned = getRandomUnassignedPlayer(
    Array.from({ length: 8 }, (_, index) => `player${index + 1}`),
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: index < 6 ? `player${index + 1}` : undefined,
    })),
  );
  console.log("should equal p7 or p8:", randomUnassigned);

  const allhave2false = eachFirstRoundMatchupDoesntHave2Players(
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: index < 6 ? `player${index + 1}` : undefined,
    })),
  );
  console.log(
    "eachFirstRoundMatchupDoesntHave2Players without last 2 should equal true",
    allhave2false,
  );

  const twoPlayersFalse = eachFirstRoundMatchupDoesntHave2Players(
    Array.from({ length: 8 }, (_, index) => ({
      id: `s${index}`,
      playerId: `player${index + 1}`,
    })),
  );
  console.log(
    "eachFirstRoundMatchupDoesntHave2Players with last 2 should equal false",
    twoPlayersFalse,
  );
}
