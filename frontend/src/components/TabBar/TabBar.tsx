import "./TabBar.scss";

export function TabBar({
  tabLabels,
  selectedTabIndex,
  onTabSelected,
}: {
  tabLabels: string[];
  selectedTabIndex: number;
  onTabSelected: (selectedTabIndex: number) => void;
}) {
  return (
    <tab-bar>
      {tabLabels.map((tabLabel, tabIndex) => (
        <button
          key={tabIndex}
          type="button"
          className={selectedTabIndex === tabIndex ? "active" : ""}
          onClick={() => onTabSelected(tabIndex)}
        >
          {tabLabel}
        </button>
      ))}
    </tab-bar>
  );
}
