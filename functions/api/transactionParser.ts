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

// Include the environment type that specifies the D1 binding
export interface Env {
  squareblocksdb: D1Database;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  try {
    // Retrieve the last processed transaction ID from D1 database
    const result = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
    let lastTransactionParsed = result[0] ? parseInt(result[0].counter) : 5; 



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

    //await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(maxNumericID).run();

    // Return the JSON response using the provided `json` function
    return json({ lastTransactionParsed, transactions });
  } catch (err) {
    console.error(err);
    // Use the provided `error` function to return an error response
    return error(`Failed to process transactions: ${err.message}`, 500);
  }
};
