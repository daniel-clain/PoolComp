import { useAppContext } from "../../AppContext";

export function LandingPage() {
  const { send, activePoolComp } = useAppContext();

  return (
    <landing-view>
      <button className="start-game active" disabled={activePoolComp !== null} onClick={() => send(['createPoolComp'])}>
        New Pool Comp
      </button>
      <button className="do-thing danger" onClick={(e) => {
        if (e.shiftKey) {
          console.log('doing thing');
          send(['doThing', {}]);
        } else {
          window.alert('why would you do this?');
        }
      }}>Do Thing</button>
    </landing-view>
  );
}
