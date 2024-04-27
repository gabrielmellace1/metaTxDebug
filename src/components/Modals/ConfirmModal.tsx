import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, HStack } from '@chakra-ui/react';

type ConfirmModalProps = {
  isOpen: boolean; // Flag to control modal visibility
  header: string; // Text for the modal header
  body: string; // Text for the modal body
  confirm?: string; // Optional text for confirm button (defaults to "Confirm")
  cancel?: string; // Optional text for cancel button (defaults to "Cancel")
  onConfirm?: () => void; // Function to execute on confirm button click
  onClose?: () => void; // Optional function to execute on modal close (e.g., escape key)
  setShowConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
  
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  header,
  body,
  confirm = 'Confirm',
  cancel = 'Cancel',
  onConfirm,
  setShowConfirmModal
}) => {

    const handleClose = () => {
        if (setShowConfirmModal) {
            setShowConfirmModal(false); // Close the modal by setting showInfoModal to false
        }
       
      };
  

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{body}</ModalBody>
        <HStack justifyContent="flex-end" mt={4}>
          <Button variant="outline" mr={3} onClick={handleClose}>
            {cancel}
          </Button>
          <Button colorScheme="blue" onClick={onConfirm}>
            {confirm}
          </Button>
        </HStack>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
