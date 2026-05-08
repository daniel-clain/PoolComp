import { activatePlayer } from "./activatePlayer/activatePlayer.js";
import { addPlayer } from "./addPlayer/addPlayer.js";
import { addPlayerToComp } from "./addPlayerToComp/addPlayerToComp.js";
import { assignPlayers } from "./assignPlayers/assignPlayers.js";
import { cancelActivePoolComp } from "./cancelActivePoolComp/cancelActivePoolComp.js";
import { completeActivePoolComp } from "./completeActivePoolComp/completeActivePoolComp.js";
import { createPoolComp } from "./createPoolComp/createPoolComp.js";
import { deactivatePlayer } from "./deactivatePlayer/deactivatePlayer.js";
import { manualAssignPlayerToSlot } from "./manualAssignPlayerToSlot/manualAssignPlayerToSlot.js";
import { randomiseMatchups } from "./randomiseMatchups/randomiseMatchups.js";
import { removePlayerFromComp } from "./removePlayerFromComp/removePlayerFromComp.js";
import { setAutoAssignPlayers } from "./setAutoAssignPlayers/setAutoAssignPlayers.js";
import { setRegisteredPlayerPaid } from "./setRegisteredPlayerPaid/setRegisteredPlayerPaid.js";
import { unsetRegisteredPlayerPaid } from "./unsetRegisteredPlayerPaid/unsetRegisteredPlayerPaid.js";
import { updatePlayer } from "./updatePlayer/updatePlayer.js";

/* source of truth for frontend send messages */
export const messagesFromFrontend = {
  createPoolComp,
  cancelActivePoolComp,
  randomiseMatchups,
  completeActivePoolComp,
  addPlayerToComp,
  removePlayerFromComp,
  setRegisteredPlayerPaid,
  unsetRegisteredPlayerPaid,
  addPlayer,
  updatePlayer,
  deactivatePlayer,
  activatePlayer,
  manualAssignPlayerToSlot,
  assignPlayers,
  setAutoAssignPlayers,
}
export type MessagesFromFrontend = typeof messagesFromFrontend

