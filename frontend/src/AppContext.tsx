import isEqual from "lodash/isEqual";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  type BackendState,
  type FrontendState,
  type LeaderboardEntry,
  type Player,
  type PoolComp,
} from "../../shared/domain";
import type { MessageToBackend } from "../../shared/messageToBackend";


import { useOrientation } from "./hooks/useOrientation";

import { convertToPoolComp } from "../../shared/data-convert.service";
import { tournamentHasHadAssignment } from "../../shared/tournament-slot.service";
import type {
  ConnectionStatus,
} from "./services/websockets.service";
import { createWebSocketService } from "./services/websockets.service";

export type View = "Pool Comp" | "Players" | "Comp History" | "Leaderboard";

export const compTabs = ["Main Comp", "2nd Chance Comp", "Players", "Money"] as const;
export type CompTab = (typeof compTabs)[number];


type ModalContent = undefined | ReactNode


type AppContextValue = FrontendState & {
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
  send: (message: MessageToBackend) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePoolComp, setActivePoolComp] = useState<PoolComp | null>(null);
  const [compHistory, setCompHistory] = useState<PoolComp[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [autoAssignPlayers, setAutoAssignPlayers] = useState(false);

  const [activeView, setActiveView] = useState<View>("Pool Comp");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [modalContent, setModalContent] = useState<ModalContent>();
  const [activeHistoricalComp, setActiveHistoricalComp] =
    useState<PoolComp | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const [compActiveTab, setCompActiveTab] = useState<CompTab>("Players");

  const isCompManager = localStorage.getItem('userIsCompManager') === 'true'

  const [userIsCompManager, setUserIsCompManager] = useState(isCompManager);

  const initialCompTabHasBeenSet = useRef(false);

  useEffect(() => {
    if (initialCompTabHasBeenSet.current) return;
    const slots = activePoolComp?.slots;
    if (!slots) return; // wait until allData has active comp + slots
    setCompActiveTab(
      tournamentHasHadAssignment(slots) ? "Main Comp" : "Players"
    );
    initialCompTabHasBeenSet.current = true;
  }, [activePoolComp?.slots]);


  function viewHistoricalComp(comp: PoolComp) {
    setActiveHistoricalComp(comp);
    setActiveView("Pool Comp");
  }

  function clearHistoricalComp() {
    setActiveHistoricalComp(null);
  }

  const sendMessageToBackendRef = useRef<((message: MessageToBackend) => void) | null>(null);


  const { orientation } = useOrientation();

  useEffect(() => {
    const { send, closeConnection, connect } = createWebSocketService(
      (stateUpdateFromBackend: BackendState) => {
        console.log("stateUpdateFromBackend", stateUpdateFromBackend);

        for (const key in stateUpdateFromBackend) {
          if (key === "activePoolComp") {
            const activePoolCompData = stateUpdateFromBackend.activePoolComp;
            const convertedActivePoolComp = activePoolCompData
              ? convertToPoolComp(activePoolCompData, stateUpdateFromBackend)
              : null;
            setStateIfChanged<PoolComp | null>(setActivePoolComp, convertedActivePoolComp);
          } else if (key === "compHistory") {
            const compHistoryData = stateUpdateFromBackend.compHistory;
            if (!compHistoryData) continue;
            const convertedCompHistory = compHistoryData.map((comp) =>
              convertToPoolComp(comp, stateUpdateFromBackend),
            );
            setStateIfChanged(setCompHistory, convertedCompHistory);
          } else if (key === "players") {
            setStateIfChanged(setPlayers, stateUpdateFromBackend.players);
          } else if (key === "autoAssignPlayers") {
            setStateIfChanged(
              setAutoAssignPlayers,
              stateUpdateFromBackend.autoAssignPlayers,
            );
          } else if (key === "leaderboard") {
            setStateIfChanged(
              setLeaderboard,
              stateUpdateFromBackend.leaderboard,
            );
          }
        }
      }, (actionInProgress: boolean) => {
        setStateIfChanged(setActionInProgress, actionInProgress);
      }, (connectionStatus: ConnectionStatus) => {
        setStateIfChanged(setConnectionStatus, connectionStatus);
      });

    sendMessageToBackendRef.current = send;
    // to prevent dev mode running twice causing error
    const connectTimer = window.setTimeout(connect, 0);

    return () => {
      window.clearTimeout(connectTimer);
      sendMessageToBackendRef.current = null;
      closeConnection();
    };

    function setStateIfChanged<StateValue>(
      setState: Dispatch<SetStateAction<StateValue>>,
      nextValue: StateValue,
    ): void {
      setState((previousValue) => {
        if (isEqual(previousValue, nextValue)) {
          return previousValue;
        }
        console.log("state changed", { previousValue, nextValue });
        return nextValue;
      });
    }
  }, []);

  const send = useCallback((message: MessageToBackend) => {
    sendMessageToBackendRef.current?.(message);
  }, [sendMessageToBackendRef]);


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
        activePoolComp,
        compHistory,
        players,
        leaderboard,
        autoAssignPlayers,
        send
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
