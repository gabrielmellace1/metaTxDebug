import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";

interface WelcomeModalProps {
  onConfirm: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstVisit");
    if (!isFirstVisit) {
      setIsOpen(true);
      localStorage.setItem("firstVisit", "true");
    }
  }, []);

  if (!isOpen) return null;

  const handleClose = () => setIsOpen(false);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to the history of blockchain</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Seems like it's the first time you are visiting the site, do you wanna find out what it is all about?
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => { onConfirm(); handleClose(); }}>
            Yes
          </Button>
          <Button colorScheme="red" onClick={handleClose}>
            No
          </Button>
          <Button colorScheme="green" onClick={() => { onConfirm(); handleClose(); }}>
            TLDR
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;
