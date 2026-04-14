import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { createPoolComp } = useAppContext();

  return (
    <home-view>
      <home-button-container>
        <button className="is-primary" onClick={createPoolComp}>
          New Pool Comp
        </button>
      </home-button-container>
    </home-view>
  );
}
