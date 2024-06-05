import { fetchFromGraph } from "../helpers/graph";
import type { Env } from "../lib/env";
import { json } from '../lib/response'; // Import response utilities
import { AtlasTile } from '../interfaces/atlasTile'; // Assuming this interface is properly defined elsewhere
import { uploadToR2 } from '../lib/r2';

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
    
        const transformedTiles = transformSquaresData(batchResults, gridWidth);

        // // Update cache with new data and timestamp
        // await context.env.SquaresKV.put(CACHE_KEY, JSON.stringify({ data: transformedTiles, timestamp: new Date().getTime() }), { expirationTtl: CACHE_TTL });


         const wrappedData = { data: transformedTiles };

        // Upload wrapped data to Cloudflare R2
        const uploadResult = await uploadToR2(context.env.squareblocksr2, 'transformedTiles.json', JSON.stringify(wrappedData));
        console.log('Upload to R2 result:', uploadResult);

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
                    title
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
    const stateSquares = [];

    // Process each batch directly into the final structure
    batchResults.forEach(batch => {
        if (batch && batch.data) {
            Object.keys(batch.data).forEach(queryKey => {
                batch.data[queryKey]?.forEach(square => {
                    const tokenId = parseInt(square.tokenId);
                    const stateTokenId = square.isOnState ? parseInt(square.stateId.stateTokenId) : tokenId;
                    const x = parseInt(square.x);
                    const y = parseInt(square.y);
                    const coordinateKey = `${x},${y}`;

                    // Initialize tile
                    const newTile = {
                        x, y, tokenId: stateTokenId,
                        clickableURL: square.clickableURL,
                        title:square.title,
                        forSale: square.isOnState ? square.stateId.stateForSale : square.forSale,
                        price: parseInt(square.isOnState ? square.stateId.statePrice : square.price),
                        owner: square.isOnState ? square.stateId.stateOwner : square.owner,
                        isOnState: square.isOnState,
                        left: true,  // Assume true, adjust below if needed
                        top: true   // Assume true, adjust below if needed
                    };

                    transformedTiles[coordinateKey] = newTile;

                    // If on state, add to post-processing list
                    if (square.isOnState) {
                        stateSquares.push({ x, y, tokenId: stateTokenId, coordinateKey });
                    }
                });
            });
        }
    });

    // Adjust left and top properties for state squares
    stateSquares.forEach(({ x, y, tokenId, coordinateKey }) => {
        const leftKey = `${x-1},${y}`;  // Compute once and reuse
        const topKey = `${x},${y+1}`;   // Compute once and reuse
    
        if (x > 0 && transformedTiles[leftKey]?.tokenId === tokenId) {
            transformedTiles[coordinateKey].left = false;
        }
        if (y < gridWidth - 1 && transformedTiles[topKey]?.tokenId === tokenId) {
            transformedTiles[coordinateKey].top = false;
        }
    });
    

    return transformedTiles;
}










