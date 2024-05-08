import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Button, Flex } from '@chakra-ui/react';
import { AtlasToken } from '../../../types/atlasTypes';
import BuyModal from '../../Modals/BuyModal';
import SellModal from '../../Modals/SellModal';
import CancelModal from '../../Modals/CancelModal';
import { ethers } from 'ethers';
import styles from './MarketplaceActionBar.module.css';

type MarketplaceActionBarProps = {
  userAddress: string | undefined;
  selectedTiles: AtlasToken[] ;
  stateSelected: boolean;
};



const MarketplaceActionBar: React.FC<MarketplaceActionBarProps> = ({userAddress, selectedTiles,
  stateSelected }) => {
    
    

  const [canBuy, setCanBuy] = useState(true);
  const [canSell, setCanSell] = useState(true);
  const [canCancel, setCanCancel] = useState(true);
  const [itemCosts, setItemCosts] = useState<ethers.BigNumber[]>([]);
  const [tokenIds, setTokenIds] = useState<string[]>([]); // Initialize tokenIds as an empty array
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    if (selectedTiles.length === 0) {
      setCanBuy(false);
      setCanSell(false);
      setCanCancel(false);
      setItemCosts([]);
      setTokenIds([]);
      return; // Early return for empty selection
    }
    
   
      setCanBuy(true);
      setCanSell(true);
      setCanCancel(true);

    if(selectedTiles.length > 0) {
      
      setItemCosts(selectedTiles.map(tile => ethers.BigNumber.from(tile.price?.toString() || "0")));
      

      setTokenIds(selectedTiles.map((tile) => tile.tokenId?.toString() || ''));

   
      
      selectedTiles.forEach(tile => {
        if (tile.owner !== userAddress || !tile.forSale) {
          setCanCancel(false);

        }

        if (tile.owner !== userAddress || tile.forSale) {
          setCanSell(false);
        }

        if (tile.owner === userAddress || !tile.forSale) {
          setCanBuy(false);
        }
    });
    }
  

}, [selectedTiles, userAddress]); 


return (
  <Flex p="4" bg="black.100" align="center" className={styles.actionBar} w="100%">
    {/* Flex container to align items to the right */}
    <Flex ml="auto" alignItems="center">
      {/* Conditional rendering for "Amount in BAG" */}
      {canBuy && (
        <HStack spacing="4" mr="8"> {/* Right margin to ensure spacing between text and buttons */}
          <Text fontSize="lg" fontWeight="bold">Amount in BAG:</Text>
          <Text fontSize="md">{ethers.utils.formatEther(itemCosts.reduce((a, b) => a.add(b), ethers.BigNumber.from(0)))}</Text>
        </HStack>
      )}

      {/* Button group */}
      <HStack spacing="4">
        <Button colorScheme="blue" isDisabled={!canBuy} onClick={() => setBuyModalOpen(true)}>Buy</Button>
        <Button colorScheme="green" isDisabled={!canSell} onClick={() => setSellModalOpen(true)}>Sell</Button>
        <Button colorScheme="red" isDisabled={!canCancel} onClick={() => setCancelModalOpen(true)}>Cancel</Button>
      </HStack>
    </Flex>

    {/* Modals */}
    {buyModalOpen && (
      <BuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        itemCosts={itemCosts}
        tokenIds={tokenIds}
        stateSelected={stateSelected}
      />
    )}
    {sellModalOpen && (
      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        tokenIds={tokenIds}
        stateSelected={stateSelected}
      />
    )}
    {cancelModalOpen && (
      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        tokenIds={tokenIds}
        stateSelected={stateSelected}
      />
    )}
  </Flex>
);





};

export default MarketplaceActionBar;
