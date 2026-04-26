import { addPlayerToComp } from "./addPlayerToComp/addPlayerToComp.js";
import { addPlayer } from "./addPlayer/addPlayer.js";
import { activatePlayer } from "./activatePlayer/activatePlayer.js";
import { assignMatchups } from "./assignMatchups/assignMatchups.js";
import { cancelActivePoolComp } from "./cancelActivePoolComp/cancelActivePoolComp.js";
import { completeActivePoolComp } from "./completeActivePoolComp/completeActivePoolComp.js";
import { createPoolComp } from "./createPoolComp/createPoolComp.js";
import { deactivatePlayer } from "./deactivatePlayer/deactivatePlayer.js";
import { manualAssignPlayerToSlot } from "./manualAssignPlayerToSlot/manualAssignPlayerToSlot.js";
import { removePlayerFromComp } from "./removePlayerFromComp/removePlayerFromComp.js";
import { setRegisteredPlayerPaid } from "./setRegisteredPlayerPaid/setRegisteredPlayerPaid.js";
import { unsetRegisteredPlayerPaid } from "./unsetRegisteredPlayerPaid/unsetRegisteredPlayerPaid.js";
import { updatePlayer } from "./updatePlayer/updatePlayer.js";
import { MessageFromFrontend } from "../services/websockets.service.js";


export const messagesFromFrontend = {
    createPoolComp,
    cancelActivePoolComp,
    assignMatchups,
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
}
export type MessagesFromFrontend = typeof messagesFromFrontend
export type MessageFromFrontendName = keyof MessagesFromFrontend
export function getMessageHandler({ message }: MessageFromFrontend) {
    return messagesFromFrontend[message]
}
