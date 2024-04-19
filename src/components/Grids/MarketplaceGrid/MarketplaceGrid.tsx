import * as React from 'react'
import { Coord, Layer, TileMap } from 'react-tile-map'
import './MarketplaceGrid.css';
import { COLOR_BY_TYPE, switchColor } from '../../../helpers/GridHelper';
import { AtlasTile } from '../../../types/atlasTypes';


let atlas: Record<string, AtlasTile> | null = null

async function loadTiles() {
  const resp = await fetch('https://squares.town/api/graphSquares')
  const json = await resp.json()
  atlas = json.data as Record<string, AtlasTile>
}

loadTiles().catch(console.error)



let selected: Coord[] = []

function isSelected(x: number, y: number) {
  return selected.some(coord => coord.x === x && coord.y === y)
}

const atlasLayer: Layer = (x, y) => {
  const id = x + ',' + y

  if (atlas !== null && id in atlas) {
    
    const tile = atlas[id]
    const color = COLOR_BY_TYPE[switchColor(tile.isOnState,tile.forSale,tile.owner,tile.owner)];
    const top = tile.top
    const left = tile.left
    const topLeft = true
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
  return isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
}

const selectedFillLayer: Layer = (x, y) => {
  return isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
}




const MarketplaceGrid: React.FC = () => {
  return (
    <div className="grid-container">
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
  </div>
  );
};

export default MarketplaceGrid;
