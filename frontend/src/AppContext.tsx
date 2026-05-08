import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type BackendState,
  type PoolComp,
} from "../../shared/domain";
import type { MessageToBackend } from "../../shared/messageToBackend";
import { poolCompConfig } from "../../shared/poolCompConfig";
import { tournamentHasHadAssignment } from "../../shared/tournament-slot.service";
import { useOrientation } from "./hooks/useOrientation";

import { createPoolCompService } from "./services/poolComp.service";
import type {
  ConnectionStatus,
} from "./services/websockets.service";
import { createWebSocketService } from "./services/websockets.service";

export type View = "Pool Comp" | "Players" | "Comp History";

export const compTabs = ["Tournament", "Players", "Money"] as const;
export type CompTab = (typeof compTabs)[number];


type ModalContent = undefined | ReactNode

type AppContextValue = BackendState &
  ReturnType<typeof createPoolCompService> & {
    orientation: "portrait" | "landscape";
    userIsCompManager: boolean;
    setUserIsCompManager: (userIsCompManager: boolean) => void;
    activeView: View;
    setActiveView: (view: View) => void;
    connectionStatus: ConnectionStatus;
    modalContent: ModalContent;
    setModalContent: (modal?: ModalContent) => void;
    activeHistoricalComp: PoolComp | null;
    viewHistoricalComp: (comp: PoolComp) => void;
    clearHistoricalComp: () => void;
    actionInProgress: boolean;
    compActiveTab: CompTab;
    setCompActiveTab: (compActiveTab: CompTab) => void;
  };

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<BackendState>({
    activePoolComp: null,
    autoAssignPlayers: false,
    compHistory: [],
    players: [],
    poolCompConfig,
  });

  const [activeView, setActiveView] = useState<View>("Pool Comp");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [modalContent, setModalContent] = useState<ModalContent>();
  const [activeHistoricalComp, setActiveHistoricalComp] =
    useState<PoolComp | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const hasStarted = allData.activePoolComp && tournamentHasHadAssignment(allData.activePoolComp.slots);
  console.log('hasStarted', hasStarted)
  const [compActiveTab, setCompActiveTab] = useState<CompTab>(hasStarted ? "Tournament" : "Players");
  console.log('compActiveTab', compActiveTab)

  const isCompManager = localStorage.getItem('userIsCompManager') === 'true'

  const [userIsCompManager, setUserIsCompManager] = useState(isCompManager);


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
      (stateUpdateFromBackend: BackendState) => {
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
        modalContent,
        setModalContent,
        activeHistoricalComp,
        viewHistoricalComp,
        clearHistoricalComp,
        actionInProgress,
        compActiveTab,
        setCompActiveTab,
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
