import React, { useState } from 'react';
import EditorGrid from './EditorGrid';
import EditorPicture from './EditorPicture';
import { Box, Flex } from '@chakra-ui/react';

interface Square {
  x: number;
  y: number;
}

const EditorParent: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState('');

  const squareSize: number = 10; // Size of each square
  const gridRows: number = 100; // Total number of squares vertically
  const gridCols: number = 100; // Total number of squares horizontally


  const ownedSquares: Square[] = [
    { x: 500, y: 500 }, { x: 501, y: 500 }, { x: 502, y: 500 }, { x: 503, y: 500 }, { x: 504, y: 500 },
    { x: 505, y: 500 }, { x: 506, y: 500 }, { x: 507, y: 500 }, { x: 508, y: 500 }, { x: 509, y: 500 },
    { x: 500, y: 501 }, { x: 501, y: 501 }, { x: 502, y: 501 }, { x: 503, y: 501 }, { x: 504, y: 501 },
    { x: 505, y: 501 }, { x: 506, y: 501 }, { x: 507, y: 501 }, { x: 508, y: 501 }, { x: 509, y: 501 },
    { x: 500, y: 502 }, { x: 501, y: 502 }, { x: 502, y: 502 }, { x: 503, y: 502 }, { x: 504, y: 502 },
    { x: 505, y: 502 }, { x: 506, y: 502 }, { x: 507, y: 502 }, { x: 508, y: 502 }, { x: 509, y: 502 },
    
    { x: 500, y: 505 }, { x: 501, y: 505 }, { x: 502, y: 505 }, { x: 503, y: 505 }, { x: 504, y: 505 },
    { x: 505, y: 505 }, { x: 506, y: 505 }, { x: 507, y: 505 }, { x: 508, y: 505 }, { x: 509, y: 505 },
    { x: 500, y: 506 }, { x: 501, y: 506 }, { x: 502, y: 506 }, { x: 503, y: 506 }, { x: 504, y: 506 },
    { x: 505, y: 506 }, { x: 506, y: 506 }, { x: 507, y: 506 }, { x: 509, y: 506 },
    { x: 500, y: 507 }, { x: 501, y: 507 }, { x: 502, y: 507 }, { x: 503, y: 507 }, { x: 504, y: 507 },
    { x: 505, y: 507 }, { x: 506, y: 507 }, { x: 507, y: 507 }, { x: 508, y: 507 }, { x: 509, y: 507 },
    { x: 500, y: 508 }, { x: 501, y: 508 }, { x: 502, y: 508 }, { x: 503, y: 508 }, { x: 504, y: 508 },
    { x: 505, y: 508 }, { x: 506, y: 508 }, { x: 507, y: 508 }, { x: 508, y: 508 }, { x: 509, y: 508 },
    { x: 500, y: 509 }, { x: 501, y: 509 }, { x: 502, y: 509 }, { x: 503, y: 509 }, { x: 504, y: 509 },
    { x: 505, y: 509 }, { x: 506, y: 509 }, { x: 507, y: 509 }, { x: 508, y: 509 }, { x: 509, y: 509 }
  ];
  
  

  const minX = Math.min(...ownedSquares.map(sq => sq.x));
  const minY = Math.min(...ownedSquares.map(sq => sq.y));
  const maxX = Math.max(...ownedSquares.map(sq => sq.x));
  const maxY = Math.max(...ownedSquares.map(sq => sq.y));

  const pictureWidth = (maxX - minX + 1) * squareSize; // 10 pixels per square
  const pictureHeight = (maxY - minY + 1) * squareSize; // 10 pixels per square

  return (
    <Flex direction="column" align="center" m={4} p={5} bg="gray.900" color="white">
      <Flex direction={{ base: 'column', md: 'row' }} w="full">
        <Box flex="none" width={{ base: 'auto', md: '300px' }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorPicture setPreviewUrl={setPreviewUrl} width={pictureWidth} height={pictureHeight} ownedSquares={ownedSquares} />
        </Box>
        <Box flex="1" ml={{ base: 0, md: 4 }} mt={{ base: 4, md: 0 }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorGrid previewUrl={previewUrl} ownedSquares={ownedSquares} minX={minX} minY={minY} maxX={maxX} maxY={maxY} squareSize={squareSize} gridRows={gridRows} gridCols={gridCols} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default EditorParent;
