import React, { useEffect, useState } from 'react';
import EditorGrid from './EditorGrid';
import EditorPicture from './EditorPicture';
import { Box, Flex } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import useStateContract from '../../hooks/contracts/useState';
import { tokenIdToPosition } from '../../helpers/GridHelper';
import { EditorSquare } from '../../types/allTypes';



const EditorParent: React.FC = () => {
  const location = useLocation();
  const { tokenIds, stateSelected } = location.state; // Destructure directly if sure about structure or add checks

  const [editorSquares, setEditorSquares] = useState<EditorSquare[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const state = useStateContract();
  
  useEffect(() => {
    const fetchSquareTokenIds = async () => {
      if (!tokenIds || tokenIds.length === 0) {
        console.error("Token IDs are not provided.");
        return;
      }

      if (stateSelected) {
        const stateId = tokenIds[0]; // Assuming stateId is the first tokenId when state is selected
        try {
          const squareTokenIds = await state?.getStateSquares(stateId);
          if (squareTokenIds) {
            const editorSquareData = squareTokenIds.map((tokenId: number): EditorSquare => {
              const position = tokenIdToPosition(tokenId);
              return {
                originalSquare: position,
                tokenId: tokenId,
                stateId: stateId
              };
            });
            normalizeSquares(editorSquareData);
          }
        } catch (error) {
          console.error("Error fetching square token IDs:", error);
        }
      } else {
        const editorSquareData = tokenIds.map((tokenId: number): EditorSquare => {
          const position = tokenIdToPosition(tokenId);
          return {
            originalSquare: position,
            tokenId: tokenId,
            stateId: 0 // Default to 0 when not state selected
          };
        });
        normalizeSquares(editorSquareData);
      }
    };

   

    fetchSquareTokenIds();
  }, [stateSelected, tokenIds]);

    const normalizeSquares = (squares: EditorSquare[]) => {
    const minX = Math.min(...squares.map(sq => sq.originalSquare.x));
    const minY = Math.min(...squares.map(sq => sq.originalSquare.y));
    const normalizedSquares = squares.map(sq => ({
      ...sq,
      normalizedSquare: {
        x: sq.originalSquare.x - minX,
        y: sq.originalSquare.y - minY
      }
    }));
    setEditorSquares(normalizedSquares);
    
  };

  const squareSize: number = 10; // Size of each square
  const gridRows: number = 100; // Total number of squares vertically
  const gridCols: number = 100; // Total number of squares horizontally

  const minX = Math.min(...editorSquares.map(sq => sq.originalSquare.x));
  const minY = Math.min(...editorSquares.map(sq => sq.originalSquare.y));
  const maxX = Math.max(...editorSquares.map(sq => sq.originalSquare.x));
  const maxY = Math.max(...editorSquares.map(sq => sq.originalSquare.y));

  const pictureWidth = (maxX - minX + 1) * squareSize; // 10 pixels per square
  const pictureHeight = (maxY - minY + 1) * squareSize; // 10 pixels per square

  return (
    <Flex direction="column" align="center" m={4} p={5} bg="gray.900" color="white">
      <Flex direction="row" w="full">
        <Box flex={{ base: 1, md: "none" }} maxWidth={{ base: "100%", md: "300px" }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorPicture setPreviewUrl={setPreviewUrl} width={pictureWidth} height={pictureHeight} setEditorSquares={setEditorSquares} editorSquares={editorSquares} />
        </Box>
        <Box flex={1} ml={{ base: 5, md: 4 }} mt={{ base: 0, md: 0 }} bg="gray.700" p={4} borderRadius="md" boxShadow="xl">
          <EditorGrid previewUrl={previewUrl} setEditorSquares={setEditorSquares} editorSquares={editorSquares} minX={minX} minY={minY} maxX={maxX} maxY={maxY} squareSize={squareSize} gridRows={gridRows} gridCols={gridCols} />
        </Box>
      </Flex>
    </Flex>
  );
  
  
};

export default EditorParent;