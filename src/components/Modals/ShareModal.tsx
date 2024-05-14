// ShareModal.tsx
import React from 'react';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Text, Box } from '@chakra-ui/react';

const ShareModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    onOpen(); // Automatically open the modal when the component is rendered
  }, [onOpen]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share your uploaded content to X</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Share your uploaded content to X</Text>
            <Box border="1px solid #e2e8f0" borderRadius="md" p={4} h="300px">
              {/* Canvas placeholder */}
              <canvas id="shareCanvas" width="100%" height="100%" style={{ border: '1px solid #000' }}></canvas>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => alert('Share button clicked')}>
              Share
            </Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareModal;
