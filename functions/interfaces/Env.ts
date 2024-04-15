import { D1Database, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  squareblocksdb: D1Database;
  squareblocksr2: R2Bucket;
}
