import * as React from "react";
import { useState, useEffect } from "react";
import { Coord, Layer, TileMap } from "react-tile-map";
import "./MyAssetsGrid.css";
import {
  COLOR_BY_TYPE,
  gridProps,
  switchColor,
} from "../../../helpers/GridHelper";
import { AtlasTile } from "../../../types/atlasTypes";
import Popup from "../Popup/Popup";
import Loading from '../../Utils/Loading';

// Change the type of stateSelected to boolean and remove the incorrect usage as a function
interface MyAssetsGridProps {
  userAddress: string | undefined;
  setSelectedTiles: (tiles: AtlasTile[]) => void;
  stateSelected: boolean;
  setStateSelected: (state: boolean) => void;
}


let atlas: Record<string, AtlasTile> | null = null;
let selected: Coord[] = [];




const getCoords = (x: number | string, y: number | string) => `${x},${y}`;

async function loadTiles(setAtlasLoaded: (loaded: boolean) => void) {
  const resp = await fetch("https://squares.town/api/graphSquares");
  const json = await resp.json();
  atlas = json.data as Record<string, AtlasTile>;
  setAtlasLoaded(true);
}

function isSelected(x: number, y: number) {
  return selected.some((coord) => coord.x === x && coord.y === y);
}

const selectedStrokeLayer: Layer = (x, y) =>
  isSelected(x, y) ? { color: "#ff0044", scale: 1.4 } : null;
const selectedFillLayer: Layer = (x, y) =>
  isSelected(x, y) ? { color: "#ff9990", scale: 1.2 } : null;

const MyAssetsGrid: React.FC<MyAssetsGridProps> = ({userAddress, setSelectedTiles,stateSelected,setStateSelected }) => {
  const [atlasLoaded, setAtlasLoaded] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<AtlasTile | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

 

  useEffect(() => {
    loadTiles(setAtlasLoaded).catch(console.error);

    const updateMousePosition = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const handleHover = (x: string | number, y: string | number) => {
    const id = getCoords(x, y);
    const tile = atlas ? atlas[id] : null;
    setHoveredTile(tile);
    setShowPopup(tile !== null);
  };

  async function handleClick(x: number, y: number) {
    const id = getCoords(x, y);
    const tile = atlas ? atlas[id] : null;

    if (tile) {
      if (!tile.forSale && tile.owner !== userAddress?.toLowerCase()) {
        console.log(tile.owner+" "+userAddress);
        return;
      }
      if (tile.isOnState) {
        selected = [{ x, y }];
        if (atlas) {
          // Find other tiles with the same tokenId
          Object.entries(atlas).forEach(([key, value]) => {
            if (value.tokenId === tile.tokenId && key !== id) {
              const coords = key.split(",").map(Number);
              selected.push({ x: coords[0], y: coords[1] });
            }
          });
        }
        
        setStateSelected(true);
      } else {
        if (stateSelected) {
          selected = [];
          
          setStateSelected(false);
        }

        if (isSelected(x, y)) {
          selected = selected.filter((coord) => coord.x !== x || coord.y !== y);
        } else {
          selected.push({ x, y });
        }
      }
    }

   
    setSelectedTiles(selected.map(coord => atlas ? atlas[getCoords(coord.x, coord.y)] : null).filter((tile): tile is AtlasTile => tile !== null));

    
  }

  const atlasLayer: Layer = React.useCallback(
    (x, y) => {
      const id = getCoords(x, y);
      if (atlas && id in atlas) {
        const tile = atlas[id];
        const color =
          COLOR_BY_TYPE[
            switchColor(tile.isOnState, tile.forSale, tile.owner, userAddress)
          ];
        return { color, top: !tile.top, left: !tile.left, topLeft: true };
      } else {
        return {
          color: (x + y) % 2 === 0 ? COLOR_BY_TYPE[8] : COLOR_BY_TYPE[9],
        };
      }
    },
    [userAddress]
  );

  return (
    <div className="grid-container">
      {atlasLoaded ? (
        <>
          <TileMap
            {...gridProps}
            className="atlas"
            layers={[atlasLayer, selectedStrokeLayer, selectedFillLayer]}
            onClick={(x, y) => handleClick(x, y)}
            onHover={handleHover}
          />
          {showPopup && hoveredTile && (
            <Popup
              x={mousePosition.x - 150}
              y={mousePosition.y - 350}
              tile={hoveredTile}
            />
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default MyAssetsGrid;
