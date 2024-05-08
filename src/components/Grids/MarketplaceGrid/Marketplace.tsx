// Import Chakra UI components
import React, { useState } from 'react';
import { Box, Flex, Portal } from '@chakra-ui/react';
import MarketplaceGrid from './MarketplaceGrid';
import MarketplaceActionBar from './MarketplaceActionBar';
import { AtlasToken } from '../../../types/atlasTypes';
import { useAuth } from '../../../context/auth.context';

const Marketplace: React.FC = () => {
    const [selectedTiles, setSelectedTiles] = useState<AtlasToken[]>([]);
    const [stateSelected, setStateSelected] = useState(true);
    let { userAddress } = useAuth();
    userAddress = userAddress?.toLowerCase();

    return (
      <Flex direction="column" h="100vh" position="relative" overflow="hidden">
        <Box flex="1" overflow="auto">
          <MarketplaceGrid  
            userAddress={userAddress} 
            setSelectedTiles={setSelectedTiles}
            stateSelected={stateSelected} 
            setStateSelected={setStateSelected} />
        </Box>

        {/* Using Portal to render ActionBar over content */}
        <Portal>
          <Box position="absolute" bottom="0" left="0" right="0" boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)">
            <MarketplaceActionBar 
              userAddress={userAddress} 
              selectedTiles={selectedTiles}
              stateSelected={stateSelected}
            />
          </Box>
        </Portal>
      </Flex>
    );
};

export default Marketplace;
