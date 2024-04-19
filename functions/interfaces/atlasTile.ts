export type AtlasTile = {
    x: number;
    y: number;
    tokenId: number;
    clickableURL?: string;
    forSale: boolean;
    price?: number;
    owner: string;
    isOnState: boolean;
    left: boolean;
    top: boolean;
};