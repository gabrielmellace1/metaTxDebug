import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";
import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
    const debugLogs: any[] = [];

    try {
        const pixelServiceUrl = env.PIXEL_SERVICE_URL;
        debugLogs.push({ step: "Fetching lastTransactionParsed", details: "Executing SELECT query" });
        const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
        let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;
        debugLogs.push({ step: "Fetched lastTransactionParsed", lastTransactionParsed });

        const query = getTransactionsQuery(lastTransactionParsed);
        debugLogs.push({ step: "Fetching transactions from graph", query });

        const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query, { env }, false);
        debugLogs.push({ step: "Fetched transactions", jsonResponse });

        const transactions = jsonResponse.data.transactions;
        transactions.sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
        debugLogs.push({ step: "Sorted transactions", transactions });

        const cidList = transactions.map(tx => tx.updatedCID);
        const tokenIdList = transactions.map(tx => tx.tokenId);
        debugLogs.push({ step: "Mapped cidList and tokenIdList", cidList, tokenIdList });

        if (transactions.length > 0) {
            try {
                debugLogs.push({ step: "Sending request to process images", url: `${pixelServiceUrl}/process-images`, body: { cidList, tokenIdList } });
                const response = await fetch(`${pixelServiceUrl}/process-images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cidList, tokenIdList })
                });

                const processResponse = await response.json();
                debugLogs.push({ step: "Received process response", processResponse });

                const lastProcessedTransaction = transactions.reduce((max, transaction) => {
                    const numericID = transaction.numericID;
                    return numericID > max ? numericID : max;
                }, lastTransactionParsed);

                debugLogs.push({ step: "Updating lastTransactionParsed", lastProcessedTransaction });

                await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'")
                    .bind(lastProcessedTransaction.toString())
                    .run();

                debugLogs.push({ step: "Update successful" });

                return json({ success: true, processResponse, debugLogs });

            } catch (err) {
                debugLogs.push({ step: "Error in processing transactions", error: err.message });
                return error(`Failed to process transactions: ${err.message}`, 500);
            }
        } else {
            debugLogs.push({ step: "No transactions to process" });
            return json({ message: 'No transactions to process', debugLogs });
        }

    } catch (err) {
        debugLogs.push({ step: "Error in main try-catch", error: err.message });
        return error(`Failed to process transactions: ${err.message}`, 500);
    }
};

async function logFailure(transaction, errorCode, env) {
    await env.squareblocksdb.prepare("INSERT INTO failedTransactions (transactionId, tokenId, updatedCID, errorCode) VALUES (?, ?, ?, ?) ON CONFLICT (transactionId) DO UPDATE SET tokenId = EXCLUDED.tokenId, updatedCID = EXCLUDED.updatedCID, errorCode = EXCLUDED.errorCode")
        .bind(transaction.id, transaction.tokenId, transaction.updatedCID, errorCode)
        .run();
}
