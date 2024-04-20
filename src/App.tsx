import  { Suspense, lazy, useState } from 'react';
import './App.css';
import Header from './components/Header/Header';

// Lazy-loaded components
const TownGrid = lazy(() => import('./components/Grids/TownGrid/TownGrid'));
const MarketplaceGrid = lazy(() => import('./components/Grids/MarketplaceGrid/MarketplaceGrid'));
const MyAssetsGrid = lazy(() => import('./components/Grids/MyAssetsGrid/MyAssetsGrid'));

function App() {
  const [gridType, setGridType] = useState('town'); // Default grid type

  const handleHeaderClick = (type: string) => {
    setGridType(type);
  };

  // Determine which grid component to render based on the current gridType
  let GridComponent;
  switch (gridType) {
    case 'town':
      GridComponent = TownGrid;
      break;
    case 'marketplace':
      GridComponent = MarketplaceGrid;
      break;
    case 'myAssets':
      GridComponent = MyAssetsGrid;
      break;
    default:
      GridComponent = TownGrid;
  }

  // Render the application
  return (
    <div className="app">
      <Header onHeaderClick={handleHeaderClick} />
      <Suspense fallback={<div>Loading...</div>}>
        <GridComponent />
      </Suspense>
    </div>
  );
}

export default App;
