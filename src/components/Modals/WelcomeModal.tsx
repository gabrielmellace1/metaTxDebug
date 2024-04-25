import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const WelcomeModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstVisit");
    if (!isFirstVisit) {
      setIsOpen(true);  // Open modal only if it's the user's first visit
      localStorage.setItem("firstVisit", "true");
    }
  }, []);

  const handleClose = () => setIsOpen(false);

  const handleConfirm = () => {
    handleClose();
    navigate("/about"); // Navigate to about only after user confirms
  };

  if (!isOpen) return null;

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
          <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
            Yes
          </Button>
          <Button colorScheme="red" onClick={handleClose}>
            No
          </Button>
          <Button colorScheme="green" onClick={handleConfirm}>
            TLDR
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;
