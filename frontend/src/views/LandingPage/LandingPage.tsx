import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { send, activePoolComp } = useAppContext();

  return (
    <landing-view>
      <button className="active" disabled={activePoolComp !== null} onClick={() => send(['createPoolComp'])}>
        New Pool Comp
      </button>
    </landing-view>
  );
}
