import { useAppContext } from "../../AppContext";

export function Header() {
  const { connectionStatus, activeView, setActiveView, actionInProgress, clearHistoricalComp } = useAppContext();
  return (
    <header>
      <nav-tabs>
        {(["Pool Comp", "Players", "Comp History"] as const).map((viewName) => (
          <button
            key={viewName}
            className={activeView === viewName ? "active" : ""}
            onClick={() => (setActiveView(viewName), viewName === "Pool Comp" && clearHistoricalComp())}
          >
            {viewName}
          </button>
        ))}
      </nav-tabs>
      <action-in-progress className={actionInProgress ? "active" : ""} />
      <connection-status data-status={connectionStatus}>
        {connectionStatus}
      </connection-status>
    </header>
  );
}
