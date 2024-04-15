import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";
import { downloadImage } from "../helpers/image";
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
      let failures = [];  // To track and report failed transactions

      for (const transaction of transactions) {
          const { success, errorCode } = await downloadImage(transaction.updatedCID, env.squareblocksr2);
          if (!success) {
              // Log the failure along with the error code
              failures.push({ transactionId: transaction.id, tokenId: transaction.tokenId, errorCode });
              // Insert or update failed transactions in the database
              await env.squareblocksdb.prepare("INSERT INTO failedTransactions (transactionId, tokenId, updatedCID, errorCode) VALUES (?, ?, ?, ?) ON CONFLICT (transactionId) DO UPDATE SET tokenId = EXCLUDED.tokenId, updatedCID = EXCLUDED.updatedCID, errorCode = EXCLUDED.errorCode")
                  .bind(transaction.id, transaction.tokenId, transaction.updatedCID, errorCode)
                  .run();
          }
          lastProcessedTransaction = transaction.numericID;
      }

      if (transactions.length > 0) {
          await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(lastProcessedTransaction.toString()).run();
      }

      // Include failures in the response for visibility
      return json({ lastTransactionParsed, transactions, failures });
  } catch (err) {
      console.error("Error in processing:", err);
      return error(`Failed to process transactions: ${err.message}`, 500);
  }
};
