import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useTranslation } from 'react-i18next';

const WelcomeModal: FC = () => {
  const { t } = useTranslation();
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
        <ModalHeader>{t("welcomeTitle")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {t("welcomeMessage")}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
            {t("yes")}
          </Button>
          <Button colorScheme="red" onClick={handleClose}>
            {t("no")}
          </Button>
          <Button colorScheme="green" onClick={handleConfirm}>
            {t("tldr")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;
