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






function transformSquaresData(batchResults: any[], gridWidth: number): Record<string, AtlasTile> {
    const transformedTiles: Record<string, AtlasTile> = {};

    // Directly populate the map from batch data, eliminating the allSquares array
    const squaresMap = new Map<number, AtlasTile>();
    batchResults.forEach(batch => {
        if (batch && batch.data) {
            Object.keys(batch.data).forEach(queryKey => {
                if (Array.isArray(batch.data[queryKey])) {
                    batch.data[queryKey].forEach(square => {
                        const tokenId = parseInt(square.tokenId);
                        const stateTokenId = square.isOnState ? parseInt(square.stateId.stateTokenId) : tokenId;
                        squaresMap.set(tokenId, {
                            x: parseInt(square.x),
                            y: parseInt(square.y),
                            tokenId: stateTokenId,
                            clickableURL: square.clickableURL,
                            forSale: square.isOnState ? square.stateId.stateForSale : square.forSale,
                            price: parseInt(square.isOnState ? square.stateId.statePrice : square.price),
                            owner: square.isOnState ? square.stateId.stateOwner : square.owner,
                            isOnState: square.isOnState,
                            left: true,  // Set later
                            top: true   // Set later
                        });
                    });
                }
            });
        }
    });

    // Single pass to adjust left and top properties
    squaresMap.forEach((square, tokenId) => {
        const column = tokenId % gridWidth;
        const row = Math.floor(tokenId / gridWidth);
        if (column > 0) {  // More efficient than modulo operation each time
            const leftNeighbor = squaresMap.get(tokenId - 1);
            if (leftNeighbor && leftNeighbor.tokenId === square.tokenId) {
                square.left = false;
            }
        }
        if (row > 0) {
            const topNeighbor = squaresMap.get(tokenId - gridWidth);
            if (topNeighbor && topNeighbor.tokenId === square.tokenId) {
                square.top = false;
            }
        }
    });

    // Convert the map to the final output using "x,y" as the key
    squaresMap.forEach((value, key) => {
        transformedTiles[`${value.x},${value.y}`] = value;
    });

    return transformedTiles;
}








