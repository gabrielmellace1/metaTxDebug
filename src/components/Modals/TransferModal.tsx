import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Text, Button, Input } from '@chakra-ui/react';


import InformationModal from './InformationModal';
//import useMetaTx from '../../hooks/contracts/useMetaTx';
import useTxChecker from '../../hooks/contracts/useTxChecker';
import useTx from '../../hooks/contracts/useTx';


type TransferModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tokenIds:string[];
    stateSelected:boolean;
};

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, tokenIds,stateSelected }) => {
  
  //const metaTx = useMetaTx();
  const txHook = useTx();
  
  const txChecker = useTxChecker();

  let contract = stateSelected? 'state':'square';

  const displayText = stateSelected 
        ? "Please enter the address to which to transfer your states" 
        : "Please enter the address to which to transfer your squares";


  const [address, setAddress] = useState('');

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalHeader, setInfoModalHeader] = useState("");
  const [infoModalBody, setInfoModalBody] = useState("");

  const handleTransferClick = async () => {
    
   
      try {
        
        const tx = await txHook(contract,'batchTransferFrom',[ address,tokenIds]);
        console.log("Tx is:"+tx);
  
        setInfoModalHeader("Processing transfer");
        setInfoModalBody("The transfer is being processed, one moment please. Tx hash: " + tx);
        setShowInfoModal(true); // Open informative modal
  
        try {
          if(tx){
            const status = await txChecker.checkTransactionStatus(tx,setInfoModalHeader,setInfoModalBody); // Use the context function
          
  
            if (status?.status) {
              setInfoModalHeader("Transfer succesfull");
              setInfoModalBody("Your items have been transfered succesfully");
            } else {
              setInfoModalHeader("Upps, transfer failed");
              setInfoModalBody("There was an error while transfering your items");
            }
          }
          
        } catch (error) {
          console.error("Error getting transaction status:", error);
          setInfoModalHeader("Transaction Status Unknown");
          setInfoModalBody("Unable to retrieve transaction status. Please try again later.");
        } finally {
          // Reset txHash after checking status
         
        }
  
  
      } catch (error) {
        console.error("Error approving BAG:", error);
        // Handle error appropriately, e.g., show error message to user
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
                step="0.01"
              />
              <Button colorScheme="red" mt={4} onClick={handleTransferClick} isDisabled={!address}>
                Confirm Transfer
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
