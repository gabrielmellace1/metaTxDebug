import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context';
import { getContractConfig } from './contractConfigs';

const blastChainId = "0x13E31";

const useTx = () => {
  const { signer, switchNetworks, getUpdatedSigner } = useAuth();

  if (!signer) {
    console.warn("Signer not found");
    return async () => { throw new Error("Signer not found"); };
  }

  const sendTx = async (configName: string, functionName: string, params: any[]) => {
    const config = getContractConfig(configName);
    if (!config) {
      console.error('Contract configuration not found for', configName);
      return;
    }

    try {
      let currentSigner = signer;
      const network = await currentSigner.provider!.getNetwork();
      if (network.chainId !== parseInt(blastChainId, 16)) {
        await switchNetworks("blast");
        const updatedSigner = await getUpdatedSigner();
        if (!updatedSigner) throw new Error("Failed to get updated signer");
        currentSigner = updatedSigner;
      }

      // Load contract
      const contract = new ethers.Contract(config.address, config.abi, currentSigner);

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
