// File: src/types/Env.ts

import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  squareblocksdb: D1Database;
}
