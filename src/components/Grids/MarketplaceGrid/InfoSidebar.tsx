import React, { useState } from 'react';
import { Box, VStack, Text } from "@chakra-ui/react";
import styles from './InfoSidebar.module.css';
import { ethers } from 'ethers';

interface InfoSidebarProps {
  tile: {
    x: number;
    y: number;
    tokenId: number;
    owner?: string;
    price?: number;
    isOnState: boolean;
  } | null;
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ tile }) => {
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
          <div className={styles.flexRow}>
            <Box className={styles.smallSquare} style={{ backgroundColor: 'red' }}></Box>
            <Text className={styles.detail}>On sale</Text>
          </div>
          <div className={styles.flexRow}>
            <Box className={styles.smallSquare} style={{ backgroundColor: 'blue' }}></Box>
            <Text className={styles.detail}>Your assets</Text>
          </div>
          <div className={styles.flexRow}>
            <Box className={styles.smallSquare} style={{ backgroundColor: 'pink' }}></Box>
            <Text className={styles.detail}>Your assets for sale</Text>
          </div>
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
