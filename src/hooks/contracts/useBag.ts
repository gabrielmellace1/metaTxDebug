
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';

const useBAG = () => {
    const { userAddress } = useAuth(); // Assuming useAuth provides userAddress

    // Configure the provider directly within the hook
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");
    
    // Get contract configuration for "Bag"
    const bagConfig = getContractConfig("bag");
    if (!bagConfig) {
        console.error('Bag contract configuration not found');
        return;
    }

    // Function to get the token balance
    const getBalance = async () => {
        if (!provider || !userAddress) {
            console.error("Provider or user address not found");
            return;
        }

        const contract = new ethers.Contract(bagConfig.address, bagConfig.abi, provider);
        try {
            const balance = await contract.balanceOf(userAddress);
            return balance.toString();
        } catch (error) {
            console.error("Error getting balance:", error);
            return "0";
        }
    };

    // Function to get the allowance
    const getAllowance = async (spenderAddress: string) => {
        if (!provider || !userAddress) {
            console.error("Provider or user address not found");
            return;
        }

        const contract = new ethers.Contract(bagConfig.address, bagConfig.abi, provider);
        try {
            const allowance = await contract.allowance(userAddress, spenderAddress);
            return allowance.toString();
        } catch (error) {
            console.error("Error getting allowance:", error);
            return "0";
        }
    };

    return { getBalance, getAllowance };
};

export default useBAG;