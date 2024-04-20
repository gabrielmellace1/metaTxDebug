import { ethers } from 'ethers';

let account: string = "";

export const getAccount = async () => {
  if (!account && window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      account = accounts[0]; // Store the fetched account
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  }
  return account;
}

export const setAccount = (newAccount: string) => {
  account = newAccount;
}
