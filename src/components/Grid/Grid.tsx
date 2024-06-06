import * as React from "react";
import { useState, useEffect } from "react";
import { Coord, Layer, TileMap } from "react-tile-map";
import "./Grid.css";
import {
  COLOR_BY_TYPE,
  gridProps,
  switchColor
} from "../../helpers/GridHelper";
import { AtlasTile,AtlasToken } from "../../types/atlasTypes";
import Loading from '../Utils/Loading';
import { Flex } from "@chakra-ui/react";
import InfoSidebar from "./InfoSidebar";

// Change the type of stateSelected to boolean and remove the incorrect usage as a function
interface GridProps {
  userAddress: string | undefined;
  setSelectedTiles: (tiles: AtlasToken[]) => void;
  stateSelected: boolean;
  setStateSelected: (state: boolean) => void;
  highlightOnlyOwned:boolean;
  colorReferences: { color: string; text: string }[];
}


let atlas: Record<string, AtlasTile> | null = null;
let selected: Coord[] = [];
let tokenIdsSelected: AtlasToken[] = [];



const getCoords = (x: number | string, y: number | string) => `${x},${y}`;

async function loadTiles(setAtlasLoaded: (loaded: boolean) => void) {
  const jsonUrl = 'https://pub-7259634f7e994e1e8a46cf6cfaea5881.r2.dev/transformedTiles.json';
  const etagKey = 'squaresDataETag';
  const cachedDataKey = 'cachedSquaresData';

  const etag = localStorage.getItem(etagKey) || '';

  try {
    console.log('Making HEAD request to check ETag...');
    const headResponse = await fetch(jsonUrl, { method: 'HEAD' });
    const newEtag = headResponse.headers.get('ETag');

    if (newEtag !== etag && newEtag) {
      console.log('ETag has changed, fetching new data...');
      localStorage.setItem(etagKey, newEtag);

      const dataResponse = await fetch(jsonUrl);
      const data = await dataResponse.json();

      localStorage.setItem(cachedDataKey, JSON.stringify(data));
      atlas = data.data as Record<string, AtlasTile>;
      console.log(atlas);
      setAtlasLoaded(true);
    } else {
      console.log('ETag is the same, using cached data...');
      const cachedData = localStorage.getItem(cachedDataKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        atlas = data.data as Record<string, AtlasTile>;
        console.log(atlas);
        setAtlasLoaded(true);
      }
    }
  } catch (error) {
    console.error('Error fetching squares data:', error);

    const cachedData = localStorage.getItem(cachedDataKey);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      atlas = data.data as Record<string, AtlasTile>;
      console.log(atlas);
      setAtlasLoaded(true);
    }
  }
}

function isSelected(x: number, y: number) {
  return selected.some((coord) => coord.x === x && coord.y === y);
}

const selectedStrokeLayer: Layer = (x, y) =>
  isSelected(x, y) ? { color: "#ff0044", scale: 1.4 } : null;
const selectedFillLayer: Layer = (x, y) =>
  isSelected(x, y) ? { color: "#ff9990", scale: 1.2 } : null;


  



const Grid: React.FC<GridProps> = ({userAddress, setSelectedTiles,stateSelected,setStateSelected, highlightOnlyOwned,colorReferences}) => {
  const [atlasLoaded, setAtlasLoaded] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<AtlasTile | null>(null);

  

  useEffect(() => {
    loadTiles(setAtlasLoaded).catch(console.error);

  }, []);

  useEffect(() => {
    // Reset selected tiles when the user address changes
    selected = [];
    tokenIdsSelected = [];
    setSelectedTiles([]);
    setStateSelected(false);
}, [userAddress, setSelectedTiles, setStateSelected]);


  const handleHover = (x: number, y: number) => {
    const id = `${x},${y}`;
    const tile = atlas ? atlas[id] : null;
    setHoveredTile(tile);
  };



  async function handleClick(x: number, y: number) {
    const id = getCoords(x, y);
    const tile = atlas ? atlas[id] : null;
  
    if (tile) {
      if (!tile.forSale && tile.owner !== userAddress?.toLowerCase() || highlightOnlyOwned && tile.owner !== userAddress?.toLowerCase() ) {
        console.log(tile.owner + " " + userAddress);
        return;
      }
  
      if (tile.isOnState) {
        if (!stateSelected) {
          tokenIdsSelected = [];
          selected = [];
          
        }
  
        const existingTokenIndex = tokenIdsSelected.findIndex(t => t.tokenId === tile.tokenId);
        if (existingTokenIndex > -1) {
          tokenIdsSelected.splice(existingTokenIndex, 1);
          selected = [];
        } else {
          tokenIdsSelected.push({ tokenId: tile.tokenId, forSale: tile.forSale, price: tile.price, owner: tile.owner });
          selected = [{ x, y }];
        }
  
        if (atlas) {
          // Find other tiles with the same tokenId
          Object.entries(atlas).forEach(([key, value]) => {
            if (tokenIdsSelected.some(t => t.tokenId === value.tokenId) && key !== id && value.isOnState) {
              const coords = key.split(",").map(Number);
              selected.push({ x: coords[0], y: coords[1] });
            }
          });
        }
  
        setStateSelected(true);
      } else {
  
        if (stateSelected) {
          tokenIdsSelected = [];
          selected = [];
          setStateSelected(false);
        }
  
        if (isSelected(x, y)) {
          selected = selected.filter((coord) => coord.x !== x || coord.y !== y);
          const index = tokenIdsSelected.findIndex(t => t.tokenId === tile.tokenId);
          if (index > -1) tokenIdsSelected.splice(index, 1);
        } else {
          tokenIdsSelected.push({ tokenId: tile.tokenId, forSale: tile.forSale, price: tile.price, owner: tile.owner });
          selected.push({ x, y });
        }
        setStateSelected(false);
      }
    }
  
    
    
    setSelectedTiles([...tokenIdsSelected.map(tile => ({ ...tile }))]);

    
  }
  
  

  const atlasLayer: Layer = React.useCallback(
    (x, y) => {
      const id = getCoords(x, y);
      if (atlas && id in atlas) {
        const tile = atlas[id];
        const color =
          COLOR_BY_TYPE[
            switchColor(tile.isOnState, tile.forSale, tile.owner, userAddress,highlightOnlyOwned)
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
    <Flex direction="column" position="relative" className="grid-container" w="100%" h="100%"> {/* Ensured Flex takes full width and height */}
      {atlasLoaded ? (
        <>
          <TileMap
            {...gridProps}
            className="atlas"
            layers={[atlasLayer, selectedStrokeLayer, selectedFillLayer]}
            onClick={(x, y) => handleClick(x, y)}
            onHover={handleHover}
          />
          
          <InfoSidebar tile={hoveredTile} colorReferences={colorReferences} />
        </>
      ) : (
        <Flex align="center" justify="center" w="100%" h="100%">
          <Loading />
        </Flex>
      )}
    </Flex>
  ); 
};

export default Grid;
