import "./TabBar.scss";

export function TabBar<T extends string>({
  tabs,
  selectedTab,
  onTabSelected,
}: {
  tabs: T[];
  selectedTab: T;
  onTabSelected: (selectedTab: T) => void;
}) {
  return (
    <tab-bar>
      {tabs.map((tab, tabIndex) => (
        <button
          key={tabIndex}
          type="button"
          className={selectedTab === tab ? "active" : ""}
          onClick={() => onTabSelected(tab)}
        >
          {tab}
        </button>
      ))}
    </tab-bar>
  );
}
