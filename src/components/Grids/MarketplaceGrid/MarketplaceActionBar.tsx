import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Button, Flex } from '@chakra-ui/react';
import { AtlasTile } from '../../../types/atlasTypes';
import BuyModal from '../../Modals/BuyModal';
import SellModal from '../../Modals/SellModal';
import CancelModal from '../../Modals/CancelModal';

type MarketplaceActionBarProps = {
  userAddress: string | undefined;
  selectedTiles: AtlasTile[] ;
  stateSelected: boolean;
};



const MarketplaceActionBar: React.FC<MarketplaceActionBarProps> = ({userAddress, selectedTiles,
  stateSelected }) => {
    
    

  const [canBuy, setCanBuy] = useState(true);
  const [canSell, setCanSell] = useState(true);
  const [canCancel, setCanCancel] = useState(true);
  const [itemCosts, setItemCosts] = useState<number[]>([]);
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
      if(selectedTiles[0].isOnState) {
     
        const firstCost = selectedTiles[0].price || 0;
      setItemCosts([firstCost]);

        setTokenIds([selectedTiles[0].tokenId?.toString() || '']); // Convert tokenId to string (if defined)
      }else {
        const costs = selectedTiles.map(tile => tile.price || 0);
        setItemCosts(costs);
        setTokenIds(selectedTiles.map((tile) => tile.tokenId?.toString() || ''));
      }
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
    <Flex justifyContent="space-between" p="4" bg="black.100" align="center">
      <HStack spacing="8">
        <VStack spacing="0">
          <Text fontSize="lg" fontWeight="bold">Squares Selected</Text>
          <Text fontSize="md">{tokenIds}</Text>
        </VStack>
        <VStack spacing="0">
          <Text fontSize="lg" fontWeight="bold">State Selected</Text>
          <Text fontSize="md">{stateSelected.toString()}</Text>
        </VStack>
        <VStack spacing="0">
          <Text fontSize="lg" fontWeight="bold">Amount in BAG</Text>
          <Text fontSize="md">{itemCosts.reduce((a, b) => a + b, 0)}</Text>
        </VStack>
      </HStack>
      <Box>
      <Button colorScheme="blue" mr="2" isDisabled={!canBuy} onClick={() => setBuyModalOpen(true)}>
          Buy
        </Button>
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
        <Button colorScheme="green" mr="2" isDisabled={!canSell} onClick={() => setSellModalOpen(true)}>Sell</Button>
        <Button colorScheme="red" isDisabled={!canCancel} onClick={() => setCancelModalOpen(true)}>Cancel </Button>
      </Box>
    </Flex>
  );
};

export default MarketplaceActionBar;
