import { Suspense, lazy, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { AuthContextProvider } from "./context/auth.context";
import WelcomeModal from "./components/Modals/WelcomeModal";
import Loading from "./components/Utils/Loading";

const TownGrid = lazy(() => import("./components/Town/TownComponent"));
const MarketplaceGrid = lazy(() => import("./components/Grids/MarketplaceGrid/MarketplaceGrid"));
const MyAssetsGrid = lazy(() => import("./components/Grids/MyAssetsGrid/MyAssetsGrid"));
const Editor = lazy(() => import("./components/Editor/Editor"));
const About = lazy(() => import("./components/About/About"));

function App() {
  const [gridType, setGridType] = useState<string>("town");
  const [showAbout, setShowAbout] = useState(false);

  const handleHeaderClick = (type: string) => {
    setGridType(type);
  };

  const confirmModal = () => {
    setShowAbout(true);
  };

  let ActiveComponent: React.ElementType = TownGrid; // Default
  switch (gridType) {
    case "town": ActiveComponent = TownGrid; break;
    case "marketplace": ActiveComponent = MarketplaceGrid; break;
    case "myAssets": ActiveComponent = MyAssetsGrid; break;
    case "editor": ActiveComponent = Editor; break;
  }

  return (
    <div className="app">
      <AuthContextProvider>
        <Header onHeaderClick={handleHeaderClick} />
        <Suspense fallback={<Loading />}>
          {showAbout ? <About /> : <ActiveComponent />}
        </Suspense>
      </AuthContextProvider>
      <WelcomeModal onConfirm={confirmModal} />
    </div>
  );
}

export default App;
