import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { poolCompConfig, type AllData } from "../../shared/domain";
import type { MessageToBackend } from "../../shared/messageToBackend";
import { useOrientation } from "./hooks/useOrientation";
import { createPoolCompService } from "./services/poolComp.service";
import {
  createWebSocketService,
  type ConnectionStatus,
} from "./services/websockets.service";

export type View = "Pool Comp" | "Players" | "Comp History";

type AppContextValue = AllData &
  ReturnType<typeof createPoolCompService> & {
    orientation: "portrait" | "landscape";
    activeView: View;
    setActiveView: (view: View) => void;
    connectionStatus: ConnectionStatus;
  };

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<AllData>({
    activePoolComp: null,
    compHistory: [],
    players: [],
    poolCompConfig,
  });

  const [activeView, setActiveView] = useState<View>("Pool Comp");

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  const sendMessageToBackendRef = useRef<
    ((message: MessageToBackend) => void) | null
  >(null);

  const poolCompService = createPoolCompService(
    sendMessageToBackendRef.current,
  );

  const { orientation } = useOrientation();

  useEffect(() => {
    const { sendMessageToBackend, closeConnection } = createWebSocketService(
      (stateUpdateFromBackend: AllData) => {
        setAllData(stateUpdateFromBackend);
      },
      (connectionStatus: ConnectionStatus) => {
        setConnectionStatus(connectionStatus);
      },
    );

    sendMessageToBackendRef.current = sendMessageToBackend;

    return () => {
      sendMessageToBackendRef.current = null;
      closeConnection();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...allData,
        orientation,
        activeView,
        setActiveView,
        connectionStatus,
        ...poolCompService,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
