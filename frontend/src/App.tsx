import { useAppContext } from "./AppContext";
import { Header } from "./components/Header/Header";
import { Modal } from "./components/Modal/Modal";
import { ViewContainer } from "./components/ViewContainer/ViewContainer";
import { Admin } from "./views/Admin/Admin";
import { Comp } from "./views/Comp/Comp";
import { CompHistory } from "./views/CompHistory/CompHistory";
import { LandingPage } from "./views/LandingPage/LandingPage";
import { Players } from "./views/Players/Players";
import { Stats } from "./views/Stats/Stats";

export function App() {
  const { activePoolComp, activeHistoricalComp, activeView, orientation } = useAppContext();

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
              case "Stats":
                return <Stats />;
              case "Admin":
                return <Admin />;
            }
          })()}
        </ViewContainer>
        <Modal />
      </app-content>
    </app-container>
  );
}
