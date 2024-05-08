// src/helpers/GridHelper.ts
const GRID_WIDTH = 500; 
export const COLOR_BY_TYPE: Record<number, string> = Object.freeze({
  0: '#5054d4', // my parcels 1
  1: '#d350d4', // my parcels on sale 1
  2: '#5054d4', // my estates 1
  3: '#d350d4', // my estates on sale 1
  4: '#716c7a', // Other parcels 1
  5: '#ff4053', // Other parcels on sale 1
  6: '#434049', // others states 1
  7: '#ff4053', // other states on sale
  8: '#18141a', // background
  9: '#110e13', // loading odd


})

export const gridProps = {
  x: 0,
  y: 0,
  className: 'react-tile-map',
  initialX: 0,
  initialY: 0,
  size: 14,
  zoom: 1,
  minSize: 7,
  maxSize: 40,
  minX: -150,
  maxX: 650,
  minY: -150,
  maxY: 650,
  panX: 1300,
  panY: 250,
  padding: 4,
  isDraggable: true,
  withZoomControls: false,
  layers: []
}


export const switchColor = (
  isOnState: boolean,
  forSale: boolean,
  owner: string,
  userAccount: string | null | undefined
): number => {
  // Normalize the case by converting both addresses to lowercase before comparison
  const normalizedOwner = owner.toLowerCase();
  const normalizedUserAccount = userAccount ? userAccount.toLowerCase() : '';

  if (isOnState) {
      if (forSale) {
          return normalizedUserAccount && normalizedUserAccount === normalizedOwner ? 3 : 7;
      } else {
          return normalizedUserAccount && normalizedUserAccount === normalizedOwner ? 2 : 6;
      }
  } else {
      if (forSale) {
          return normalizedUserAccount && normalizedUserAccount === normalizedOwner ? 1 : 5;
      } else {
          return normalizedUserAccount && normalizedUserAccount === normalizedOwner ? 0 : 4;
      }
  }
};


export function tokenIdToPosition(tokenId: number ) {
    if (tokenId <= 0) {
        throw new Error("SquareNFT: Token ID must be greater than 0");
    }
    const adjustedId = BigInt(tokenId) - BigInt(1); // Convert tokenId to BigInt and adjust for 1-based indexing
    const x = Number(adjustedId % BigInt(GRID_WIDTH)); // Use BigInt for GRID_WIDTH and convert result to Number
    const y = Number(adjustedId / BigInt(GRID_WIDTH)); // Same as above
    return { x, y };
}

export function positionToTokenId(x: number, y: number) {
    return y * GRID_WIDTH + x + 1; // +1 for 1-based indexing
}


export async function fetchSquareIds(stateId: number) {
  const query = `
      query GetSquareIds($stateId: ID!) {
          state(id: $stateId) {
              squares(first: 1000) {
                  id
              }
          }
      }
  `;

  const response = await fetch('https://api.studio.thegraph.com/proxy/48884/squareblocks/version/latest', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Add this line if authentication is needed
      },
      body: JSON.stringify({
          query,
          variables: {
              stateId: stateId
          }
      })
  });

  if (!response.ok) {
      throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.data.state.squares.map((square: { id: any; }) => square.id);
}
