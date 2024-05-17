
import { ethers } from 'ethers';
import { useAuth } from '../../context/auth.context'; // Adjust the import path to your AuthContext
import { blastRPC, getContractConfig } from './contractConfigs';
import { useMemo } from 'react';

const useStateContract = () => {
    const { userAddress } = useAuth(); // Assuming useAuth provides userAddress

    const provider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider(blastRPC);
      }, []);



    const contract = useMemo(() => {
        const config = getContractConfig("state");
        if (!config) {
            console.error('Marketplace contract configuration not found');
            return null;
        }
        return new ethers.Contract(config.address, config.abi, provider);
    }, [provider]); 

    const isApprovedForAll = async ( operator: any) => {
        try {
            console.log("Approved for: userAddress "+userAddress);
            let approved = await contract?.isApprovedForAll(userAddress, operator);
            console.log(approved);
            return await contract?.isApprovedForAll(userAddress, operator);
        } catch (error) {
            console.error(`Error checking if operator ${operator} is approved for all by ${userAddress}:`, error);
            return false;
        }
    };

    const getStateSquares = async (stateId: number) => {
        try {
            console.log(`Fetching squares for state ID: ${stateId}`);
            const squareIds = await contract?.getStateSquares(stateId);
            const squareIdsNumbers = squareIds.map((id: { toNumber: () => any; }) => id.toNumber()); // Convert each BigNumber to a number
            console.log(`Square IDs for state ${stateId}:`, squareIdsNumbers);
            return squareIdsNumbers;
        } catch (error) {
            console.error(`Error fetching squares for state ID ${stateId}:`, error);
            return [];
        }
    };

    return {
        isApprovedForAll,getStateSquares
    };
};

export default useStateContract;
