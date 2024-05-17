import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';


const useTx = () => {
    const { provider, userAddress } = useAuth();

    if (!provider || !userAddress) {
        console.warn("Provider or user address not found");
        return async () => { throw new Error("Provider or user address not found"); };
    }
    
    const ETHprovider = new ethers.providers.Web3Provider(provider);
    const ETHSigner = ETHprovider.getSigner();

    const sendTx = async (configName: string, functionName: string, params: any[]) => {
        const config = getContractConfig(configName);
        if (!config) {
            console.error('Contract configuration not found for', configName);
            return;
        }

        try {
            // Load contract
            const contract = new ethers.Contract(config.address, config.abi, ETHSigner);

            // Send transaction
            const txResponse = await contract[functionName](...params);
            const txReceipt = await txResponse.wait();
            console.log("Transaction receipt:", txReceipt);

            return txReceipt.transactionHash;
        } catch (error) {
            console.error("Error processing the transaction:", error);
            throw error;
        }
    };

    return sendTx;
};

export default useTx;
