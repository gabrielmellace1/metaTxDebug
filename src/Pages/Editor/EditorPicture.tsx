import React, { useEffect, useRef, useState } from 'react';
import { Text, Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { EditorSquare } from '../../types/allTypes';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import InformationModal from '../../components/Modals/InformationModal';
import useTx from '../../hooks/contracts/useTx';
import ShareModal from '../../components/Modals/ShareModal';
import { useTranslation } from 'react-i18next';

interface EditorPictureProps {
  setPreviewUrl: (url: string) => void;
  width: number;
  height: number;
  editorSquares: EditorSquare[];
}

const EditorPicture: React.FC<EditorPictureProps> = ({ setPreviewUrl, width, height, editorSquares }) => {
  const { t } = useTranslation();
  const editorRef = useRef<AvatarEditor>(null);
  const [image, setImage] = useState('/avatar.png');
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const txHook = useTx();
  const txChecker = useTxChecker();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const BATCH_SIZE = 25;

  const uploadToIPFS = async (formData: FormData) => {
    try {
      const response = await axios.post('https://ipfs.squares.town/api/v0/add?pin=true', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  const finalizeSquares = async (squares: EditorSquare[]) => {
    console.log("Finalizing squares...");
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Canvas context is not available.");
        return [];
      }

      const newSquares = [...squares]; // Create a new array to ensure state change

      const promises = squares.map((square, index) => {
        return new Promise<void>((resolve) => {
          if (square.normalizedSquare) {
            const offsetX = square.normalizedSquare.x * 10;
            const offsetY = (height / 10 - square.normalizedSquare.y - 1) * 10;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) return resolve();

            tempCanvas.width = 10;
            tempCanvas.height = 10;

            tempCtx.drawImage(ctx.canvas, offsetX, offsetY, 10, 10, 0, 0, 10, 10);

            tempCanvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = (reader.result as string) ?? '';
                  newSquares[index] = { ...square, blob, base64: base64String };

                  console.log(`Blob captured for square ${square.tokenId} at index ${index}`);
                  resolve();
                };
                reader.readAsDataURL(blob);
              } else {
                resolve();
              }
            }, 'image/png');
          } else {
            resolve();
          }
        });
      });

      await Promise.all(promises);
      return newSquares;
    }
    return [];
  };

  const handleUpload = async () => {
    setIsLoading(true);
    console.log("Uploading...");

    let finalizedSquares = await finalizeSquares(editorSquares); // Ensure squares are captured with latest zoom and rotation

    // const checkBlobs = async (squares: EditorSquare[]) => {
    //   const missingBlobs = squares.filter(square => !square.blob);
    //   if (missingBlobs.length > 0) {
    //     const newSquares = await finalizeSquares(missingBlobs);
    //     finalizedSquares = finalizedSquares.map(square => newSquares.find(ns => ns.tokenId === square.tokenId) || square);
    //   }
    // };

    const sortedSquares = [...finalizedSquares].sort((a, b) => a.tokenId - b.tokenId);
    console.log("Squares finalized:", sortedSquares);

    try {
      const uploadBatch = async (batch: EditorSquare[]) => {
        const formData = new FormData();
        batch.forEach((square, index) => {
          if (square.blob) {
            formData.append(`file${index}`, square.blob, `square-${square.tokenId}.png`);
          }
        });
        const response = await uploadToIPFS(formData);
        return response;
      };

      const batches = [];
      for (let i = 0; i < sortedSquares.length; i += BATCH_SIZE) {
        batches.push(sortedSquares.slice(i, i + BATCH_SIZE));
      }

      let allResponses = '';
      for (const batch of batches) {
        const response = await uploadBatch(batch);
        if (typeof response === 'string') {
          allResponses += response;
        } else {
          allResponses += JSON.stringify(response);
        }
      }

      const jsonResponseString = '[' + allResponses.split('\n').filter(Boolean).map(str => str.trim()).join(',') + ']';
      const jsonArrayResponse = JSON.parse(jsonResponseString);

      const responseArray = Array.isArray(jsonArrayResponse) ? jsonArrayResponse : [jsonArrayResponse];

      const fileHashes = responseArray.reduce((acc: { [x: string]: any; }, item: { Name: string; Hash: any; }) => {
        if (item.Name) {
          const tokenId = item.Name.split('-')[1].split('.')[0];
          acc[tokenId] = item.Hash;
        }
        return acc;
      }, {});

      const updatedSquares = sortedSquares.map(square => ({
        ...square,
        hashId: fileHashes[square.tokenId]
      }));

      const checkHashes = async (squares: EditorSquare[]) => {
        const missingHashes = squares.filter(square => !square.hashId);
        if (missingHashes.length > 0) {
          const newResponses = await uploadBatch(missingHashes);
          newResponses.forEach((res: any) => {
            const tokenId = res.Name.split('-')[1].split('.')[0];
            fileHashes[tokenId] = res.Hash;
          });
        }
      };

      await checkHashes(updatedSquares);

      const jsonHashes = JSON.stringify(fileHashes);

      const jsonBlob = new Blob([jsonHashes], { type: 'application/json' });
      const jsonFormData = new FormData();
      jsonFormData.append('file', jsonBlob, 'hashes.json');

      const jsonUploadResponse = await uploadToIPFS(jsonFormData);
      const jsonHash = jsonUploadResponse.Hash;

      console.log("JSON Hash:", jsonHash);

      const tokenIds = updatedSquares.map(sq => sq.tokenId);
      const stateId = updatedSquares[0]?.stateId || 0;
      let params = [];
      let funcName = "";

      if (stateId !== 0) {
        params = [stateId, jsonHash, url, title];
        funcName = "setSquareImagesForState";
      } else {
        params = [tokenIds, jsonHash, url, title];
        funcName = "setMultipleSquareImages";
      }

      const tx = await txHook('square', funcName, params);
      console.log("Tx is:", tx);

      setInfoModalHeader(t("processingContentUpload"));
      setInfoModalBody(t("processingContentUploadBody", { tx }));
      setShowInfoModal(true);

      if (tx) {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
        if (status?.status) {
          setInfoModalHeader(t("contentUploadSuccessful"));
          setInfoModalBody(t("contentUploadSuccessfulBody"));
          generateOwnedImage(finalizedSquares); // Pass finalizedSquares to generateOwnedImage
        } else {
          setInfoModalHeader(t("contentUploadFailed"));
          setInfoModalBody(t("contentUploadFailedBody"));
        }
      }
    } catch (error) {
      console.error('Failed to upload all squares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOwnedImage = (finalizedSquares: EditorSquare[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let imagesLoaded = 0;
    const coordinates: { x: number; y: number; }[] = [];

    finalizedSquares.forEach(square => {
      if (square.blob || square.base64) {
        const img = new Image();
        img.src = square.blob ? URL.createObjectURL(square.blob) : square.base64 as string;
        img.onload = () => {
          if (square.normalizedSquare && square.originalSquare) {
            const destX = square.normalizedSquare.x * 10;
            const destY = (height / 10 - square.normalizedSquare.y - 1) * 10;
            ctx.drawImage(img, 0, 0, img.width, img.height, destX, destY, 10, 10);

            coordinates.push({ x: square.originalSquare.x, y: square.originalSquare.y });

            imagesLoaded++;
            if (imagesLoaded === finalizedSquares.length) {
              canvas.toBlob(async (blob) => {
                if (blob) {
                  const formData = new FormData();
                  formData.append('image', blob, 'owned-image.png');
                  formData.append('coordinates', JSON.stringify(coordinates));

                  try {
                    const response = await axios.post('https://ipfs.squares.town/pixelService/share', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    console.log('Image successfully uploaded:', response.data);
                    setUploadedFileName(response.data);
                  } catch (error) {
                    console.error('Error uploading the image:', error);
                  }
                }
              }, 'image/png');
            }
          }
        };
        img.onerror = () => {
          console.error('Error loading image for square:', square);
          imagesLoaded++;
        };
      } else {
        imagesLoaded++;
      }
    });
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
    if (isLoading) return;

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
    return editorSquares.map(square => `(${square.originalSquare.x}, ${square.originalSquare.y})`).join(', ') || t('noCoordinates');
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
        <Text fontSize="sm" mb="2">{t('zoom')}</Text>
        <Slider defaultValue={1.2} min={0.1} max={10} step={0.01} onChange={v => setScale(v)} isDisabled={isLoading}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <Box width="full">
        <Text fontSize="sm" mb="2">{t('rotation')}</Text>
        <Slider defaultValue={0} min={0} max={360} step={1} onChange={v => setRotate(v)} isDisabled={isLoading}>
          <SliderTrack bg="blue.300">
            <SliderFilledTrack bg="blue.600" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <FormControl id="title" isRequired>
        <FormLabel>{t('title')}</FormLabel>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('enterTitle')} disabled={isLoading} />
      </FormControl>
      <FormControl id="url" isRequired>
        <FormLabel>{t('clickableUrl')}</FormLabel>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder={t('enterUrl')} disabled={isLoading} />
      </FormControl>
      <Button colorScheme="blue" onClick={handleUpload} isLoading={isLoading} loadingText={t('uploading')}>
        {t('upload')}
      </Button>
      <Box p={4} w="full" bg="gray.600" borderRadius="md">
        <Text fontSize="sm">{t('uploadingToCoordinates')}</Text>
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
      {uploadedFileName && <ShareModal fileName={uploadedFileName} />}
    </VStack>
  );
};

export default EditorPicture;
