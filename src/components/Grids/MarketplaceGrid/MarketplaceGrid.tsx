import React, { useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { Coord, Layer, TileMap } from 'react-tile-map';
import './MarketplaceGrid.css';

type AtlasTile = {
  x: number;
  y: number;
  tokenId: number;
  clickableURL?: string;
  forSale: boolean;
  price?: number;
  owner: string;
  isOnState: boolean;
};

const MarketplaceGrid: React.FC = () => {
  const { account } = useEthers();
  const [atlas, setAtlas] = useState<Record<string, AtlasTile> | null>(null);

  const loadTiles = async () => {
    try {
      const response = await fetch('https://squares.town/api/graphSquares');
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      const data = await response.json();
      setAtlas(data.data);
    } catch (error) {
      console.error("Error loading tiles:", error);
    }
  };

  useEffect(() => {
    loadTiles();
  }, [account]);  // Depend on account to reload tiles when it changes

  // Render your component with the atlas data
  return (
    <div className="grid-container">
      <TileMap
        className="atlas"
        layers={[/* your layers here */]}
        onClick={(x, y) => {
          // handle tile click
        }}
      />
      {atlas && Object.keys(atlas).length > 0 && (
        <div>Atlas Loaded</div>
      )}
    </div>
  );
};

export default MarketplaceGrid;
