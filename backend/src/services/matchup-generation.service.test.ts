import { assignMatchups } from "./matchup-generation.service.js";

export function testAssignMatchups() {
  const slots = assignMatchups(
    ["player1", "player2", "player3", "player4", "player5"],
    [],
  );

  console.log(JSON.stringify(slots, null, 2));
}
