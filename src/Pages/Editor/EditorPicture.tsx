import React, { useRef, useState } from 'react';
import { Text ,Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';

interface EditorPictureProps {
  setPreviewUrl: (url: string) => void;
  width: number;
  height: number;
  ownedSquares:{ x: number; y: number }[];
}

const EditorPicture: React.FC<EditorPictureProps> = ({ setPreviewUrl, width, height, ownedSquares }) => {
  const editorRef = useRef<AvatarEditor>(null);
  const [image, setImage] = useState('/avatar.png');
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleImageChange = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageUrl = canvas.toDataURL();
      setPreviewUrl(imageUrl);
    }
  };

  const handleFileChange = (acceptedFiles: File[]) => {
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
    return ownedSquares.map(square => `(${square.x}, ${square.y})`).join(', ');
  };

  return (
    <VStack p={4} bg="gray.700" borderRadius="md" boxShadow="base" color="white" spacing={4}>
      <Dropzone onDrop={handleFileChange}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <AvatarEditor
              ref={editorRef}
              image={image}
              width={width}
              height={height}
              border={50}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={scale}
              rotate={rotate}
              onImageChange={handleImageChange}
              onImageReady={handleImageChange}
            />
          </div>
        )}
      </Dropzone>
      <Box width="full">
        <Text fontSize="sm" mb="2">Zoom:</Text>
        <Slider defaultValue={1.2} min={0.1} max={10} step={0.01} onChange={v => setScale(v)}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <Box width="full">
        <Text fontSize="sm" mb="2">Rotation:</Text>
        <Slider defaultValue={0} min={0} max={360} step={1} onChange={v => setRotate(v)}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <FormControl id="title" isRequired>
        <FormLabel>Title:</FormLabel>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" />
      </FormControl>
      <FormControl id="url" isRequired>
        <FormLabel>Clickable URL:</FormLabel>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL" />
      </FormControl>
      <Button colorScheme="blue">Upload</Button>
      <Box p={4} w="full" bg="gray.600" borderRadius="md">
        <Text fontSize="sm">Uploading to Coordinates:</Text>
        <Text fontSize="xs">{displayCoordinates()}</Text>
      </Box>
    </VStack>
  );
};

export default EditorPicture;
