/// <reference types="@cloudflare/workers-types" />
import { error, json } from "../lib/response";

// Declare the expected response structure from The Graph API
interface GraphQLResponse {
  data: {
    transactions: Array<{
      id: string;
      tokenId: string;
      updatedCID: string;
      numericID: number;
    }>;
  };
}

export const onRequest: PagesFunction<any> = async () => {
  // Retrieve the last processed transaction ID
  let lastTransactionParsed = parseInt(await squareblocksdb.get("lastTransactionParsed")) || 0;

  // Construct the GraphQL query
  const query = JSON.stringify({
    query: `{
      transactions(first: 5, orderBy: numericID, orderDirection: asc, skip: ${lastTransactionParsed}) {
        id
        tokenId
        updatedCID
        numericID
      }
    }`
  });

  try {
    // Query the subgraph API
    const url = "https://api.studio.thegraph.com/proxy/48884/squareblocks/version/latest";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: query
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from The Graph: ${response.statusText}`);
    }

    const jsonResponse = await response.json() as GraphQLResponse;
    const transactions = jsonResponse.data.transactions;
    let maxNumericID = lastTransactionParsed;

    // Process transactions
    for (const transaction of transactions) {
      console.log(`TokenID: ${transaction.tokenId}, UpdatedCID: ${transaction.updatedCID}`);
      maxNumericID = Math.max(maxNumericID, transaction.numericID);
    }

    // Update the counter in KV
    await squareblocksdb.put("lastTransactionParsed", maxNumericID.toString());

    // Return the JSON response using the provided `json` function
    return json({ transactions });
  } catch (err) {
    console.error(err);
    // Use the provided `error` function to return an error response
    return error(`Failed to process transactions: ${err.message}`, 500);
  }
};
