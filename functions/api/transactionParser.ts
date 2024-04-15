import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";
import { downloadImage, uploadToR2 } from "../helpers/image";
import { Env } from "../interfaces/Env";
import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { error, json } from "../lib/response";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
    try {
        const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
        let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;
        const query = getTransactionsQuery(lastTransactionParsed);
        const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query);
        const transactions = jsonResponse.data.transactions;
        let lastProcessedTransaction = lastTransactionParsed;
        let failures = [];

        for (const transaction of transactions) {

          lastProcessedTransaction = transaction.numericID;
          
            const { success, blob, contentType, errorCode } = await downloadImage(transaction.updatedCID);
            if (!success) {
                failures.push({ transactionId: transaction.id, tokenId: transaction.tokenId, errorCode });
                await logFailure(transaction, errorCode, env);
                continue; // Skip upload if download fails
            }

            const uploadSuccess = await uploadToR2(transaction.updatedCID, blob, contentType, env.squareblocksr2);
            if (!uploadSuccess) {
                failures.push({ transactionId: transaction.id, tokenId: transaction.tokenId, errorCode: 6 }); // Use a specific error code for upload failure
                await logFailure(transaction, 6, env);
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
