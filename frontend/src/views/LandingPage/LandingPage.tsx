import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { createPoolComp } = useAppContext();

  return (
    <home-view>
      <button className="active" onClick={createPoolComp}>
        New Pool Comp
      </button>
    </home-view>
  );
}
