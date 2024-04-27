import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';
import { ModalProps } from '@chakra-ui/react'; // Import ModalProps

type InformationModalProps = {
  isOpen: boolean;
  text: string; // Prop to receive modal text
  header:string;
  setShowInfoModal?: React.Dispatch<React.SetStateAction<boolean>>; // Optional prop for setShowInfoModal
};

const InformationModal: React.FC<InformationModalProps> = ({ isOpen,header, text, setShowInfoModal }) => {
  const handleClose = () => {
    if (setShowInfoModal) {
      setShowInfoModal(false); // Close the modal by setting showInfoModal to false
    }
   
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p>{text}</p>
        </ModalBody>
        <Button colorScheme="blue" mt={4} onClick={handleClose}>
          Accept
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default InformationModal;