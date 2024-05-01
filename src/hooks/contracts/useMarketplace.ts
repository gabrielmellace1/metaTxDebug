
import { ethers } from 'ethers';
import { getContractConfig } from './contractConfigs';

const useMarketplace = () => {
   

    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/ncx52BUu0ARYIishpcAGXjQQqnvzdy-c");
    
    const marketplaceConfig = getContractConfig("marketplace");
    if (!marketplaceConfig) {
        console.error('Marketplace contract configuration not found');
        return;
    }

    const contract = new ethers.Contract(marketplaceConfig.address, marketplaceConfig.abi, provider);

    
    const getOrderActive = async (_nftAddress: any, _tokenId: any) => {
        try {
            return await contract.getOrderActive(_nftAddress, _tokenId);
        } catch (error) {
            console.error("Error getting order active status:", error);
            return false;
        }
    };

    const areOrdersActive = async (nftAddress: any, tokenIds: any[]) => {
        try {
            return await contract.areOrdersActive(nftAddress, tokenIds);
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
