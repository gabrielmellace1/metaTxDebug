
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';
import { useMemo } from 'react';

const useSquare = () => {
    const { userAddress } = useAuth(); // Assuming useAuth provides userAddress

    const provider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");
      }, []);


    const contract = useMemo(() => {
        const config = getContractConfig("square");
        if (!config) {
            console.error('Marketplace contract configuration not found');
            return null;
        }
        return new ethers.Contract(config.address, config.abi, provider);
    }, [provider]); 



    const isApprovedForAll = async ( operator: any) => {
        try {
            return await contract?.isApprovedForAll(userAddress, operator);
        } catch (error) {
            console.error(`Error checking if operator ${operator} is approved for all by ${userAddress}:`, error);
            return false;
        }
    };

    return {
        isApprovedForAll
    };
};

export default useSquare;
