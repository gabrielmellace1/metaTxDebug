import React from 'react';
import './Popup.css';
import { ethers } from 'ethers';

interface PopupProps {
  x: number;
  y: number;
  tile: {
    x: number;
    y: number;
    tokenId: number;
    owner?: string;
    price?: number;
    isOnState: boolean;
  };

}

const Popup: React.FC<PopupProps> = ({ x, y, tile }) => {

    const priceInEth = tile.price ? ethers.utils.formatEther(tile.price.toString()) : null;

    return (
        <div
          className={`AtlasPopup `}
          style={{ top: `${y}px`, left: `${x}px`, opacity: 0.6 }}
        >
          <div className="square-name">
            <span className="name">{tile.isOnState ? 'State' : 'Square'} {tile.tokenId}</span>
            <span className="coordinates">Coordinates: ({tile.x}, {tile.y})</span>
          </div>
          {tile.owner && (
            <div className="owner">
              Owner: <span>{tile.owner}</span>
            </div>
          )}
          {priceInEth && parseFloat(priceInEth) > 0 && (  
            <div className="price">
              Price: <span>{parseFloat(priceInEth).toFixed(0)} Bag</span>  
            </div>
          )}
        </div>
      );
    };
    
    export default Popup;
