import { getSquaresQuery, fetchFromGraph } from "../helpers/graph";
import type { Env } from "../lib/env";

type AtlasTile = {
    x: number;
    y: number;
    tokenId: number;
    clickableURL?: string;
    forSale: boolean;
    price?: number;
    owner: string;
    isOnState: boolean;
};

export async function onRequest(context: { env: Env }) {
    const query = getSquaresQuery();

    try {
        const data = await fetchFromGraph<{ data: { squares: any[] } }>(query, context);

        const squares = data.data.squares;
        const transformedTiles: AtlasTile[] = squares.map(square => {
            if (square.isOnState) {
                return {
                    x: parseInt(square.x),
                    y: parseInt(square.y),
                    tokenId: parseInt(square.stateId.stateTokenId),
                    clickableURL: square.clickableURL || null, // Handle null URLs
                    forSale: square.stateId.stateForSale,
                    price: parseInt(square.stateId.statePrice),
                    owner: square.stateId.stateOwner,
                    isOnState: square.isOnState
                };
            } else {
                return {
                    x: parseInt(square.x),
                    y: parseInt(square.y),
                    tokenId: parseInt(square.tokenId),
                    clickableURL: square.clickableURL || null,
                    forSale: square.forSale,
                    price: parseInt(square.price),
                    owner: square.owner,
                    isOnState: square.isOnState
                };
            }
        });

        return new Response(JSON.stringify({ data: transformedTiles }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allows all domains
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify methods
                "Access-Control-Allow-Headers": "Content-Type" // Specify headers
              }
        });
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allows all domains
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify methods
                "Access-Control-Allow-Headers": "Content-Type" // Specify headers
              }
        });
    }
}
