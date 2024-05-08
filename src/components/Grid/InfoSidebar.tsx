import React, { useState } from 'react';
import { Box, VStack, Text } from "@chakra-ui/react";
import styles from './InfoSidebar.module.css';
import { ethers } from 'ethers';

interface ColorReference {
  color: string;
  text: string;
}


interface InfoSidebarProps {
  tile: {
    x: number;
    y: number;
    tokenId: number;
    owner?: string;
    price?: number;
    isOnState: boolean;
  } | null;
  colorReferences: ColorReference[];
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ tile, colorReferences }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box className={styles.sidebar} style={{ width: collapsed ? '50px' : '200px', minHeight: collapsed ? '100px' : 'auto' }}>
      <div className={styles.toggleButton} onClick={toggleCollapse}>
        {collapsed ? '➕' : '➖'}
      </div>
      {!collapsed && (
        <VStack align="start" spacing={4}>
          <Text className={styles.title}>Color reference:</Text>
          {colorReferences.map((ref, index) => (
  <div key={index} className={styles.flexRow}>
    <Box className={styles.smallSquare} style={{ backgroundColor: ref.color }}></Box>
    <Text className={styles.detail}>{ref.text}</Text>
  </div>
))}
          <Text className={styles.title}>Details:</Text>
          {tile ? (
            <>
              <Text className={styles.detail}>Coordinates: ({tile.x}, {tile.y})</Text>
              <Text className={styles.detail}>Owner: {tile.owner || 'N/A'}</Text>
              <Text className={styles.detail}>Price: {tile.price ? `${ethers.utils.formatEther(tile.price.toString())} BAG` : 'N/A'}</Text>

            </>
          ) : (
            <Text className={styles.detail}>No tile selected</Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default InfoSidebar;
