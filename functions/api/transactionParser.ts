import { error, json } from "../lib/response";

export interface Env {
  squareblocksdb: D1Database;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  try {
    // Perform a SELECT query on the 'counters' table
    const result = await env.squareblocksdb.prepare("SELECT * FROM counters WHERE counterName = 'lastTransactionParsed'").all();

    // Return the entire result object in JSON format for inspection
    return json(result);
  } catch (err) {
    console.error("Error:", err);
    // Use the provided `error` function to return an error response
    return error(`Failed to retrieve data from the database: ${err.message}`, 500);
  }
};
