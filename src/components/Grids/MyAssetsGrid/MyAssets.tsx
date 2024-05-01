// Import Chakra UI components
import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import MyAssetsGrid from './MyAssetsGrid';
import MyAssetsActionBar from './MyAssetsActionBar';
import { AtlasTile } from '../../../types/atlasTypes';
import { useAuth } from '../../../context/auth.context';




const MyAssets: React.FC = () => {

  
    const [selectedTiles, setSelectedTiles] = useState<AtlasTile[] >([]);  // State to track selected tiles, assuming IDs are numbers
    const[stateSelected,setStateSelected] = useState(true); 
    let { userAddress } = useAuth();
    userAddress = userAddress?.toLowerCase();

    console.log(userAddress);

    return (
      <Flex direction="column" h="100vh">
        <MyAssetsActionBar 
        userAddress={userAddress} 
        selectedTiles={selectedTiles}
        stateSelected={stateSelected}
        />


        <Box flex="1" overflow="auto">
          <MyAssetsGrid  
          userAddress={userAddress} 
          setSelectedTiles={setSelectedTiles}
           stateSelected={stateSelected} 
           setStateSelected={setStateSelected} />
        </Box>
      </Flex>
    );
    
};

export default MyAssets;
