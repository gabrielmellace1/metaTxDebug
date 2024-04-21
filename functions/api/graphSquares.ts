import { fetchFromGraph } from "../helpers/graph";
import type { Env } from "../lib/env";
import { json } from '../lib/response'; // Import response utilities
import { AtlasTile } from '../interfaces/atlasTile'; // Assuming this interface is properly defined elsewhere

interface CacheData {
    data: Record<string, AtlasTile>;  // Assuming AtlasTile is your data structure
    timestamp: number;
}

const CACHE_KEY = "squaresInfo";
const CACHE_TTL = 300; // Time to live: 300 seconds (5 minutes)


export async function onRequest(context: { env: Env }) {
    try {
        // // Try to get cached data
        // let cachedData = await context.env.SquaresKV.get<CacheData>(CACHE_KEY, "json");
        // if (cachedData && new Date().getTime() - cachedData.timestamp < CACHE_TTL * 1000) {
        //     return json({ data: cachedData.data });  // Always wrap in { data: ... } for consistency
        // }

        // Data needs refresh
        const queriesPerBatch = 125;
        const totalTokens = 250000;
        const batchSize = 1000;
        const gridWidth = 500;

        const batchResults = await fetchAllBatches(totalTokens, queriesPerBatch, batchSize, context);
        console.log(batchResults);
        const transformedTiles = transformSquaresData(batchResults, gridWidth);

        // // Update cache with new data and timestamp
        // await context.env.SquaresKV.put(CACHE_KEY, JSON.stringify({ data: transformedTiles, timestamp: new Date().getTime() }), { expirationTtl: CACHE_TTL });

        return json({ data: transformedTiles }); // Ensure the returned data is wrapped in { data: ... } as well
    } catch (error) {
        console.error("Failed to fetch or process batches:", error);
        return error('Internal server error: ' + (error.message || error), 500);
    }
}



async function fetchAllBatches(totalTokens: number, queriesPerBatch: number, batchSize: number, context: { env: Env }) {
    let allBatchPromises = [];

    for (let i = 0; i < totalTokens; i += (queriesPerBatch * batchSize)) {
        let batchQuery = "{\n";
        for (let j = 0; j < queriesPerBatch; j++) {
            let startId = i + j * batchSize + 1;
            if (startId > totalTokens) continue;
            batchQuery += `
                batch_${Math.floor(i / (queriesPerBatch * batchSize))}_query_${j}: squares(first: ${batchSize}, where: {tokenId_gte: ${startId}}, orderDirection: asc, orderBy: tokenId) {
                    tokenId
                    x
                    y
                    clickableURL
                    forSale
                    price
                    owner
                    isOnState
                    stateId {
                      stateForSale: forSale
                      stateOwner: owner
                      statePrice: price
                      stateTokenId: tokenId
                    }
                }
            `;
        }
        batchQuery += "\n}";
        if (batchQuery.trim() === "{}") continue;
        allBatchPromises.push(fetchFromGraph<{ data: { [key: string]: any[] } }>(batchQuery, context));
    }


    return await Promise.all(allBatchPromises);
}






// Transform function utilizing AtlasTile
function transformSquaresData(batchResults: any[], gridWidth: number): Record<string, AtlasTile> {
    const transformedTiles: Record<string, AtlasTile> = {};
    const squaresMap = new Map<number, AtlasTile>();

    // Flatten all batch results into a single array of squares
    const allSquares = [];
    batchResults.forEach(batch => {
        if (batch && batch.data) {
            Object.keys(batch.data).forEach(queryKey => {
                if (Array.isArray(batch.data[queryKey])) {
                    batch.data[queryKey].forEach(square => allSquares.push(square));
                }
            });
        }
    });

    // Populate the map with initial square data using original tokenId for indexing
    allSquares.forEach(square => {
        const tokenId = parseInt(square.tokenId);  // Always use the actual square tokenId for grid calculations
        squaresMap.set(tokenId, {
            x: parseInt(square.x),
            y: parseInt(square.y),
            tokenId: square.isOnState ? parseInt(square.stateId.stateTokenId) : tokenId,  // Display stateTokenId if applicable
            clickableURL: square.clickableURL,
            forSale: square.isOnState ? square.stateId.stateForSale : square.forSale,
            price: parseInt(square.isOnState ? square.stateId.statePrice : square.price),
            owner: square.isOnState ? square.stateId.stateOwner : square.owner,
            isOnState: square.isOnState,
            left: true,  // Initially assume true, adjust later
            top: true   // Initially assume true, adjust later
        });
    });

    // Adjust left and top properties based on neighboring squares using original tokenId
    squaresMap.forEach((square, tokenId) => {
        
        // Adjusting the left property
        if ((tokenId - 1) % gridWidth !== 0) { // Not the first column
         
            const leftNeighbor = squaresMap.get(tokenId - 1);
            if (leftNeighbor && leftNeighbor.tokenId === square.tokenId) {  // Use the displayed tokenId for checking
                square.left = false;
            }
        }

        // Adjusting the top property
        if (tokenId < (gridWidth-1)*gridWidth) { // Not the first row
            const topNeighbor = squaresMap.get(tokenId + gridWidth);
            if (topNeighbor && topNeighbor.tokenId === square.tokenId) {  // Use the displayed tokenId for checking
                square.top = false;
            }
        }
    });

    squaresMap.forEach((value, key) => {
        const coordinateKey = `${value.x},${value.y}`;  // Create a string key from the x and y properties
        transformedTiles[coordinateKey] = value;
    });

    return transformedTiles;
}



// Helper function to convert tokenId to grid position
function tokenIdToPosition(tokenId, gridWidth) {
    return {
        x: (tokenId - 1) % gridWidth,
        y: Math.floor((tokenId - 1) / gridWidth)
    };
}



