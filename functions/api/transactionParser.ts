import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";

import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";



export const onRequest: PagesFunction<Env> = async ({ env }) => {

   
    try {
        const pixelServiceUrl = env.PIXEL_SERVICE_URL;
        const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
        let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;
       
        const query = getTransactionsQuery(lastTransactionParsed);
        
        
        const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query,{ env },false);
      

        const transactions = jsonResponse.data.transactions;
      

        const cidList = transactions.map(tx => tx.updatedCID);
        const tokenIdList = transactions.map(tx => tx.tokenId);

        try {
            const response = await fetch('https://ipfs.squares.town/pixelService/process-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cidList, tokenIdList })
            });

            const processResponse = await response.json();

            const lastProcessedTransaction = transactions.reduce((max, transaction) => {
                const numericID = transaction.numericID;
                return numericID > max ? numericID : max;
            }, lastTransactionParsed);


            if (transactions.length > 0) {
                await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(lastProcessedTransaction.toString()).run();
            }

            return json({ processResponse });

        } catch (err) {
            console.error("Error in processing:", err);
            return error(`Failed to process transactions: ${err.message}`, 500);
        }

    } catch (err) {
        console.error("Error in processing:", err);
        return error(`Failed to process transactions: ${err.message}`, 500);
    }
};

async function logFailure(transaction, errorCode, env) {
    await env.squareblocksdb.prepare("INSERT INTO failedTransactions (transactionId, tokenId, updatedCID, errorCode) VALUES (?, ?, ?, ?) ON CONFLICT (transactionId) DO UPDATE SET tokenId = EXCLUDED.tokenId, updatedCID = EXCLUDED.updatedCID, errorCode = EXCLUDED.errorCode")
        .bind(transaction.id, transaction.tokenId, transaction.updatedCID, errorCode)
        .run();
}
