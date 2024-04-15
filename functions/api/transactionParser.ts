import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";
import { downloadImage } from "../helpers/image";
import { Env } from "../interfaces/Env";
import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { error, json } from "../lib/response";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  try {
    // Retrieve the last processed transaction ID from the D1 database
    const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
    let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;

    // Construct the GraphQL query using the helper function
    const query = getTransactionsQuery(lastTransactionParsed);

    // Fetch data from The Graph using the helper function
    const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query);
    const transactions = jsonResponse.data.transactions;
    let lastProcessedTransaction = lastTransactionParsed;
    let failures = [];

    // Process transactions and attempt to download images
    for (const transaction of transactions) {
      const downloadResult = await downloadImage(transaction.updatedCID, env.squareblocksr2);
      if (!downloadResult.success) {
        // Record the failure along with the error message
        failures.push({ transactionId: transaction.id, error: downloadResult.error });

        // Insert or update failed transactions in the database
        await env.squareblocksdb.prepare("INSERT INTO failedTransactions (transactionId, tokenId, updatedCID) VALUES (?, ?, ?) ON CONFLICT (transactionId) DO UPDATE SET tokenId = EXCLUDED.tokenId, updatedCID = EXCLUDED.updatedCID")
          .bind(transaction.id, transaction.tokenId, transaction.updatedCID)
          .run();
      }
      // Update the last processed transaction ID
      lastProcessedTransaction = transaction.numericID;
    }

    // Update the 'lastTransactionParsed' counter in the D1 database
    if (transactions.length > 0) {
      await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(lastProcessedTransaction.toString()).run();
    }

    // Return the JSON response including any failures
    return json({ lastTransactionParsed, transactions, failures });
  } catch (err) {
    console.error("Error in processing:", err);
    // Return an error response if something goes wrong
    return error(`Failed to process transactions: ${err.message}`, 500);
  }
};
