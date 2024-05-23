import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Input, Spinner } from '@chakra-ui/react';
import InformationModal from './InformationModal';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useTx from '../../hooks/contracts/useTx';

type TransferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenIds: string[];
  stateSelected: boolean;
};

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, tokenIds, stateSelected }) => {
  const txHook = useTx();
  const txChecker = useTxChecker();

  let contract = stateSelected ? 'state' : 'square';

  const displayText = stateSelected 
    ? "Please enter the address to which to transfer your states" 
    : "Please enter the address to which to transfer your squares";

  const [address, setAddress] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransferClick = async () => {
    setIsLoading(true);
    try {
      const tx = await txHook(contract, 'batchTransferFrom', [address, tokenIds]);
      console.log("Tx is:" + tx);

      setInfoModalHeader("Processing transfer");
      setInfoModalBody("The transfer is being processed, one moment please. Tx hash: " + tx);
      setShowInfoModal(true);

      try {
        const status = await txChecker.checkTransactionStatus(tx, setInfoModalHeader, setInfoModalBody);

        if (status?.status) {
          setInfoModalHeader("Transfer successful");
          setInfoModalBody("Your items have been transferred successfully");
        } else {
          setInfoModalHeader("Upps, transfer failed");
          setInfoModalBody("There was an error while transferring your items");
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
        setInfoModalHeader("Transaction Status Unknown");
        setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
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
          <ModalHeader>Transfer your NFTs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{displayText}</Text>
              <Input
                placeholder="Enter the address to which to transfer your nfts"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
              />
              <Button colorScheme="red" mt={4} onClick={handleTransferClick} isDisabled={!address || isLoading}>
                {isLoading ? <Spinner size="sm" /> : "Confirm Transfer"}
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
