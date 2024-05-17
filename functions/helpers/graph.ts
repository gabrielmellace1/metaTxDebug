// File: src/helpers/graph.ts

import { Env } from "../lib/env";


// Function to construct the transaction query
export const getTransactionsQuery = (lastTransactionParsed: number): string => {
  return JSON.stringify({
    query: `{
      transactions(first: 5, orderBy: numericID, orderDirection: asc, skip: ${lastTransactionParsed}) {
        id,
        tokenId,
        updatedCID,
        numericID
      }
    }`
  });
};



// Assuming `context` is the way you access environment variables
export const fetchFromGraph = async <T>(query: string, context: { env: Env }, addaptJson: boolean = true): Promise<T> => {

  

  const response = await fetch(context.env.graphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: addaptJson? JSON.stringify({ query }) : query


  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from The Graph: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

