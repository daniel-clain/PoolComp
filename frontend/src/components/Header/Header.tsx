import { useAppContext, type View } from "../../AppContext";

const navigationViews: View[] = ["Pool Comp", "Players", "Comp History", "Leaderboard"];

export function Header() {
  const { connectionStatus, activeView, setActiveView, actionInProgress, clearHistoricalComp } = useAppContext();
  return (
    <header>
      <nav-tabs>
        {navigationViews.map((viewName) => (
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
