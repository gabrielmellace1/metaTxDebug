import { D1Database, R2Bucket } from '@cloudflare/workers-types';

export interface Env {
  squareblocksdb: D1Database;
  squareblocksr2: R2Bucket;
  rpcUrl: string;
  stateContractAddress: string;
  squaresContractAddress: string;
  baseUrl: string;
  STATE_CONTRACT_ABI: string; // Add this line
  projectName: string;
  graphUrl: string;

}
