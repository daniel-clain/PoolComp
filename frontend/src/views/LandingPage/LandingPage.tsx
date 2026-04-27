import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { send } = useAppContext();

  return (
    <home-view>
      <button className="active" onClick={() => send(['createPoolComp'])}>
        New Pool Comp
      </button>
    </home-view>
  );
}
