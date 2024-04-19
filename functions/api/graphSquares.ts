import { getSquaresQuery, fetchFromGraph } from "../helpers/graph";
import type { Env } from "../lib/env";
import { json, error } from '../lib/response'; // Import response utilities
import { AtlasTile } from '../interfaces/atlasTile';


export async function onRequest(context: { env: Env }) {
    const query = getSquaresQuery();

    try {
        const data = await fetchFromGraph<{ data: { squares: any[] } }>(query, context);
        const squares = data.data.squares;
        const gridWidth = 500; // Define grid width

        const transformedTiles: AtlasTile[] = squares.map((square, index) => {
            const isOnState = square.isOnState;
            const tokenId = isOnState ? parseInt(square.stateId.stateTokenId) : parseInt(square.tokenId);

            let left = true;
            let top = true;

            if (isOnState) {
                // Check square to the left if not on the first column
                if (index % gridWidth !== 0) {
                    const leftSquare = squares[index - 1];
                    if (leftSquare && leftSquare.isOnState && parseInt(leftSquare.tokenId) === tokenId) {
                        left = false;
                    }
                }

                // Check square to the top if not on the first row
                if (index >= gridWidth) {
                    const topSquare = squares[index - gridWidth];
                    if (topSquare && topSquare.isOnState && parseInt(topSquare.tokenId) === tokenId) {
                        top = false;
                    }
                }
            }

            return {
                x: parseInt(square.x),
                y: parseInt(square.y),
                tokenId,
                clickableURL: square.clickableURL || null,
                forSale: isOnState ? square.stateId.stateForSale : square.forSale,
                price: isOnState ? parseInt(square.stateId.statePrice) : parseInt(square.price),
                owner: isOnState ? square.stateId.stateOwner : square.owner,
                isOnState,
                left,
                top
            };
        });

        return json({ data: transformedTiles });
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        return error('Internal server error: ' + error.message, 500);
    }
}
