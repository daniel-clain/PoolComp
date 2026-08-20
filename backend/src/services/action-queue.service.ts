import type { BackendService } from "./backend.service.js";

export function createActionQueueService(backendService: BackendService) {
  let actionQueue: Promise<void> = Promise.resolve();
  let actionsInFlight = 0;

  return {
    enqueueAction,
  };

  function enqueueAction(action: () => void | Promise<void>, actionName: string): void {
    if (actionsInFlight === 0) {
      console.log("actionInProgress: true");
      backendService.sendToAllClients({
        message: "actionInProgress",
        data: true,
      });
    }
    actionsInFlight += 1;

    actionQueue = actionQueue
      .then(() => action())
      .catch((error: unknown) => {
        const errorText = error instanceof Error ? error.message : String(error);
        console.error(`action failed: ${actionName}`, error);
        backendService.addBackendError(`${actionName}: ${errorText}`);
      })
      .finally(() => {
        actionsInFlight -= 1;
        console.log("actionQueue finished", { actionsInFlight });
        backendService.sendToAllClients({
          message: "allData",
          data: backendService.backendState,
        });
        if (actionsInFlight === 0) {
          backendService.sendToAllClients({
            message: "actionInProgress",
            data: false,
          });
        }
      });
  }
}

export type ActionQueueService = ReturnType<typeof createActionQueueService>;
