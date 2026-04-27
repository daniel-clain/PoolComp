import { useAppContext } from "./AppContext";
import { Header } from "./components/Header/Header";
import { ModalHost } from "./components/Modal/ModalHost";
import { ViewContainer } from "./components/ViewContainer/ViewContainer";
import { Comp } from "./views/Comp/Comp";
import { CompHistory } from "./views/CompHistory/CompHistory";
import { LandingPage } from "./views/LandingPage/LandingPage";
import { Players } from "./views/Players/Players";

export function App() {
  const { activePoolComp: activePoolComp, activeHistoricalComp, activeView, orientation } = useAppContext();

  return (
    <app-container className={`is-${orientation}`}>
      <app-content>
        <Header />
        <ViewContainer>
          {(() => {
            switch (activeView) {
              case "Pool Comp":
                return (activePoolComp || activeHistoricalComp) ? <Comp /> : <LandingPage />;
              case "Comp History":
                return <CompHistory />;
              case "Players":
                return <Players />;
            }
          })()}
        </ViewContainer>
        <ModalHost />
      </app-content>
    </app-container>
  );
}
