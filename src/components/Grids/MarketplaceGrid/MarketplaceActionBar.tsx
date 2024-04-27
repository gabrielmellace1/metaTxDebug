import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Button, Flex } from '@chakra-ui/react';
import { AtlasTile } from '../../../types/atlasTypes';
import BuyModal from '../../Modals/BuyModal';

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
  const [totalCost, setTotalCost] = useState(0);
  const [tokenIds, setTokenIds] = useState<string[]>([]); // Initialize tokenIds as an empty array
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  useEffect(() => {
    if (selectedTiles.length === 0) {
      setCanBuy(false);
      setCanSell(false);
      setCanCancel(false);
      setTotalCost(0);
      setTokenIds([]);
      return; // Early return for empty selection
    }
    
   
      setCanBuy(true);
      setCanSell(true);
      setCanCancel(true);

    if(selectedTiles.length > 0) {
      if(selectedTiles[0].isOnState) {
     
        setTotalCost(selectedTiles[0].price || 0); // Use 0 if price is undefined
        setTokenIds([selectedTiles[0].tokenId?.toString() || '']); // Convert tokenId to string (if defined)
      }else {
        setTotalCost(selectedTiles.reduce((acc, tile) => acc + (tile.price || 0), 0));
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
          <Text fontSize="md">{totalCost}</Text>
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
            totalCost={totalCost}
            tokenIds={tokenIds}
            stateSelected={stateSelected}
          />
        )}
        <Button colorScheme="green" mr="2" isDisabled={!canSell}>Sell</Button>
        <Button colorScheme="red" isDisabled={!canCancel}>Cancel </Button>
      </Box>
    </Flex>
  );
};

export default MarketplaceActionBar;
