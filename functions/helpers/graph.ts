// File: src/helpers/graph.ts

const apiUrl = "https://api.studio.thegraph.com/proxy/48884/squareblocks/version/latest";

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

// Generic function to fetch data from The Graph
export const fetchFromGraph = async <T>(query: string): Promise<T> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: query
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from The Graph: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
