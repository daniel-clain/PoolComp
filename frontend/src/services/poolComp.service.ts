import { poolCompConfig, type RegisteredPlayer } from "../../../shared/domain";
import type { MessageToBackend } from "../../../shared/messageToBackend";

export function createPoolCompService(
  sendMessageToBackend: ((message: MessageToBackend) => void) | null,
) {
  function calculateFirstPrizeMoney(registeredPlayers: RegisteredPlayer[]) {
    return (
      (registeredPlayers.length * poolCompConfig.buyIn) /
        poolCompConfig.bigCompContribution +
      poolCompConfig.barInput
    );
  }

  const messagesToBackend = {
    createPoolComp: () => {
      sendMessageToBackend?.({ message: "createPoolComp" });
    },
    cancelActivePoolComp: () => {
      sendMessageToBackend?.({ message: "cancelActivePoolComp" });
    },
    startActivePoolComp: () => {
      sendMessageToBackend?.({ message: "startActivePoolComp" });
    },
    completeActivePoolComp: () => {
      sendMessageToBackend?.({ message: "completeActivePoolComp" });
    },
    togglePlayerInActivePoolComp: (playerId: string) => {
      sendMessageToBackend?.({
        message: "togglePlayerInActivePoolComp",
        data: { playerId },
      });
    },
    addPlayer: (name: string) => {
      sendMessageToBackend?.({ message: "addPlayer", data: { name } });
    },
    removePlayer: (playerId: string) => {
      sendMessageToBackend?.({ message: "removePlayer", data: { playerId } });
    },
    updatePlayer: (playerId: string, name: string) => {
      sendMessageToBackend?.({
        message: "updatePlayer",
        data: { playerId, name },
      });
    },
  };

  return {
    ...messagesToBackend,
    calculateFirstPrizeMoney,
  };
}
