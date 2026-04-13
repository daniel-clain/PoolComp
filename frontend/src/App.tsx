import { useAppContext } from "./AppContext";
import { Header } from "./components/Header/Header";
import { ViewContainer } from "./components/ViewContainer/ViewContainer";
import { Comp } from "./views/Comp/Comp";
import { CompHistory } from "./views/History/CompHistory";
import { LandingPage } from "./views/LandingPage/LandingPage";
import { Players } from "./views/Players/Players";

export function App() {
  const { activePoolComp, activeView, orientation } = useAppContext();

  return (
    <app-container className={`is-${orientation}`}>
      <app-content>
        <Header />
        <ViewContainer>
          {(() => {
            switch (activeView) {
              case "Pool Comp":
                return activePoolComp ? <Comp /> : <LandingPage />;
              case "Comp History":
                return <CompHistory />;
              case "Players":
                return <Players />;
            }
          })()}
        </ViewContainer>
      </app-content>
    </app-container>
  );
}
