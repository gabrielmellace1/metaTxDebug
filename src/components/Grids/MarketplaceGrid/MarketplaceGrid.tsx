import * as React from 'react'
import { Coord, Layer, TileMap } from 'react-tile-map'
import './MarketplaceGrid.css';
import { COLOR_BY_TYPE, switchColor } from '../../../helpers/GridHelper';
import { AtlasTile } from '../../../types/atlasTypes';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getAccount } from '../../../services/walletManager';



let atlas: Record<string, AtlasTile> | null = null

async function loadTiles(setAtlasLoaded: (loaded: boolean) => void) {
  const resp = await fetch('https://squares.town/api/graphSquares');
  const json = await resp.json();
  atlas = json.data as Record<string, AtlasTile>;
  setAtlasLoaded(true); // Indicate that atlas has been loaded
}



let userWallet = await getAccount();

let selected: Coord[] = []

function isSelected(x: number, y: number) {
  return selected.some(coord => coord.x === x && coord.y === y)
}

// Here i would like to be able to have a variable with the user

const atlasLayer: Layer = (x, y) => {
  const id = x + ',' + y

  if (atlas !== null && id in atlas) {
    
    const tile = atlas[id]
    const color = COLOR_BY_TYPE[switchColor(tile.isOnState,tile.forSale,tile.owner,userWallet)];
    const top = !tile.top
    const left = !tile.left
    const topLeft = true
    return {
      color,
      top,
      left,
      topLeft
    }
  } else {
    
    return {
      
      color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[8] : COLOR_BY_TYPE[9]
    }
  }
}



const selectedStrokeLayer: Layer = (x, y) => {
  return isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
}

const selectedFillLayer: Layer = (x, y) => {
  return isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
}




const MarketplaceGrid: React.FC = () => {
  const [atlasLoaded, setAtlasLoaded] = useState(false);


  useEffect(() => {
    loadTiles(setAtlasLoaded).catch(console.error);
  }, []);


  return (
    <div className="grid-container">
      {atlasLoaded ? (
         <TileMap
         className="atlas"
         layers={[atlasLayer, selectedStrokeLayer, selectedFillLayer]}
         onClick={(x, y) => {
           if (isSelected(x, y)) {
             selected = selected.filter(coord => coord.x !== x || coord.y !== y)
           } else {
             selected.push({ x, y })
           }
           console.log(x+","+y);
         }}
       />
      ) : (
        <div>Loading atlas...</div>
      )}
    </div>
  );
};

export default MarketplaceGrid;
