import type { WebSocket } from "ws";


//backend
export type BackendService = {}

function addPlayerToComp(
  backendService: BackendService,
  data: { playerId: string; exampleArg1: number }
) { }

function removePlayerFromComp(
  backendService: BackendService,
  data: { playerId: string; exampleArg2: string }
) { }

export const messagesFromFrontend = {
  addPlayerToComp,
  removePlayerFromComp,
}

export type MessagesFromFrontend = typeof messagesFromFrontend
const backendService: BackendService = {}

const backendSocket = null as unknown as WebSocket

backendSocket.on("message", (rawMessage: string) => {
  const { message, data }: MessageToBackend = JSON.parse(rawMessage)

  getMessageHandler(message)(backendService, data)
});

function getMessageHandler(message: MessageName) {
  return messagesFromFrontend[message] as (backendService: BackendService, data: MessageData<MessagesFromFrontend[MessageName]>) => void
}


//shared

export type MessageName = keyof MessagesFromFrontend

export type MessageData<T> =
  T extends (backendService: BackendService, data: infer Data) => any
  ? Data
  : never

export type MessageToBackend = {
  [K in MessageName]: {
    message: K
    data: MessageData<MessagesFromFrontend[K]>
  }
}[MessageName]


//frontend
const frontendSocket = null as unknown as WebSocket
function send(message: MessageToBackend) {
  frontendSocket.send(JSON.stringify(message))
}
send({ message: "addPlayerToComp", data: { playerId: "123", exampleArg1: 1 } })
send({ message: "removePlayerFromComp", data: { playerId: "123", exampleArg2: "test" } })