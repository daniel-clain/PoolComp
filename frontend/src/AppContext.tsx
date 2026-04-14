import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { poolCompConfig, type AllData, type PoolComp } from "../../shared/domain";
import type { MessageToBackend } from "../../shared/messageToBackend";
import { useOrientation } from "./hooks/useOrientation";
import type { ModalState } from "./services/modal.service";
import { createPoolCompService } from "./services/poolComp.service";
import {
  createWebSocketService,
  type ConnectionStatus,
  type PendingAction,
} from "./services/websockets.service";

export type View = "Pool Comp" | "Players" | "Comp History";

type AppContextValue = AllData &
  ReturnType<typeof createPoolCompService> & {
    orientation: "portrait" | "landscape";
    activeView: View;
    setActiveView: (view: View) => void;
    connectionStatus: ConnectionStatus;
    pendingAction: PendingAction;
    modal: ModalState;
    openModal: (modal: NonNullable<ModalState>) => void;
    closeModal: () => void;
    activeHistoricalComp: PoolComp | null;
    viewHistoricalComp: (comp: PoolComp) => void;
    clearHistoricalComp: () => void;
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
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [activeHistoricalComp, setActiveHistoricalComp] = useState<PoolComp | null>(null);

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

  const sendMessageToBackendRef = useRef<
    ((message: MessageToBackend) => void) | null
  >(null);

  const poolCompService = createPoolCompService(sendMessageToBackendRef);

  const { orientation } = useOrientation();

  useEffect(() => {
    const { sendMessageToBackend, closeConnection } = createWebSocketService(
      (stateUpdateFromBackend: AllData) => {
        setAllData(stateUpdateFromBackend);
      },
      (connectionStatus: ConnectionStatus) => {
        setConnectionStatus(connectionStatus);
      },
      setPendingAction,
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
        pendingAction,
        modal,
        openModal,
        closeModal,
        activeHistoricalComp,
        viewHistoricalComp,
        clearHistoricalComp,
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
