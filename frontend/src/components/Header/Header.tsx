import { useAppContext } from "../../AppContext";

export function Header() {
  const { connectionStatus, currentView, setView } = useAppContext();
  return (
    <header>
      <nav-tabs>
        {(["Pool Comp", "Players", "Comp History"] as const).map((viewName) => (
          <button
            key={viewName}
            className={currentView === viewName ? "is-active" : ""}
            onClick={() => setView(viewName)}
          >
            {viewName}
          </button>
        ))}
      </nav-tabs>
      <connection-status data-status={connectionStatus}>
        {connectionStatus}
      </connection-status>
    </header>
  );
}
