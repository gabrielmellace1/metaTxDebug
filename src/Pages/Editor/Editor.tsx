import React, { useEffect, useState } from 'react';
import EditorGrid from './EditorGrid';
import EditorPicture from './EditorPicture';
import { Box, Flex } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import useStateContract from '../../hooks/contracts/useState';
import { tokenIdToPosition } from '../../helpers/GridHelper';

interface Square {
  x: number;
  y: number;
}

const EditorParent: React.FC = () => {
  const location = useLocation();
  const { tokenIds, stateSelected } = location.state; // Destructure directly if sure about structure or add checks

  const [squaresCoordinates, setSquaresCoordinates] = useState<Square[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const state = useStateContract();
  
  useEffect(() => {
    console.log("aaaaa");
    const fetchSquareTokenIds = async () => {
      if (!tokenIds || tokenIds.length === 0) {
        console.error("Token IDs are not provided.");
        return;
      }

      if (stateSelected) {
        
        const stateId = tokenIds[0];
        try {
          const squareTokenIds = await state?.getStateSquares(stateId);
          if (squareTokenIds) {
            const coordinates = squareTokenIds.map((tokenId: number) => tokenIdToPosition(tokenId));
            setSquaresCoordinates(coordinates);
          }
        } catch (error) {
          console.error("Error fetching square token IDs:", error);
        }
      } else {
        const coordinates = tokenIds.map((tokenId: number) => tokenIdToPosition(tokenId));
        setSquaresCoordinates(coordinates);
      }
    };

    fetchSquareTokenIds();
  }, []);

  const squareSize: number = 10; // Size of each square
  const gridRows: number = 100; // Total number of squares vertically
  const gridCols: number = 100; // Total number of squares horizontally

  const minX = Math.min(...squaresCoordinates.map(sq => sq.x));
  const minY = Math.min(...squaresCoordinates.map(sq => sq.y));
  const maxX = Math.max(...squaresCoordinates.map(sq => sq.x));
  const maxY = Math.max(...squaresCoordinates.map(sq => sq.y));

  const pictureWidth = (maxX - minX + 1) * squareSize; // 10 pixels per square
  const pictureHeight = (maxY - minY + 1) * squareSize; // 10 pixels per square

  return (
    <Flex direction="column" align="center" m={4} p={5} bg="gray.900" color="white">
      <Flex direction="row" w="full">
        <Box flex={{ base: 1, md: "none" }} maxWidth={{ base: "100%", md: "300px" }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorPicture setPreviewUrl={setPreviewUrl} width={pictureWidth} height={pictureHeight} ownedSquares={squaresCoordinates} />
        </Box>
        <Box flex={1} ml={{ base: 5, md: 4 }} mt={{ base: 0, md: 0 }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorGrid previewUrl={previewUrl} ownedSquares={squaresCoordinates} minX={minX} minY={minY} maxX={maxX} maxY={maxY} squareSize={squareSize} gridRows={gridRows} gridCols={gridCols} />
        </Box>
      </Flex>
    </Flex>
  );
  
  
};

export default EditorParent;