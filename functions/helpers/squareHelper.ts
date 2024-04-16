// squaresHelper.js
const GRID_WIDTH = 500;  // This is a regular number and should be fine

export function tokenIdToPosition(tokenId) {
    if (tokenId <= 0) {
        throw new Error("SquareNFT: Token ID must be greater than 0");
    }
    const adjustedId = BigInt(tokenId) - BigInt(1); // Convert tokenId to BigInt and adjust for 1-based indexing
    const x = Number(adjustedId % BigInt(GRID_WIDTH)); // Use BigInt for GRID_WIDTH and convert result to Number
    const y = Number(adjustedId / BigInt(GRID_WIDTH)); // Same as above
    return { x, y };
}
