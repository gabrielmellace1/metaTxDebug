import { error, json } from "../lib/response";


export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "DB" with the variable name you defined.
  squareblocksdb: D1Database;
}


export const onRequest: PagesFunction<{ squareblocksdb: D1Database }> = async ({ env }) => {
  try {
    // Perform a SELECT query on the 'counter' table
    const { results } = await env.squareblocksdb.prepare("SELECT * FROM counter").all();

    // Return the results as JSON
    return json(results);
  } catch (err) {
    // Handle any errors that occur during the query
    return error(`Failed to query the 'counter' table: ${err.message}`, 500);
  }
};
