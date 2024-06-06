import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context';
import { getContractConfig } from './contractConfigs';

const blastChainId = "0x13E31";

const useTx = () => {
  const { signer, getUpdatedSigner,provider } = useAuth();

  if (!signer) {
    console.warn("Signer not found");
    return async () => { throw new Error("Signer not found"); };
  }

  const sendTx = async (configName: string, functionName: string, params: any[]) => {

    await provider?.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: blastChainId,
        },
      ],
    });

    const config = getContractConfig(configName);
    if (!config) {
      console.error('Contract configuration not found for', configName);
      return;
    }

    try {
      console.log("Getting updated signer...");
      let currentSigner = await getUpdatedSigner();
      if (!currentSigner) throw new Error("Failed to get updated signer");


        

      // Load contract
      const contract = new ethers.Contract(config.address, config.abi, currentSigner);

      console.log("Estimating gas...");
      const gasEstimate = await contract.estimateGas[functionName](...params);
      console.log(`Estimated gas for ${functionName}:`, gasEstimate.toString());

      // Send transaction
      console.log("Sending transaction...");
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
