import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { send } = useAppContext();

  return (
    <landing-view>
      <button className="active" onClick={() => send(['createPoolComp'])}>
        New Pool Comp
      </button>
    </landing-view>
  );
}
