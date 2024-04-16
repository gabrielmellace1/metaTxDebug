import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";

import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { ProcessImageResponse } from "../interfaces/processImageResponse";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";



export const onRequest: PagesFunction<Env> = async ({ env }) => {

   
    try {
        const pixelServiceUrl = env.PIXEL_SERVICE_URL;
        const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
        let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;
        const query = getTransactionsQuery(lastTransactionParsed);
        const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query,{ env });
        const transactions = jsonResponse.data.transactions;
        let lastProcessedTransaction = lastTransactionParsed;
        let failures = [];

        for (const transaction of transactions) {
            lastProcessedTransaction = transaction.numericID;

            const response = await fetch(`${pixelServiceUrl}/api/processImage?cid=${transaction.updatedCID}&tokenId=${transaction.tokenId}`);
            const processResponse = (await response.json()) as ProcessImageResponse;


            if (!processResponse.success) {
                failures.push({ transactionId: transaction.id, tokenId: transaction.tokenId, errorCode: processResponse.errorCode });
                await logFailure(transaction, processResponse.errorCode || 500, env); // Default error code if undefined
                continue; // Skip remaining logic if processing fails
            }
        }

        if (transactions.length > 0) {
            await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(lastProcessedTransaction.toString()).run();
        }

        return json({ lastTransactionParsed, transactions, failures });
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
