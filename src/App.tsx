import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import TownGrid from './components/Grids/TownGrid/TownGrid';
import MarketplaceGrid from './components/Grids/MarketplaceGrid/MarketplaceGrid';
import MyAssetsGrid from './components/Grids/MyAssetsGrid/MyAssetsGrid';

function App() {
  const [gridType, setGridType] = useState('town'); // Default grid type

  const handleHeaderClick = (type: string) => {
    setGridType(type);
  };

  const renderGrid = () => {
    switch (gridType) {
      case 'town':
        return <TownGrid />;
      case 'marketplace':
        return <MarketplaceGrid />;
      case 'myAssets':
        return <MyAssetsGrid />;
      default:
        return <TownGrid />;
    }
  };

  return (
    <div className="app">
      <Header onHeaderClick={handleHeaderClick} />
      {renderGrid()}
    </div>
  );
}

export default App;
