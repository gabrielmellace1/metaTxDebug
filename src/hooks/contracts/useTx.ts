import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';

const blastChainId = "0x13E31"; // Correct hexadecimal representation for 81457
const blastRpcProvider = {
  chainId: blastChainId,
  chainName: "Blast",
  rpcUrls: ["https://blast-mainnet.infura.io/v3/cefd725b260046f1823aa5ba0c0537e6"],
  blockExplorerUrls: ["https://blastscan.io/"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

const useTx = () => {
  const { provider, userAddress } = useAuth();

  if (!provider || !userAddress) {
    console.warn("Provider or user address not found");
    return async () => { throw new Error("Provider or user address not found"); };
  }

  let ETHprovider = new ethers.providers.Web3Provider(provider);
  let ETHSigner = ETHprovider.getSigner();

  const switchToBlast = async () => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: blastChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [blastRpcProvider],
          });
        } catch (addError) {
          console.error("Failed to add the Blast network:", addError);
          throw addError;
        }
      } else {
        console.error("Failed to switch to the Blast network:", switchError);
        throw switchError;
      }
    }

    ETHprovider = new ethers.providers.Web3Provider(provider);
    ETHSigner = ETHprovider.getSigner();
    
  };

  const sendTx = async (configName: string, functionName: string, params: any[]) => {
    const config = getContractConfig(configName);
    if (!config) {
      console.error('Contract configuration not found for', configName);
      return;
    }

    try {
      const network = await ETHprovider.getNetwork();
      if (network.chainId !== parseInt(blastChainId, 16)) {
        await switchToBlast();
      }

      
      

      // Load contract
      const contract = new ethers.Contract(config.address, config.abi, ETHSigner);

     // Send transaction
     const txResponse = await contract[functionName](...params);
     console.log("Transaction response:", txResponse);

     return txResponse.hash; // Return the transaction hash immediately
    } catch (error) {
      console.error("Error processing the transaction:", error);
      throw error;
    }
  };

  return sendTx;
};

export default useTx;
