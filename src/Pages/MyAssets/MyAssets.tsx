// Import Chakra UI components
import React, { useState } from 'react';
import { Box, Flex, Portal } from '@chakra-ui/react';

import ActionBar from '../../components/ActionBar/ActionBar';
import { AtlasToken } from '../../types/atlasTypes';
import { useAuth } from '../../context/auth.context';
import Grid from '../../components/Grid/Grid';


const colorReferences = [
  { color: 'pink', text: 'Your assets on sale' },
  { color: 'blue', text: 'Your assets' },
];

const MyAssets: React.FC = () => {
    const [selectedTiles, setSelectedTiles] = useState<AtlasToken[]>([]);
    const [stateSelected, setStateSelected] = useState(true);
    let { userAddress } = useAuth();
    userAddress = userAddress?.toLowerCase();


    const buttonsToShow = {
      sell: true,
      buy: false,
      cancel: true,
      group: true,
      ungroup: true,
      upload: true,
      transfer: true,
    };


    return (
      <Flex direction="column" h="100vh" position="relative" overflow="hidden">
        <Box flex="1" overflow="auto">
          <Grid  
            userAddress={userAddress} 
            setSelectedTiles={setSelectedTiles}
            stateSelected={stateSelected} 
            setStateSelected={setStateSelected}
            highlightOnlyOwned={true} 
            colorReferences={colorReferences}/>
        </Box>

        {/* Using Portal to render ActionBar over content */}
        <Portal>
          <Box position="absolute" bottom="0" left="0" right="0" boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)">
            <ActionBar 
              userAddress={userAddress} 
              selectedTiles={selectedTiles}
              stateSelected={stateSelected}
              buttons={buttonsToShow}
            />
          </Box>
        </Portal>
      </Flex>
    );
};

export default MyAssets;
