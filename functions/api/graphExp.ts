import { fetchFromGraph } from "../helpers/graph";
import type { Env } from "../lib/env";
import { json, error } from '../lib/response'; // Import response utilities
import { AtlasTile } from '../interfaces/atlasTile'; // Assuming this interface is properly defined elsewhere

export async function onRequest(context: { env: Env }) {
    const queriesPerBatch = 125;  // Number of queries per request
    const totalTokens = 250000;  // Total number of tokens
    const batchSize = 1000;  // Each query fetches 1,000 items
    let allBatchPromises = [];

    // Construct the queries in batches
    for (let i = 0; i < totalTokens; i += (queriesPerBatch * batchSize)) {
        let batchQuery = "{\n";
        for (let j = 0; j < queriesPerBatch; j++) {
            let startId = i + j * batchSize + 1;
            if (startId > totalTokens) continue;  // Skip if startId exceeds total tokens

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
        allBatchPromises.push(fetchFromGraph<{ data: { [key: string]: any[] } }>(batchQuery, context));  // Store promise without awaiting
    }

    try {
        // Wait for all batch requests to complete in parallel
        const batchResults = await Promise.all(allBatchPromises);
        const transformedTiles: Record<string, AtlasTile> = {};

        // Process each batch result
        batchResults.forEach((result, batchIndex) => {
            if (!result.data) {
                console.log("No 'data' key found in result:", result);
                return;  // Skip this iteration if data key is missing
            }

            Object.entries(result.data).forEach(([key, squares]) => {
                if (!Array.isArray(squares) || squares.length === 0) {
                    console.log(`No data for ${key}`);
                    return;  // Skip processing if no squares are returned
                }

                const gridWidth = 500; // Define grid width
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

        return json({ data: transformedTiles });
    } catch (error) {
        console.error("Failed to fetch or process batches:", error);
        return error('Internal server error: ' + (error.message || error), 500);
    }
}
