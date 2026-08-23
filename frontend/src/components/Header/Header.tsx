import { useAppContext, type View } from "../../AppContext";

const navigationViews: View[] = ["Pool Comp", "Players", "Comp History", "Stats"];

export function Header() {
  const {
    connectionStatus,
    activeView,
    setActiveView,
    actionInProgress,
    clearHistoricalComp,
    userIsAdmin,
    backendErrors,
  } = useAppContext();
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
      {userIsAdmin && backendErrors.length > 0 && (
        <errors-count>{backendErrors.length}</errors-count>
      )}
      <action-in-progress className={actionInProgress ? "active" : ""} />
      <connection-status data-status={connectionStatus}>
        {connectionStatus}
      </connection-status>
    </header>
  );
}
