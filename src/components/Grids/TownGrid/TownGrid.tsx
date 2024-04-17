import React from 'react';
import { Coord, Layer, TileMap } from 'react-tile-map';


let hover: Coord = { x: 0, y: 0 }

const isPositive = (x: number, y: number) => x > 0 && y > 0

const positiveLayer: Layer = (x, y) => {
  return {
    color: isPositive(x, y) ? '#cccccc' : '#888888'
  }
}

const hoverLayer: Layer = (x, y) => {
  return hover.x === x && hover.y === y
    ? { color: isPositive(x, y) ? '#ff0000' : '#00ff00' }
    : null
}


const TownGrid: React.FC = () => {
  return (
    <TileMap layers={[positiveLayer, hoverLayer]} onHover={(x, y) => (hover = { x, y })} />
  );
};

export default TownGrid;
