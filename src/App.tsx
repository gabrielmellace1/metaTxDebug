import { Suspense, lazy, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { AuthContextProvider } from "./context/auth.context";
import { MarketplaceContextProvider } from "./context/marketplace.context";
// Lazy-loaded components
const TownGrid = lazy(() => import("./components/Town/TownComponent")); // Assuming TownGrid uses Phaser
const MarketplaceGrid = lazy(
  () => import("./components/Grids/MarketplaceGrid/MarketplaceGrid")
);
const MyAssetsGrid = lazy(
  () => import("./components/Grids/MyAssetsGrid/MyAssetsGrid")
);
const Editor = lazy(() => import("./components/Editor/Editor"));

function App() {
  const [gridType, setGridType] = useState<string>("town"); // Default grid type

  const handleHeaderClick = (type: string) => {
    setGridType(type);
  };

  // Determine which grid or game component to render based on the current gridType
  let ActiveComponent: React.ElementType;
  switch (gridType) {
    case "town":
      ActiveComponent = TownGrid;
      break;
    case "marketplace":
      ActiveComponent = MarketplaceGrid;
      break;
    case "myAssets":
      ActiveComponent = MyAssetsGrid;
      break;
    case "editor":
      ActiveComponent = Editor;
      break;
    default:
      ActiveComponent = TownGrid; // Default or fallback
  }

  return (
    <div className="app">
      <AuthContextProvider>
        <MarketplaceContextProvider>
          <Header onHeaderClick={handleHeaderClick} />
          <Suspense fallback={<div>Loading...</div>}>
            <ActiveComponent />
          </Suspense>
        </MarketplaceContextProvider>
      </AuthContextProvider>
    </div>
  );
}

export default App;
