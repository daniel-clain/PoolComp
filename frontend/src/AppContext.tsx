import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useOrientation } from "./hooks/useOrientation";
import type { MessageToServer, SharedAppState } from "./realtime/messages";
import { EMPTY_SHARED_STATE } from "./realtime/messages";
import {
  createSocketClient,
  type ConnectionStatus,
} from "./realtime/socketClient";

export type View = "Pool Comp" | "Players" | "Comp History";
export type { PoolComp } from "./realtime/messages";

type AppContextValue = SharedAppState & {
  orientation: "portrait" | "landscape";
  currentView: View;
  connectionStatus: ConnectionStatus;
  setView: (view: View) => void;
  createPoolComp: () => void;
  cancelActivePoolComp: () => void;
  togglePlayerInActivePoolComp: (name: string) => void;
  startActivePoolComp: () => void;
  completeActivePoolComp: () => void;
  addGlobalPlayer: (name: string) => void;
  removeGlobalPlayer: (name: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sharedState, setSharedState] =
    useState<SharedAppState>(EMPTY_SHARED_STATE);
  const [currentView, setCurrentView] = useState<View>("Pool Comp");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const socketRef = useRef<ReturnType<typeof createSocketClient> | null>(null);
  const { orientation } = useOrientation();

  useEffect(() => {
    const client = createSocketClient({
      onMessage: (message) => {
        switch (message.type) {
          case "stateSnapshot":
          case "stateUpdated":
            setSharedState(message.state);
            return;
          case "commandRejected":
            console.log(message.reason);
            return;
          case "serverError":
            console.log(message.message);
        }
      },
      onStatusChange: setConnectionStatus,
    });

    socketRef.current = client;

    return () => {
      socketRef.current = null;
      client.close();
    };
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const send = (message: MessageToServer) => {
      if (!socketRef.current?.send(message)) {
        console.log(
          "Not connected to server. Try again when the connection is ready.",
        );
      }
    };

    return {
      ...sharedState,
      orientation,
      currentView,
      connectionStatus,
      setView: setCurrentView,
      createPoolComp: () => {
        setCurrentView("Pool Comp");
        send({ type: "createPoolComp" });
      },
      cancelActivePoolComp: () => {
        setCurrentView("Pool Comp");
        send({ type: "cancelActivePoolComp" });
      },
      togglePlayerInActivePoolComp: (name) =>
        send({ type: "togglePlayerInActivePoolComp", name }),
      startActivePoolComp: () => send({ type: "startActivePoolComp" }),
      completeActivePoolComp: () => {
        setCurrentView("Pool Comp");
        send({ type: "completeActivePoolComp" });
      },
      addGlobalPlayer: (name) => send({ type: "addPlayer", name }),
      removeGlobalPlayer: (name) => send({ type: "removePlayer", name }),
    };
  }, [connectionStatus, currentView, sharedState, orientation]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
