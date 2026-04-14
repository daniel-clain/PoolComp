import { useAppContext } from "../../AppContext";

export function Header() {
  const { connectionStatus, activeView, setActiveView } = useAppContext();
  return (
    <header>
      <nav-tabs>
        {(["Pool Comp", "Players", "Comp History"] as const).map((viewName) => (
          <button
            key={viewName}
            className={activeView === viewName ? "active" : ""}
            onClick={() => setActiveView(viewName)}
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
