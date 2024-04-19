// src/helpers/GridHelper.ts



export const switchColor = (
    isOnState: boolean,
    forSale: boolean,
    owner: string,
    userAccount: string | null | undefined
  ): number => {
    if (isOnState) {
      if (forSale) {
        return userAccount && userAccount === owner ? 3 : 7;
      } else {
        return userAccount && userAccount === owner ? 2 : 6;
      }
    } else {
      if (forSale) {
        return userAccount && userAccount === owner ? 1 : 5;
      } else {
        return userAccount && userAccount === owner ? 0 : 4;
      }
    }
  };
  






// export async function loadTiles() {
//   const response = await fetch(`https://squares.town/api/graphSquares`);
//   if (!response.ok) {
//     throw new Error(`Network response was not ok, status: ${response.status}`);
//   }
//   const data = await response.json();
//   return data.data as Record<string, AtlasTile>;
// }

  export const COLOR_BY_TYPE: Record<number, string> = Object.freeze({
    0: '#5054d4', // my parcels 1
    1: '#ff4053', // my parcels on sale 1
    2: '#4043a9', // my estates 1
    3: '#cc3342', // my estates on sale 1
    4: '#716c7a', // Other parcels 1
    5: '#ff4053', // Other parcels on sale 1
    6: '#434049', // others states 1
    7: '#cc3342', // other states on sale
    8: '#18141a', // background
    9: '#110e13', // loading odd
  
    //erase
    10: '#3D3A46', // parcels on sale (we show them as owned parcels)
    11: '#09080A', // unowned pacel/estate
    12: '#18141a', // background
    13: '#110e13', // loading odd
    14: '#0d0b0e' // loading even
  })