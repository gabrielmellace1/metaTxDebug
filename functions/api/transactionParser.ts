import { fetchFromGraph, getTransactionsQuery } from "../helpers/graph";
import { downloadImage } from "../helpers/image";
import { Env } from "../interfaces/Env";
import { GraphTransactionsResponse } from "../interfaces/graphTransactionsResponse";
import { error, json } from "../lib/response";

export const onRequest: PagesFunction<Env & { myBucket: R2Bucket }> = async ({ env }) => {
  try {
    const queryResult = await env.squareblocksdb.prepare("SELECT counter FROM counters WHERE counterName = 'lastTransactionParsed'").all();
    let lastTransactionParsed = queryResult.results.length > 0 ? parseInt(queryResult.results[0].counter as string) : 0;
    const query = getTransactionsQuery(lastTransactionParsed);
    const jsonResponse = await fetchFromGraph<GraphTransactionsResponse>(query);
    const transactions = jsonResponse.data.transactions;
    let lastProcessedTransaction = lastTransactionParsed;

    for (const transaction of transactions) {
      const success = await downloadImage(transaction.updatedCID, env.myBucket);
      if (!success) {
        await env.squareblocksdb.prepare("INSERT INTO failedTransactions (transactionId, tokenId, updatedCID) VALUES (?, ?, ?)")
          .bind(transaction.id, transaction.tokenId, transaction.updatedCID)
          .run();
      }
      lastProcessedTransaction = transaction.numericID;
    }

    if (transactions.length > 0) {
      await env.squareblocksdb.prepare("UPDATE counters SET counter = ? WHERE counterName = 'lastTransactionParsed'").bind(lastProcessedTransaction.toString()).run();
    }

    return json({ lastTransactionParsed, transactions });
  } catch (err) {
    return error(`Failed to process transactions: ${err.message}`, 500);
  }
};
