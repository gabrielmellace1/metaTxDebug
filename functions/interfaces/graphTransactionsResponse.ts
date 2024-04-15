// File: src/types/graphTransactionsResponse.ts

export interface GraphTransactionsResponse {
    data: {
      transactions: Array<{
        id: string,
        tokenId: string,
        updatedCID: string,
        numericID: number
      }>;
    };
  }
  