// src/web3auth.service.ts

import { web3Auth } from "../config/web3auth.config";


export const loginWithWeb3Auth = async () => {
  try {
    await web3Auth.connect();
    const provider = web3Auth.provider;
    // You now have an authenticated web3 provider to interact with the blockchain.
  } catch (error) {
    console.error("Web3Auth login error:", error);
  }
};
