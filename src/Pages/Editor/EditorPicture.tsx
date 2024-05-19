import React, {  useEffect, useRef, useState } from 'react';
import { Text, Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { EditorSquare } from '../../types/allTypes';
//import useMetaTx from '../../hooks/contracts/useMetaTx';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import InformationModal from '../../components/Modals/InformationModal';
import useTx from '../../hooks/contracts/useTx';


interface EditorPictureProps {
  setPreviewUrl: (url: string) => void;
  width: number;
  height: number;
  editorSquares: EditorSquare[];
  setEditorSquares: React.Dispatch<React.SetStateAction<EditorSquare[]>>;
}

const EditorPicture: React.FC<EditorPictureProps> = ({ setPreviewUrl, width, height, editorSquares, setEditorSquares }) => {
  const editorRef = useRef<AvatarEditor>(null);
  const [image, setImage] = useState('/avatar.png');
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  //const metaTx = useMetaTx();
  const txHook = useTx();
  
  const txChecker = useTxChecker();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader,setInfoModalHeader] = useState("");
  const [infoModalBody,setInfoModalBody] = useState("");

  const uploadToIPFS = async (formData: EditorSquare | FormData) => {
    try {
      const response = await axios.post('https://ipfs.squares.town/api/v0/add?pin=true', formData);
      return response.data.Hash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const updatedSquares = await Promise.all(editorSquares.map(async (square) => {
        const formData = new FormData();
        if(square.blob)
        formData.append("file", square.blob, `square-${square.tokenId}.png`);
        const hash = await uploadToIPFS(formData);
        return { ...square, hashId: hash };
      }));

      updatedSquares.sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
      setEditorSquares(updatedSquares);
      
      const tokenIdToHash = updatedSquares.reduce((acc, cur) => ({ ...acc, [cur.tokenId]: cur.hashId }), {});
      const jsonBlob = new Blob([JSON.stringify(tokenIdToHash)], { type: 'application/json' });
      const formData = new FormData();
      formData.append("file", jsonBlob, "tokenIdToHash.json");
      const jsonHash = await uploadToIPFS(formData);

      console.log(jsonHash);
      
      console.log("Updated Squares"+updatedSquares);

      const tokenIds = updatedSquares.map(sq => sq.tokenId);
      console.log("tokenIds " + tokenIds);

      //const hashes =     updatedSquares.map(sq => sq.hashId);
      const stateId = updatedSquares[0].stateId;
      // Title & URL

      

      let params: any[] = [];
      let funcName = "";

      if(stateId!=0) {
         params = [stateId,jsonHash,url,title];
         funcName = "setSquareImagesForState";
      }
      else {
         params = [tokenIds,jsonHash,url,title];
         funcName = "setMultipleSquareImages";
      }

      
        const tx = await txHook('square',funcName,params);
    
        console.log("Tx is:"+tx);
    
        setInfoModalHeader("Processing content upload");
        setInfoModalBody("The content is being uploaded, one moment please. Tx hash: " + tx);
        setShowInfoModal(true); // Open informative modal
    
        try {
          if(tx){
            const status = await txChecker.checkTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
          
    
            if (status?.status) {
              setInfoModalHeader("Content upload succesfull");
              setInfoModalBody("The content has been uploaded succesfully ");
            } else {
              setInfoModalHeader("Upps, Content upload failed");
              setInfoModalBody("There was an error while uploading the content");
            }
          }
          
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader("Transaction Status Unknown");
          setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
        } finally {
          // Reset txHash after checking status
         
        }

     

    } catch (error) {
      console.error('Failed to upload all squares:', error);
    }
    setIsLoading(false);

  };

  useEffect(() => {
    console.log("Updated editorSquares:", editorSquares);
  }, [editorSquares]);

  const handleImageChange = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageUrl = canvas.toDataURL();
      setPreviewUrl(imageUrl);
    }
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    if (isLoading) return; // Ignore file handling when loading

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = e => {
      const imageURL = e.target?.result?.toString();
      if (imageURL) {
        setImage(imageURL);
      }
    };
    reader.readAsDataURL(file);
  };

  const displayCoordinates = () => {
    return editorSquares.map(square => `(${square.originalSquare.x}, ${square.originalSquare.y})`).join(', ') || 'No coordinates';
  };

  return (
    
    <VStack p={4} bg="gray.700" borderRadius="md" boxShadow="base" color="white" spacing={4}>
      <Dropzone onDrop={handleFileChange} disabled={isLoading}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} disabled={isLoading} />
            <div style={{ position: 'relative' }}>
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={width}
                height={height}
                border={50}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={rotate}
                onImageChange={handleImageChange}
                onImageReady={handleImageChange}
              />
              {isLoading && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}></div>}
            </div>
          </div>
        )}
      </Dropzone>
      <Box width="full">
        <Text fontSize="sm" mb="2">Zoom:</Text>
        <Slider defaultValue={1.2} min={0.1} max={10} step={0.01} onChange={v => setScale(v)} isDisabled={isLoading}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <Box width="full">
        <Text fontSize="sm" mb="2">Rotation:</Text>
        <Slider defaultValue={0} min={0} max={360} step={1} onChange={v => setRotate(v)} isDisabled={isLoading}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <FormControl id="title" isRequired>
        <FormLabel>Title:</FormLabel>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" disabled={isLoading} />
      </FormControl>
      <FormControl id="url" isRequired>
        <FormLabel>Clickable URL:</FormLabel>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL" disabled={isLoading} />
      </FormControl>
      <Button colorScheme="blue" onClick={handleUpload} isLoading={isLoading} loadingText="Uploading">
        Upload
      </Button>
      <Box p={4} w="full" bg="gray.600" borderRadius="md">
        <Text fontSize="sm">Uploading to Coordinates:</Text>
        <Text fontSize="xs">{displayCoordinates()}</Text>
      </Box>
      {showInfoModal && (
      <InformationModal 
        isOpen={showInfoModal}
        header={infoModalHeader} 
        text={infoModalBody} 
        setShowInfoModal={setShowInfoModal}
      />
    )}
    </VStack>
    
  );
  
};

export default EditorPicture;
