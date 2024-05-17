 export type AtlasTile = {
     x: number;
     y: number;
     tokenId: number;
    clickableURL?: string;
    title?:string;
     forSale: boolean;
     price?: number;
     owner: string;
    isOnState: boolean;
    top: boolean;
    left: boolean;
 };


 export type AtlasToken = {
    tokenId: number;
    forSale: boolean;
    price?: number | null;
    owner: string;
  };