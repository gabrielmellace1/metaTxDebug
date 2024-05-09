
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';
import { useMemo } from 'react';

const useBAG = () => {
    const { userAddress } = useAuth(); // Assuming useAuth provides userAddress

    // Configure the provider directly within the hook
    const provider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");
      }, []);
    

      const contract = useMemo(() => {
        const config = getContractConfig("bag");
        if (!config) {
            console.error('Marketplace contract configuration not found');
            return null;
        }
        return new ethers.Contract(config.address, config.abi, provider);
    }, [provider]); 



    

    // Function to get the token balance
    const getBalance = async () => {
        if (!provider || !userAddress) {
            console.error("Provider or user address not found");
            return;
        }

        
        try {
            const balance = await contract?.balanceOf(userAddress);
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

        
        try {
            const allowance = await contract?.allowance(userAddress, spenderAddress);
            return allowance.toString();
        } catch (error) {
            console.error("Error getting allowance:", error);
            return "0";
        }
    };

    return { getBalance, getAllowance };
};

export default useBAG;
