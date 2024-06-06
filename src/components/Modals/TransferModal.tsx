import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Input, Spinner } from '@chakra-ui/react';
import InformationModal from './InformationModal';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import { useTranslation } from 'react-i18next';
import useSendTx from '../../hooks/contracts/useSendTx';

type TransferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenIds: string[];
  stateSelected: boolean;
};

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
  const { t } = useTranslation();
  const sendTx = useSendTx();
  const txChecker = useTxChecker();

  let contract = stateSelected ? 'state' : 'square';

  const displayText = stateSelected 
    ? t("enterAddressForStates") 
    : t("enterAddressForSquares");

  const [address, setAddress] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransferClick = async () => {
    setIsLoading(true);
    try {
      const tx = await sendTx(contract, 'batchTransferFrom', [address, tokenIds]);
      console.log("Tx is:" + tx);

      setInfoModalHeader(t("processingTransfer"));
      setInfoModalBody(t("processingTransferBody", { tx }));
      setShowInfoModal(true);

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

        if (status?.status) {
          setInfoModalHeader(t("transferSuccessful"));
          setInfoModalBody(t("transferSuccessfulBody"));
        } else {
          setInfoModalHeader(t("transferFailed"));
          setInfoModalBody(t("transferFailedBody"));
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader(t("transactionStatusUnknown"));
        setInfoModalBody(t("unableToRetrieveTransactionStatus"));
      }
    } catch (error) {
      console.error("Error approving BAG:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("transferNfts")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{displayText}</Text>
              <Input
                placeholder={t("enterTransferAddress")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
              />
              <Button colorScheme="red" mt={4} onClick={handleTransferClick} isDisabled={!address || isLoading}>
                {isLoading ? <Spinner size="sm" /> : t("confirmTransfer")}
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

export default TransferModal;
