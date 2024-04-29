import { createContext, useContext, useState, useEffect } from "react";
import { DGMarketplaceInstance } from "dg-marketplace-sdk";
import { useAuth } from "./auth.context";

DGMarketplaceInstance.init({
  contractAddress: "0x63eBcB9c8e9A40dBA33676CAF0A9837Efa17CB56",
  theGraphUrl:
    "https://api.studio.thegraph.com/query/48884/dglivemarketplacedev/version",
  apiUrl: "https://api.dglive.org/v1",
  gasServerUrl: "https://meta-tx-server.dglive.org/v1/transactions",
  iceAddress: "0x73b29199a8e4c146e893eb95f18dac41738a88c6",
  polygonRpcProvider:
    "https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c",
});

interface MarketplaceContextInterface {
  approveIce: () => Promise<any>;
  userAllowance: number;
  userBalance: number;
  DGMarketplace: any;
  fetchUserBalance: (shouldApprove: boolean) => Promise<boolean>;
  getUserBalanceAndAllowance: () => Promise<{ balance: number; allowance: number }>;
  fetchTransactionStatus: (txHash: string, setInfoModalHeader: Function, setInfoModalBody: Function) => Promise<any>;
  buyNFT:(userAddress:string,tokenAddress:string,tokenId:string,price:string) =>Promise<any>;
}

const MarketplaceContext = createContext<MarketplaceContextInterface>({
  approveIce: () => Promise.resolve([]),
  userAllowance: 0,
  userBalance: 0,
  DGMarketplace: null,
  fetchUserBalance: () => Promise.resolve(false),
  getUserBalanceAndAllowance: () => Promise.resolve({ balance: 0, allowance: 0 }),
  fetchTransactionStatus: (txHash: string, setInfoModalHeader: Function, setInfoModalBody: Function) => Promise.resolve(null),
  buyNFT:(userAddress:string,tokenAddress:string,tokenId:string,price:string) => Promise.resolve(null),
});

const createNotification = (title: string, message: string) => {
  return window.alert(`${title}: ${message}`);
};

export const useMarketplace = () => useContext(MarketplaceContext);

export const MarketplaceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { provider, userAddress } = useAuth();
  const [userAllowance, setUserAllowance] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    if (provider && userAddress) {
      DGMarketplaceInstance.initProvider(provider, "web3auth");
      DGMarketplaceInstance.getContract(userAddress);
    }
  }, [provider, userAddress]);

  const approveIce = async (): Promise<string> => {
    try {
      if (!userAddress) {
        throw new Error("User address not found");
      }
      const status = await DGMarketplaceInstance.approveContractIce(
        userAddress
      );
      return status.txHash;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchUserBalance = async (shouldApprove: boolean): Promise<boolean> => {
    if (!userAddress) return false;
    debugger;
    const { balance, allowance } = await DGMarketplaceInstance.getIceAllowance(
      userAddress
    );

    setUserBalance(balance);
    //if (allowance < 100 && shouldApprove) {
    if (shouldApprove) {
      try {
        const txHash = await approveIce();
        if (txHash) {
          createNotification(
            "Please wait",
            `Transaction hash: ${txHash}. </br> Please wait until we confirm the transaction...`
          );

          const transactionStatus =
            await DGMarketplaceInstance.getTransactionStatus(txHash);

          if (transactionStatus?.status) {
            createNotification("Success", "BAG approved successfully!.");
          } else {
            createNotification(
              "Error",
              `Sorry, there was an error processing your request. Please try again later. Transaction hash: ${txHash}  </br> Error code 015`
            );
          }
        }
        setUserAllowance(99999);
      } catch (error: any) {
        let errorMessage =
          "There was an error while approving BAG. Please try again later.";
        if (error?.message) errorMessage = error?.message;
        createNotification("Error", errorMessage);
        return false;
      }
    } else {
      setUserAllowance(allowance);

      return true;
    }
    return false;
  };

  const getUserBalanceAndAllowance = async (): Promise<{ balance: number; allowance: number }> => {
    if (!userAddress) return { balance: 0, allowance: 0 };

    const { balance, allowance } = await DGMarketplaceInstance.getIceAllowance(userAddress);
    return { balance, allowance };
  };

  const fetchTransactionStatus = async (txHash: string, setInfoModalHeader: Function,
     setInfoModalBody: Function) => {
    try {
      // Implement your logic to fetch transaction status using DGMarketplaceInstance (or another provider)
      // ...
      setInfoModalHeader("Processing status"); // Update modal header while fetching
      setInfoModalBody("Please wait, waiting for transaction: "+txHash);
  
      const status = await DGMarketplaceInstance.getTransactionStatus(txHash); // Replace with your implementation
      
      
      return status; // Return the retrieved transaction status object
    } catch (error) {
      console.error("Error fetching transaction status:", error);
      setInfoModalHeader("Transaction Status Unknown");
      setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
      throw error; // Re-throw the error for handling in BuyModal.tsx
    } finally {
      // Consider resetting modal info after a certain time if status retrieval takes too long
    }
  };

  const buyNFT =  async (userAddress: string, tokenAddress: string, tokenId: string, price: string) => {
    try {
      if (!userAddress) {
        throw new Error("User address not found");
      }

      const txHash = await DGMarketplaceInstance.buyItem(userAddress, tokenAddress, tokenId, price);
      console.log(txHash);
      return txHash;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error for handling in BuyModal.tsx
    }
  }

  return (
    <MarketplaceContext.Provider
      value={{
        approveIce,
        userBalance,
        userAllowance,
        DGMarketplace: DGMarketplaceInstance,
        fetchUserBalance,
        getUserBalanceAndAllowance,
        fetchTransactionStatus,
        buyNFT
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
