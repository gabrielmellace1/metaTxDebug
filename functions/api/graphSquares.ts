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
        // Try to get cached data
        let cachedData = await context.env.SquaresKV.get<CacheData>(CACHE_KEY, "json");
        if (cachedData && new Date().getTime() - cachedData.timestamp < CACHE_TTL * 1000) {
            return json({ data: cachedData.data });  // Always wrap in { data: ... } for consistency
        }

        // Data needs refresh
        const queriesPerBatch = 125;
        const totalTokens = 250000;
        const batchSize = 1000;
        const gridWidth = 500;

        const batchResults = await fetchAllBatches(totalTokens, queriesPerBatch, batchSize, context);
        const transformedTiles = transformSquaresData(batchResults, gridWidth);

        // Update cache with new data and timestamp
        await context.env.SquaresKV.put(CACHE_KEY, JSON.stringify({ data: transformedTiles, timestamp: new Date().getTime() }), { expirationTtl: CACHE_TTL });

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
    batchResults.forEach((result, batchIndex) => {
        if (!result.data) {
           // console.log("No 'data' key found in result:", result);
            return;  // Skip this iteration if data key is missing
        }

        Object.entries(result.data).forEach(([key, squares]) => {
            if (!Array.isArray(squares) || squares.length === 0) {
               // console.log(`No data for ${key}`);
                return;  // Skip processing if no squares are returned
            }

            squares.forEach((square, index) => {
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

                const key = `${square.x},${square.y}`;
                transformedTiles[key] = {
                    x: parseInt(square.x),
                    y: parseInt(square.y),
                    tokenId,
                    clickableURL: square.clickableURL,
                    forSale: square.forSale,
                    price: parseInt(square.price),
                    owner: square.owner,
                    isOnState,
                    left,
                    top
                };
            });
        });
    });
    return transformedTiles;
}
