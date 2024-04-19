import { useState } from 'react';
import { DAppProvider, Config } from '@usedapp/core';
import './App.css';
import Header from './components/Header/Header';
import TownGrid from './components/Grids/TownGrid/TownGrid';
import MarketplaceGrid from './components/Grids/MarketplaceGrid/MarketplaceGrid';
import MyAssetsGrid from './components/Grids/MyAssetsGrid/MyAssetsGrid';

const config: Config = {
  readOnlyChainId: 1, // Mainnet, change this as needed
  readOnlyUrls: {
    1: 'https://polygon-mainnet.infura.io/v3/615e0266e5284aeeb5863c6731dbf11e', // Replace with your Infura URL or another provider
  },
};

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
    <DAppProvider config={config}>
      <div className="app">
        <Header onHeaderClick={handleHeaderClick} />
        {renderGrid()}
      </div>
    </DAppProvider>
  );
}

export default App;
