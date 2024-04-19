import * as React from 'react';
import { useEthers } from '@usedapp/core';
import { Coord, Layer, TileMap } from 'react-tile-map';
import './MarketplaceGrid.css';
import { switchColor } from '../../../helpers/GridHelper';



type AtlasTile = {
    x: number;
    y: number;
    tokenId: number;
    clickableURL?: string;
    forSale: boolean;
    price?: number;
    owner: string;
    isOnState: boolean;
}

let atlas: Record<string, AtlasTile> | null = null

async function loadTiles() {
  try {
    const response = await fetch('https://squares.town/api/graphSquares');

    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Oops, we haven't got JSON!");
    }

    const data = await response.json();
    atlas = data.data as Record<string, AtlasTile>;
    return data.data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    // Re-throw the error so it can be caught by the caller
    throw error;
  }
}


loadTiles().catch(console.error)

export const COLOR_BY_TYPE: Record<number, string> = Object.freeze({
  0: '#5054d4', // my parcels 1
  1: '#ff4053', // my parcels on sale 1
  2: '#4043a9', // my estates 1
  3: '#cc3342', // my estates on sale 1
  4: '#716c7a', // Other parcels 1
  5: '#ff4053', // Other parcels on sale 1
  6: '#434049', // others states 1
  7: '#cc3342', // other states on sale
})

let selected: Coord[] = []

function isSelected(x: number, y: number) {
  return selected.some(coord => coord.x === x && coord.y === y)
}

const MarketplaceGrid: React.FC = () => {
  const { account } = useEthers();

const atlasLayer: Layer = (x, y) => {
  const id = x + ',' + y
  if (atlas && id in atlas) {
    const tile = atlas[id]
    const color = COLOR_BY_TYPE[switchColor(tile.isOnState,tile.forSale,tile.owner,account)]

    const top = false
    const left = false
    const topLeft = false

    return {
      color,
      top,
      left,
      topLeft
    }
  } else {
    return {
      color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[12] : COLOR_BY_TYPE[13]
    }
  }
}


const selectedStrokeLayer: Layer = (x, y) => {
  return isSelected(x, y) ? { color: '#ff0044', scale: 0.9 } : null
}

const selectedFillLayer: Layer = (x, y) => {
  return isSelected(x, y) ? { color: '#ff9990', scale: 0.9 } : null
}







  // Now you can use the `account` variable to access the connected wallet address
  // Example: console.log(account);

  return (
    <div className="grid-container">
      <TileMap
        className="atlas"
        layers={[atlasLayer, selectedStrokeLayer, selectedFillLayer]}
        onClick={(x, y) => {
          if (isSelected(x, y)) {
            selected = selected.filter(coord => coord.x !== x || coord.y !== y);
          } else {
            selected.push({ x, y });
          }
        }}
      />
      
     
    </div>
  );
};

export default MarketplaceGrid;
