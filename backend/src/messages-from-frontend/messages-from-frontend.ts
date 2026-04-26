import { addPlayerToComp } from "./addPlayerToComp/addPlayerToComp.js";
import { removePlayerFromComp } from "./removePlayerFromComp/removePlayerFromComp.js";
import type { BackendService } from "../services/backend.service.js";
import type { MessageData } from "../../../shared/messageToBackend.js";
import type { MessageName } from "../../../shared/messageToBackend.js";

export const messagesFromFrontend = {
    addPlayerToComp,
    removePlayerFromComp,
}
export type MessagesFromFrontend = typeof messagesFromFrontend

export function getMessageHandler<T extends MessageName>(message: T): (
    backendService: BackendService,
    data: MessageData<MessagesFromFrontend[T]>
) => void {
    return messagesFromFrontend[message] as (
        backendService: BackendService,
        data: MessageData<MessagesFromFrontend[T]>
    ) => void
}