import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type AllData,
  type PoolComp,
} from "../../shared/domain";
import { useOrientation } from "./hooks/useOrientation";
import type { ModalState } from "./services/modal.service";
import { createPoolCompService } from "./services/poolComp.service";
import type {
  ConnectionStatus,
} from "./services/websockets.service";
import { createWebSocketService } from "./services/websockets.service";
import type { MessageToBackend } from "../../shared/messageToBackend";
import { poolCompConfig } from "../../shared/poolCompConfig";

export type View = "Pool Comp" | "Players" | "Comp History";

type AppContextValue = AllData &
  ReturnType<typeof createPoolCompService> & {
    orientation: "portrait" | "landscape";
    userIsCompManager: boolean;
    setUserIsCompManager: (userIsCompManager: boolean) => void;
    activeView: View;
    setActiveView: (view: View) => void;
    connectionStatus: ConnectionStatus;
    modal: ModalState;
    openModal: (modal: NonNullable<ModalState>) => void;
    closeModal: () => void;
    activeHistoricalComp: PoolComp | null;
    viewHistoricalComp: (comp: PoolComp) => void;
    clearHistoricalComp: () => void;
    actionInProgress: boolean;
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
  const [modal, setModal] = useState<ModalState>(null);
  const [activeHistoricalComp, setActiveHistoricalComp] =
    useState<PoolComp | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const isCompManager = localStorage.getItem('userIsCompManager') === 'true'

  const [userIsCompManager, setUserIsCompManager] = useState(isCompManager);


  function openModal(state: NonNullable<ModalState>) {
    setModal(state);
  }

  function closeModal() {
    setModal(null);
  }

  function viewHistoricalComp(comp: PoolComp) {
    setActiveHistoricalComp(comp);
    setActiveView("Pool Comp");
  }

  function clearHistoricalComp() {
    setActiveHistoricalComp(null);
  }

  const sendMessageToBackendRef = useRef<((message: MessageToBackend) => void) | null>(null);

  const poolCompService = createPoolCompService(sendMessageToBackendRef);

  const { orientation } = useOrientation();

  useEffect(() => {
    const { send, closeConnection, connected } = createWebSocketService(
      (stateUpdateFromBackend: AllData) => {
        setAllData(stateUpdateFromBackend);
      },
      (actionInProgress: boolean) => {
        setActionInProgress(actionInProgress);
      },
      (connectionStatus: ConnectionStatus) => {
        setConnectionStatus(connectionStatus);
      },
    );

    sendMessageToBackendRef.current = send;

    return () => {
      sendMessageToBackendRef.current = null;
      if (connected) {
        closeConnection();
      }
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        orientation,
        activeView,
        setActiveView,
        connectionStatus,
        modal,
        openModal,
        closeModal,
        activeHistoricalComp,
        viewHistoricalComp,
        clearHistoricalComp,
        actionInProgress,
        userIsCompManager,
        setUserIsCompManager,
        ...poolCompService,
        ...allData,
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
