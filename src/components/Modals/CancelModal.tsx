import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Spinner } from '@chakra-ui/react';
import InformationModal from './InformationModal';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useMarketplace from '../../hooks/contracts/useMarketplace';
import { addresses } from '../../hooks/contracts/contractConfigs';
import useTx from '../../hooks/contracts/useTx';
import { useTranslation } from 'react-i18next';

type CancelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenIds: string[];
  stateSelected: boolean;
};

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
  const { t } = useTranslation();
  const txHook = useTx();
  const txChecker = useTxChecker();
  const marketplace = useMarketplace();
  let nftAddress = stateSelected ? addresses.state : addresses.square;

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = async () => {
    if (!marketplace) {
      setInfoModalHeader(t("marketplaceNotAvailable"));
      setInfoModalBody(t("marketplaceNotAvailableBody"));
      setShowInfoModal(true);
      return;
    }
    setIsLoading(true);
    try {
      if (!await marketplace.areOrdersActive(nftAddress, tokenIds)) {
        setInfoModalHeader(t("cancelationFailed"));
        setInfoModalBody(t("cancelationFailedBody"));
        setShowInfoModal(true);
        setIsLoading(false);
        return;
      }
      try {
        const tx = await txHook('marketplace', 'cancel', [nftAddress, tokenIds]);
        console.log("Tx is:" + tx);
        setInfoModalHeader(t("processingCancel"));
        setInfoModalBody(t("processingCancelBody", { tx }));
        setShowInfoModal(true);

        try {
          if (tx) {
            const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);
            if (status?.status) {
              setInfoModalHeader(t("cancelSuccessful"));
              setInfoModalBody(t("cancelSuccessfulBody"));
            } else {
              setInfoModalHeader(t("cancelFailed"));
              setInfoModalBody(t("cancelFailedBody"));
            }
          }
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader(t("transactionStatusUnknown"));
          setInfoModalBody(t("unableToRetrieveTransactionStatus"));
        }
      } catch (error) {
        console.error("Error approving BAG:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("cancelMarketplaceListing")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{t("cancelMarketplaceDescription")}</Text>
              <Button colorScheme="red" mt={4} onClick={handleCancelClick} disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : t("confirm")}
              </Button>
              <Button colorScheme="gray" mt={4} onClick={onClose}>
                {t("close")}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {showInfoModal && (
        <InformationModal isOpen={showInfoModal} header={infoModalHeader} text={infoModalBody} setShowInfoModal={setShowInfoModal} />
      )}
    </>
  );
};

export default CancelModal;
