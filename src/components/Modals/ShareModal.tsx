import React from 'react';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Text, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ShareModalProps {
  fileName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ fileName }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    onOpen(); // Automatically open the modal when the component is rendered
  }, [onOpen]);

  const webpageUrl = `https://ipfs.squares.town/pixelService/twitterCard?image=${fileName}`;
  const tweetText = t("shareDescription");
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(webpageUrl)}`;

  const handleShareClick = () => {
    window.open(tweetUrl, '_blank');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("shareTitle")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>{t("shareDescription")}</Text>
            <Box border="1px solid #e2e8f0" borderRadius="md" p={4} h="300px">
              <img src={`https://ipfs.squares.town/pixelService/share/${fileName}`} alt="Shared Content" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleShareClick}>
              {t("shareButton")}
            </Button>
            <Button variant="ghost" onClick={onClose}>{t("closeButton")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareModal;
