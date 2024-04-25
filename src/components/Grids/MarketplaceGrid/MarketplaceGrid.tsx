import * as React from "react";
import { useState, useEffect } from "react";
import { Coord, Layer, TileMap } from "react-tile-map";
import "./MarketplaceGrid.css";
import {
  COLOR_BY_TYPE,
  gridProps,
  switchColor,
} from "../../../helpers/GridHelper";
import { AtlasTile } from "../../../types/atlasTypes";
import Popup from "./Popup/Popup";
import { useAuth } from "../../../context/auth.context";
import { useMarketplace } from "../../../context/marketplace.context";

let atlas: Record<string, AtlasTile> | null = null;
let selected: Coord[] = [];
let stateSelected = false;

let userWallet = "0xea5fed1d0141f14de11249577921b08783d6a360";

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

const MarketplaceGrid: React.FC = () => {
  const [atlasLoaded, setAtlasLoaded] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<AtlasTile | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { userAddress } = useAuth();

  const { fetchUserBalance } = useMarketplace();

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
      if (!tile.forSale && tile.owner !== userAddress) {
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
        stateSelected = true;
      } else {
        if (stateSelected) {
          selected = [];
          stateSelected = false;
        }

        if (isSelected(x, y)) {
          selected = selected.filter((coord) => coord.x !== x || coord.y !== y);
        } else {
          selected.push({ x, y });
        }
      }
    }

    // Determine actions based on the properties of the selected tiles
    let canBuy = true,
      canSell = true,
      canCancel = true;

    for (const coord of selected) {
      const tileId = getCoords(coord.x, coord.y);
      const selTile = atlas?.[tileId]; // Correct usage of optional chaining
      if (!selTile) continue;

      if (selTile.owner !== userWallet || !selTile.forSale) {
        canCancel = false; // Cannot cancel if any tile is not owned by the user or not for sale
      }

      if (selTile.owner !== userWallet || selTile.forSale) {
        canSell = false; // Cannot sell if any tile is not owned by the user
      }

      if (selTile.owner === userWallet || !selTile.forSale) {
        canBuy = false; // Cannot buy if any tile is owned by the user or not for sale
      }
    }

    // Output the status of actions
    console.log("Actions enabled/disabled:", {
      Buy: canBuy ? "Enabled" : "Disabled",
      Sell: canSell ? "Enabled" : "Disabled",
      Cancel: canCancel ? "Enabled" : "Disabled",
    });

    console.log("Selected Tiles:", selected);
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
      <button type="button" onClick={() => fetchUserBalance(true)}>
        Allow Bag
      </button>
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
        <div>Loading atlas...</div>
      )}
    </div>
  );
};

export default MarketplaceGrid;
