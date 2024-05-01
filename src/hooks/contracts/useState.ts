
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { getContractConfig } from './contractConfigs';

const useStateContract = () => {
    const { userAddress } = useAuth(); // Assuming useAuth provides userAddress

    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");

    const stateConfig = getContractConfig("state");
    if (!stateConfig) {
        console.error('State contract configuration not found');
        return;
    }

    const contract = new ethers.Contract(stateConfig.address, stateConfig.abi, provider);

    const isApprovedForAll = async ( operator: any) => {
        try {
            console.log("Approved for: userAddress "+userAddress);
            let approved = await contract.isApprovedForAll(userAddress, operator);
            console.log(approved);
            return await contract.isApprovedForAll(userAddress, operator);
        } catch (error) {
            console.error(`Error checking if operator ${operator} is approved for all by ${userAddress}:`, error);
            return false;
        }
    };

    return {
        isApprovedForAll
    };
};

export default useStateContract;
