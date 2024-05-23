import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, HStack, Spinner } from '@chakra-ui/react';

type ConfirmModalProps = {
  isOpen: boolean;
  header: string;
  body: string;
  confirm?: string;
  cancel?: string;
  onConfirm?: () => void;
  onClose?: () => void;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      await onConfirm();
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (setShowConfirmModal) {
      setShowConfirmModal(false);
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
          <Button colorScheme="blue" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : confirm}
          </Button>
        </HStack>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
