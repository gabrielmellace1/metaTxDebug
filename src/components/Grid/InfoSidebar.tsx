import React, { useMemo, useState } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import styles from './InfoSidebar.module.css';

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
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const colorRefMemo = useMemo(() => {
    return colorReferences.map((ref, index) => (
      <div key={index} className={styles.flexRow}>
        <Box className={styles.smallSquare} style={{ backgroundColor: ref.color }}></Box>
        <Text className={styles.detail}>{ref.text}</Text>
      </div>
    ));
  }, [colorReferences]);

  const details = useMemo(() => (
    tile ? (
      <>
        <Text className={styles.detail}>{t('coordinates', { x: tile.x, y: tile.y })}</Text>
        <Text className={styles.detail}>{t('owner', { owner: tile.owner || t('n/a') })}</Text>
        <Text className={styles.detail}>{t('price', { price: tile.price ? ethers.utils.formatEther(tile.price.toString()) : t('n/a') })}</Text>
      </>
    ) : (
      <Text className={styles.detail}>{t('noTileSelected')}</Text>
    )
  ), [tile, t]);

  return (
    <Box className={styles.sidebar} style={{ width: collapsed ? '50px' : '200px', minHeight: collapsed ? '100px' : 'auto' }}>
      <div className={styles.toggleButton} onClick={toggleCollapse}>
        {collapsed ? '➕' : '➖'}
      </div>
      {!collapsed && (
        <VStack align="start" spacing={4}>
          <Text className={styles.title}>{t('colorReference')}</Text>
          {colorRefMemo}
          <Text className={styles.title}>{t('details')}</Text>
          {details}
        </VStack>
      )}
    </Box>
  );
};

export default InfoSidebar;
