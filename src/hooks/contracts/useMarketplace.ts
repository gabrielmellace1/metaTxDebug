
import { ethers } from 'ethers';
import { blastRPC, getContractConfig } from './contractConfigs';
import { useMemo } from 'react';

const useMarketplace = () => {
   

    const provider = useMemo(() => {
        return new ethers.providers.JsonRpcProvider(blastRPC);
      }, []);

      
    
      const contract = useMemo(() => {
        const config = getContractConfig("marketplace");
        if (!config) {
            console.error('Marketplace contract configuration not found');
            return null;
        }
        return new ethers.Contract(config.address, config.abi, provider);
    }, [provider]); 

    
    const getOrderActive = async (_nftAddress: any, _tokenId: any) => {
        try {
            return await contract?.getOrderActive(_nftAddress, _tokenId);
        } catch (error) {
            console.error("Error getting order active status:", error);
            return false;
        }
    };

    const areOrdersActive = async (nftAddress: any, tokenIds: any[]) => {
        try {
            return await contract?.areOrdersActive(nftAddress, tokenIds);
        } catch (error) {
            console.error("Error checking orders active status:", error);
            return false;
        }
    };

    return {
        getOrderActive,
        areOrdersActive
        
    };
};

export default useMarketplace;
